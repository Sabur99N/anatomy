import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { Point } from '../data/generators';

export class ModelSampler {
  private static loader = new GLTFLoader();

  static sample(url: string, count: number): Promise<Point[]> {
    return new Promise((resolve) => {
      this.loader.load(
        url,
        (gltf) => {
          const meshes: THREE.Mesh[] = [];

          gltf.scene.traverse((child) => {
            if ((child as THREE.Mesh).isMesh) {
              meshes.push(child as THREE.Mesh);
            }
          });

          if (meshes.length === 0) {
            console.warn(`No meshes found in model: ${url}`);
            resolve([]);
            return;
          }

          const sampler = new CombinedMeshSampler(meshes);
          const sampledPoints = sampler.sample(count);

          const box = new THREE.Box3().setFromPoints(sampledPoints);
          const size = new THREE.Vector3();
          box.getSize(size);
          const center = new THREE.Vector3();
          box.getCenter(center);

          const maxDim = Math.max(size.x, size.y, size.z);
          const scale = 2.0 / (maxDim || 1);

          const outputPoints: Point[] = sampledPoints.map((p) => ({
            x: (p.x - center.x) * scale,
            y: (p.y - center.y) * scale,
            z: (p.z - center.z) * scale,
          }));

          resolve(outputPoints);
        },
        undefined,
        (error) => {
          console.error('Error loading model:', error);
          resolve([]);
        }
      );
    });
  }
}

class CombinedMeshSampler {
  private distribution: number[] = [];
  private triangles: { a: THREE.Vector3; b: THREE.Vector3; c: THREE.Vector3 }[] = [];
  private totalArea = 0;

  constructor(meshes: THREE.Mesh[]) {
    meshes.forEach((mesh) => {
      const geometry = mesh.geometry;
      const positionAttribute = geometry.getAttribute('position');
      const indexAttribute = geometry.getIndex();

      mesh.updateMatrixWorld(true);

      const getPoint = (idx: number, target: THREE.Vector3) => {
        target.fromBufferAttribute(positionAttribute, idx);
        target.applyMatrix4(mesh.matrixWorld);
      };

      if (indexAttribute) {
        for (let i = 0; i < indexAttribute.count; i += 3) {
          const a = new THREE.Vector3();
          const b = new THREE.Vector3();
          const c = new THREE.Vector3();
          getPoint(indexAttribute.getX(i), a);
          getPoint(indexAttribute.getX(i + 1), b);
          getPoint(indexAttribute.getX(i + 2), c);
          this.addTriangle(a, b, c);
        }
      } else {
        for (let i = 0; i < positionAttribute.count; i += 3) {
          const a = new THREE.Vector3();
          const b = new THREE.Vector3();
          const c = new THREE.Vector3();
          getPoint(i, a);
          getPoint(i + 1, b);
          getPoint(i + 2, c);
          this.addTriangle(a, b, c);
        }
      }
    });
  }

  private addTriangle(a: THREE.Vector3, b: THREE.Vector3, c: THREE.Vector3) {
    const temp = new THREE.Vector3().copy(b).sub(a);
    const temp2 = new THREE.Vector3().copy(c).sub(a);
    temp.cross(temp2);
    const area = 0.5 * temp.length();

    this.totalArea += area;
    this.triangles.push({ a, b, c });
    this.distribution.push(this.totalArea);
  }

  public sample(count: number): THREE.Vector3[] {
    const points: THREE.Vector3[] = [];
    if (this.totalArea === 0) return points;

    for (let i = 0; i < count; i++) {
      const r = Math.random() * this.totalArea;
      let low = 0;
      let high = this.distribution.length - 1;
      let index = -1;

      while (low <= high) {
        const mid = Math.floor((low + high) / 2);
        if (r < this.distribution[mid]) {
          index = mid;
          high = mid - 1;
        } else {
          low = mid + 1;
        }
      }

      if (index !== -1) {
        points.push(this.getRandomPointInTriangle(this.triangles[index]));
      }
    }
    return points;
  }

  private getRandomPointInTriangle(tri: { a: THREE.Vector3; b: THREE.Vector3; c: THREE.Vector3 }): THREE.Vector3 {
    let r1 = Math.random();
    let r2 = Math.random();

    if (r1 + r2 > 1) {
      r1 = 1 - r1;
      r2 = 1 - r2;
    }

    const a = tri.a.clone().multiplyScalar(1 - r1 - r2);
    const b = tri.b.clone().multiplyScalar(r1);
    const c = tri.c.clone().multiplyScalar(r2);

    return a.add(b).add(c);
  }
}
