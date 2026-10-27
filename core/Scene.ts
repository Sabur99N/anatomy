
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass';
import gsap from 'gsap';
import { Point } from '../data/generators';

const PARTICLE_VERTEX = `
  attribute float size;
  attribute float rotation;
  attribute vec3 customColor;
  attribute float randomValue;
  uniform float uTime;
  uniform float uPixelRatio;
  uniform float uSize;
  varying vec3 vColor;
  varying float vRotation;
  varying float vRandom;
  varying float vDepth;
  varying vec3 vNormal;
  varying vec3 vViewPosition;

  void main() {
    vColor = customColor;
    vRotation = rotation + uTime * 0.05 * randomValue;
    vRandom = randomValue;
    vec3 pos = position;
    pos.y += sin(uTime * 0.5 + randomValue * 6.28) * 0.006;
    pos.x += cos(uTime * 0.4 + randomValue * 6.28) * 0.004;
    vec3 normal = normalize(pos + 0.001);
    vNormal = normal;
    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
    vViewPosition = -mvPosition.xyz;
    gl_Position = projectionMatrix * mvPosition;
    gl_PointSize = size * uSize * uPixelRatio * (1.5 / -mvPosition.z);
    gl_PointSize = clamp(gl_PointSize, 1.0, 40.0);
    vDepth = -mvPosition.z;
  }
`;

const PARTICLE_FRAGMENT = `
  uniform float uTime;
  varying vec3 vColor;
  varying float vRotation;
  varying float vRandom;
  varying float vDepth;
  varying vec3 vNormal;
  varying vec3 vViewPosition;

  vec2 rot(vec2 uv, float a) {
    float s = sin(a), c = cos(a);
    return vec2(uv.x * c - uv.y * s, uv.x * s + uv.y * c);
  }

  void main() {
    vec2 uv = rot(gl_PointCoord - 0.5, vRotation);
    float d = length(uv);
    float alpha = smoothstep(0.5, 0.35, d);
    vec3 n = normalize(vNormal);
    vec3 vd = normalize(vViewPosition);
    vec3 ld = normalize(vec3(5.0, 5.0, 5.0));
    float diff = max(dot(n, ld), 0.0);
    vec3 col = vColor * (diff * 0.8 + 0.2);
    col += pow(max(dot(normalize(ld + vd), n), 0.0), 32.0) * 0.4;
    col *= sin(uTime * 0.8 + vRandom * 6.28) * 0.03 + 0.97;
    alpha *= clamp(1.3 - vDepth * 0.2, 0.4, 1.0);
    if (alpha < 0.05) discard;
    gl_FragColor = vec4(col, alpha);
  }
`;

export class AnatomyScene {
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private renderer: THREE.WebGLRenderer;
  private composer: EffectComposer;
  private controls: OrbitControls;
  private particles: THREE.Points;
  private material: THREE.ShaderMaterial;
  private container: HTMLElement;
  private clock = new THREE.Clock();
  private tween: gsap.core.Tween | null = null;
  private readonly count = 10000;

  constructor(container: HTMLElement) {
    this.container = container;
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x010103);

    this.camera = new THREE.PerspectiveCamera(52, container.clientWidth / container.clientHeight, 0.1, 100);
    const isMobile = container.clientWidth < 768;
    this.camera.position.set(0, 0, isMobile ? 5.4 : 4.5);

    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    this.renderer.setSize(container.clientWidth, container.clientHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(this.renderer.domElement);

    this.composer = new EffectComposer(this.renderer);
    this.composer.addPass(new RenderPass(this.scene, this.camera));
    this.composer.addPass(new UnrealBloomPass(
      new THREE.Vector2(container.clientWidth, container.clientHeight), 0.18, 0.05, 0.98
    ));

    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.enableZoom = false;
    this.controls.enablePan = false;
    this.controls.enableRotate = false;
    this.controls.autoRotate = true;
    this.controls.autoRotateSpeed = 1.4;

    const geo = new THREE.BufferGeometry();
    const positions = new Float32Array(this.count * 3);
    const colors = new Float32Array(this.count * 3);
    const sizes = new Float32Array(this.count);
    const rotations = new Float32Array(this.count);
    const randoms = new Float32Array(this.count);

    for (let i = 0; i < this.count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 4;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 4;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 4;
      sizes[i] = 0.6 + Math.random() * 0.4;
      rotations[i] = Math.random() * Math.PI * 2;
      randoms[i] = Math.random();
    }

    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geo.setAttribute('customColor', new THREE.BufferAttribute(colors, 3));
    geo.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
    geo.setAttribute('rotation', new THREE.BufferAttribute(rotations, 1));
    geo.setAttribute('randomValue', new THREE.BufferAttribute(randoms, 1));

    this.material = new THREE.ShaderMaterial({
      vertexShader: PARTICLE_VERTEX,
      fragmentShader: PARTICLE_FRAGMENT,
      uniforms: {
        uTime: { value: 0 },
        uPixelRatio: { value: Math.min(window.devicePixelRatio, 2) },
        uSize: { value: container.clientWidth < 768 ? 10 : 12 },
      },
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });

    this.particles = new THREE.Points(geo, this.material);
    this.scene.add(this.particles);

    this.animate();
    window.addEventListener('resize', this.onResize);
  }

