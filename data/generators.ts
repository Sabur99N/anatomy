
import * as THREE from 'three';

export interface Point {
  x: number;
  y: number;
  z: number;
  region?: string;
  color?: string;
}

export const generators = {
  brain: (count: number): Point[] => {
    const points: Point[] = [];
    for (let i = 0; i < count; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);

      // Image 1: Complex convolutions (Gyri and Sulci)
      if (Math.random() > 0.15) {
        // Cerebrum
        const baseR = 1.0;
        // High-frequency complex convolutions (Gyri and Sulci)
        const gyrus = Math.sin(theta * 18 + phi * 10) * Math.cos(phi * 16) * 0.16 +
          Math.sin(theta * 32 + phi * 25) * 0.05 +
          Math.sin(theta * 45) * 0.02; // Fine detail

        // Deep Longitudinal Fissure separation
        const xCoord = Math.sin(phi) * Math.cos(theta);
        const fissureWidth = 0.065;
        const fissureDepth = Math.abs(xCoord) < fissureWidth ? 0.72 : 1.0;

        const r = (baseR + gyrus) * fissureDepth;
        const x = r * Math.sin(phi) * Math.cos(theta) * 0.95; // Slightly more narrow
        const y = r * Math.cos(phi) * 0.9 + 0.25;
        const z = r * Math.sin(phi) * Math.sin(theta) * 1.25; // Lateral elongation
        points.push({ x, y, z });
      } else {
        // Image 1 bottom: Brainstem and Cerebellum
        const r = 0.48;
        const isStem = Math.random() > 0.6;
        const x = isStem ? (Math.random() - 0.5) * 0.15 : r * Math.sin(phi) * Math.cos(theta) * 0.7;
        const y = isStem ? -0.8 - Math.random() * 0.6 : r * Math.cos(phi) * 0.5 - 0.7;
        const z = isStem ? (Math.random() - 0.5) * 0.15 : r * Math.sin(phi) * Math.sin(theta) * 0.8 - 0.35;
        points.push({ x, y, z });
      }
    }
    return points;
  },

  heart: (count: number): Point[] => {
    const points: Point[] = [];
    for (let i = 0; i < count; i++) {
      const rand = Math.random();
      if (rand > 0.35) {
        // Main Muscle Body (Ventricles/Atria)
        const u = Math.random() * Math.PI * 2;
        const v = Math.random() * Math.PI;
        // More anatomical heart shape
        const x = Math.sin(v) * (16 * Math.sin(u) - 5 * Math.sin(2 * u) - 2 * Math.sin(3 * u));
        const y = 10 * Math.cos(v) * (1.0 + 0.2 * Math.sin(u));
        const z = Math.sin(v) * (15 * Math.cos(u) - 6 * Math.cos(2 * u) - 3 * Math.cos(3 * u) - Math.cos(4 * u));
        points.push({ x: x * 0.048, y: y * 0.052 - 0.25, z: z * 0.058 });
      } else if (rand > 0.1) {
        // Image 2: Aorta Arch and Superior Vena Cava
        const t = Math.random() * Math.PI;
        const isAorta = Math.random() > 0.5;
        if (isAorta) {
          const archTheta = t * 1.2;
          const r = 0.12;
          const tubeA = Math.random() * Math.PI * 2;
          const archX = Math.cos(archTheta) * 0.35 - 0.05;
          const archY = Math.sin(archTheta) * 0.5 + 0.4;
          points.push({
            x: archX + Math.cos(tubeA) * r,
            y: archY,
            z: Math.sin(tubeA) * r
          });
        } else {
          // Superior Vena Cava (Blue tube in Image 2)
          const h = Math.random() * 0.8;
          const r = 0.1;
          const a = Math.random() * Math.PI * 2;
          points.push({ x: Math.cos(a) * r + 0.25, y: h + 0.3, z: Math.sin(a) * r + 0.1 });
        }
      } else {
        // Coronary Arteries (Surface Detail)
        const t = Math.random() * Math.PI * 2;
        const h = Math.random() * 1.5 - 0.5;
        const r = 0.45 * (1.0 - Math.abs(h) * 0.3);
        points.push({ x: Math.cos(t) * r, y: h - 0.2, z: Math.sin(t) * r + 0.2 });
      }
    }
    return points;
  },

  lungs: (count: number): Point[] => {
    const points: Point[] = [];
    const perLung = count * 0.38;

    // Image 3: Trachea & Bronchial Tree
    for (let i = 0; i < count * 0.24; i++) {
      let y = Math.random() * 1.4 - 0.2;
      let x = 0, z = 0;
      if (y < 0.7) {
        // Recursive branching simulation
        const side = i % 2 === 0 ? 1 : -1;
        const prog = 1.0 - (y + 0.2) / 0.9;
        const angle = Math.pow(prog, 0.7) * 0.8 * side;
        const r = 0.06 * (1.1 - prog);
        const theta = Math.random() * Math.PI * 2;
        points.push({ x: Math.sin(angle) * (1.0 - prog) + Math.cos(theta) * r, y, z: Math.sin(theta) * r });
      } else {
        // Trachea (windpipe)
        const r = 0.08;
        const theta = Math.random() * Math.PI * 2;
        points.push({ x: Math.cos(theta) * r, y, z: Math.sin(theta) * r });
      }
    }

    // Right Lung (3 Lobes)
    for (let i = 0; i < perLung; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.random() * Math.PI;
      let r = 0.92 + Math.random() * 0.12;
      r *= 1 + Math.sin(phi * 3.5) * Math.cos(theta * 2.0) * 0.08; // More complex lobar structure
      points.push({
        x: Math.sin(phi) * Math.cos(theta) * r * 0.78 + 0.65,
        y: Math.cos(phi) * r * 1.05,
        z: Math.sin(phi) * Math.sin(theta) * r * 0.62,
      });
    }
    // Left Lung (2 Lobes, Cardiac Notch)
    for (let i = 0; i < perLung; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.random() * Math.PI;
      let r = 0.85 + Math.random() * 0.15;
      const notch = (theta > 1.2 && theta < 2.8) ? (0.65 + 0.1 * Math.sin(phi * 4.0)) : 1.0;
      points.push({
        x: Math.sin(phi) * Math.cos(theta) * r * 0.68 * notch - 0.65,
        y: Math.cos(phi) * r * 1.0,
        z: Math.sin(phi) * Math.sin(theta) * r * 0.58,
      });
    }
    return points;
  },

  stomach: (count: number): Point[] => {
    const points: Point[] = [];
    for (let i = 0; i < count; i++) {
      const t = Math.random() * Math.PI * 2;
      const s = Math.random() * Math.PI;
      // Image 4: J-shape with distinct Fundus and Pylorus
      const prog = s / Math.PI;
      const fundusBulge = prog < 0.28 ? 1.45 : 1.0;
      const bend = Math.pow(prog, 1.9);

      const r = (0.32 + Math.sin(s) * 0.28) * fundusBulge;
      const x = Math.cos(t) * r + bend * 0.75;
      const y = (1.3 - s * 0.95) - 0.35;
      const z = Math.sin(t) * r * 0.85;

      points.push({ x: x - 0.4, y, z });
    }
    return points;
  },

  kidneys: (count: number): Point[] => {
    const points: Point[] = [];
    const perKidney = count / 2;
    ['left', 'right'].forEach(side => {
      const xOffset = side === 'right' ? 0.8 : -0.8;
      for (let i = 0; i < perKidney; i++) {
        const rand = Math.random();
        if (rand > 0.2) {
          // Image 5: Outer Renal Capsule (Bean shape with hilum)
          const t = (Math.random() - 0.5) * Math.PI * 2;
          const s = (Math.random() - 0.5) * 2;
          const bean = 0.4 * (1 - 0.42 * Math.cos(t));
          const x = bean * Math.cos(t) + xOffset;
          const y = s * 0.48;
          const z = bean * Math.sin(t) * 0.68;
          points.push({ x, y, z });
        } else {
          // Image 5: Internal structures (Renal Pelvis / Calyces)
          const h = (Math.random() - 0.5) * 0.6;
          const r = 0.08 * (1.0 - Math.abs(h));
          const a = Math.random() * Math.PI * 2;
          const innerX = side === 'right' ? xOffset - 0.2 : xOffset + 0.2;
          points.push({ x: innerX + Math.cos(a) * r, y: h, z: Math.sin(a) * r });
        }
      }
    });
    return points;
  },

  eye: (count: number): Point[] => {
    const points: Point[] = [];
    // Image 6: Layers of the eye
    // 1. Sclera (Outer White Sphere)
    for (let i = 0; i < count * 0.65; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const r = 0.65;
      points.push({
        x: r * Math.sin(phi) * Math.cos(theta),
        y: r * Math.sin(phi) * Math.sin(theta),
        z: r * Math.cos(phi),
      });
    }
    // 2. Cornea Bulge (Clear front part)
    for (let i = 0; i < count * 0.15; i++) {
      const theta = Math.random() * Math.PI * 2;
      const r = Math.random() * 0.35;
      const bulge = 0.1 * (1.0 - (r / 0.35));
      points.push({ x: Math.cos(theta) * r, y: Math.sin(theta) * r, z: 0.62 + bulge });
    }
    // 3. Iris and Pupil
    for (let i = 0; i < count * 0.1; i++) {
      const a = Math.random() * Math.PI * 2;
      const r = Math.random() * 0.3;
      points.push({ x: Math.cos(a) * r, y: Math.sin(a) * r, z: 0.58 });
    }
    // 4. Optic Nerve
    for (let i = 0; i < count * 0.1; i++) {
      const h = Math.random() * 0.6;
      const a = Math.random() * Math.PI * 2;
      const r = 0.14;
      points.push({ x: Math.cos(a) * r, y: Math.sin(a) * r - 0.08, z: -0.65 - h });
    }
    return points;
  },

  skeleton: (count: number): Point[] => {
    const points: Point[] = [];
    // Image 7: Full framework
    // Skull
    for (let i = 0; i < count * 0.12; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const r = 0.35;
      points.push({ x: r * Math.sin(phi) * Math.cos(theta), y: r * Math.cos(phi) + 1.5, z: r * Math.sin(phi) * Math.sin(theta) });
    }
    // Spine
    for (let i = 0; i < count * 0.18; i++) {
      const y = (i / (count * 0.18)) * 2.5 - 1.0;
      const a = Math.random() * Math.PI * 2;
      const r = 0.08;
      points.push({ x: Math.cos(a) * r, y, z: Math.sin(a) * r - 0.22 });
    }
    // Ribcage (12 segments)
    for (let i = 0; i < count * 0.32; i++) {
      const rib = Math.floor(Math.random() * 12);
      const t = (Math.random() - 0.5) * Math.PI * 1.9;
      const y = 1.0 - rib * 0.14;
      const r = 0.6 - (rib * 0.015);
      points.push({ x: Math.sin(t) * r, y, z: Math.cos(t) * r * 0.45 });
    }
    // Pelvis
    for (let i = 0; i < count * 0.12; i++) {
      const a = Math.random() * Math.PI * 2;
      const r = 0.52;
      points.push({ x: Math.cos(a) * r, y: -0.55 + (Math.random() - 0.5) * 0.35, z: Math.sin(a) * r * 0.65 });
    }
    // Limbs
    for (let i = 0; i < count * 0.26; i++) {
      const side = Math.random() > 0.5 ? 1 : -1;
      const part = Math.random();
      if (part < 0.5) { // Arms
        const h = Math.random() * 1.5 - 0.2;
        const r = 0.05;
        const a = Math.random() * Math.PI * 2;
        points.push({ x: Math.cos(a) * r + (0.6 * side), y: h, z: Math.sin(a) * r });
      } else { // Legs
        const h = Math.random() * 2.2 - 2.8;
        const r = 0.07;
        const a = Math.random() * Math.PI * 2;
        points.push({ x: Math.cos(a) * r + (0.35 * side), y: h + 1.0, z: Math.sin(a) * r });
      }
    }
    return points;
  },

  muscles: (count: number): Point[] => {
    const points: Point[] = [];
    for (let i = 0; i < count; i++) {
      const u = Math.random() * Math.PI * 2;
      const v = (Math.random() - 0.5) * 2;

      // Image 8: Anatomical silhouette with muscle groups
      const shoulderWidth = 0.85;
      const waistWidth = 0.55;
      const hipWidth = 0.72;

      let width = waistWidth;
      if (v > 0) width = THREE.MathUtils.lerp(waistWidth, shoulderWidth, v);
      else width = THREE.MathUtils.lerp(waistWidth, hipWidth, -v);

      let definition = 1.0;
      // Image 8 features: Pectorals, Deltoids, Abs
      if (v > 0.5 && v < 0.85 && Math.abs(u) < 1.1) definition = 1.22; // Chest
      if (v > -0.15 && v < 0.35 && Math.abs(u) < 0.8) definition = 1.08; // Abs
      if (Math.abs(v) > 0.8 && Math.abs(u - Math.PI / 2) < 0.5) definition = 1.15; // Shoulders

      const x = Math.cos(u) * width * definition;
      const y = v * 1.4;
      const z = Math.sin(u) * width * 0.48 * definition;

      points.push({ x, y, z });
    }
    return points;
  }
};