  /** Instant apply — no animation */
  applyImmediate(points: Point[], colors: string[]) {
    this.applyPoints(points, colors);
  }

  /** Original morph animation */
  morphTo(points: Point[], colors: string[]) {
    this.tween?.kill();
    const progress = { t: 0 };
    const pos = this.particles.geometry.attributes.position.array as Float32Array;
    const col = this.particles.geometry.attributes.customColor.array as Float32Array;
    const startPos = Float32Array.from(pos);
    const startCol = Float32Array.from(col);

    this.tween = gsap.to(progress, {
      t: 1,
      duration: 2.2,
      ease: 'expo.inOut',
      onUpdate: () => {
        for (let i = 0; i < this.count; i++) {
          const p = points[i % points.length];
          const c = new THREE.Color(colors[i % colors.length]);
          pos[i * 3] = THREE.MathUtils.lerp(startPos[i * 3], p.x, progress.t);
          pos[i * 3 + 1] = THREE.MathUtils.lerp(startPos[i * 3 + 1], p.y, progress.t);
          pos[i * 3 + 2] = THREE.MathUtils.lerp(startPos[i * 3 + 2], p.z, progress.t);
          col[i * 3] = THREE.MathUtils.lerp(startCol[i * 3], c.r, progress.t);
          col[i * 3 + 1] = THREE.MathUtils.lerp(startCol[i * 3 + 1], c.g, progress.t);
          col[i * 3 + 2] = THREE.MathUtils.lerp(startCol[i * 3 + 2], c.b, progress.t);
        }
        this.particles.geometry.attributes.position.needsUpdate = true;
        this.particles.geometry.attributes.customColor.needsUpdate = true;
      },
    });
  }

  private applyPoints(points: Point[], colors: string[]) {
    const pos = this.particles.geometry.attributes.position.array as Float32Array;
    const col = this.particles.geometry.attributes.customColor.array as Float32Array;
    for (let i = 0; i < this.count; i++) {
      const p = points[i % points.length];
      const c = new THREE.Color(colors[i % colors.length]);
      pos[i * 3] = p.x;
      pos[i * 3 + 1] = p.y;
      pos[i * 3 + 2] = p.z;
      col[i * 3] = c.r;
      col[i * 3 + 1] = c.g;
      col[i * 3 + 2] = c.b;
    }
    this.particles.geometry.attributes.position.needsUpdate = true;
    this.particles.geometry.attributes.customColor.needsUpdate = true;
  }

  playAnimation(type: string) {
    if (type === 'heartbeat') {
      gsap.to(this.particles.scale, { x: 1.06, y: 1.06, z: 1.06, duration: 0.25, yoyo: true, repeat: 1 });
    } else if (type === 'breathe') {
      gsap.to(this.particles.scale, { x: 1.1, y: 1.1, z: 1.1, duration: 2.5, yoyo: true, repeat: 1 });
    }
  }

  private animate = () => {
    requestAnimationFrame(this.animate);
    const t = this.clock.getElapsedTime();
    this.material.uniforms.uTime.value = t;
    this.particles.rotation.y = t * 0.35;
    this.controls.update();
    this.composer.render();
  };

  private onResize = () => {
    const w = this.container.clientWidth;
    const h = this.container.clientHeight;
    this.renderer.setSize(w, h);
    this.camera.aspect = w / h;
    this.camera.position.z = w < 768 ? 5.4 : w < 1024 ? 4.9 : 4.5;
    this.camera.updateProjectionMatrix();
    this.composer.setSize(w, h);
    this.material.uniforms.uPixelRatio.value = Math.min(window.devicePixelRatio, 2);
    this.material.uniforms.uSize.value = w < 768 ? 10 : 12;
  };

  dispose() {
    this.tween?.kill();
    window.removeEventListener('resize', this.onResize);
    this.renderer.dispose();
  }
}
