import { execSync } from 'node:child_process';
import { existsSync, mkdirSync, readdirSync, statSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const outDir = path.join(root, 'public', 'models');

const MODELS = [
  { id: 'brain', input: 'public/human_brain/scene.gltf' },
  { id: 'heart', input: 'public/realistic_human_heart/scene.gltf' },
  { id: 'lungs', input: 'public/realistic_human_lungs/scene.gltf' },
  { id: 'stomach', input: 'public/stomach_-_organ/scene.gltf' },
  { id: 'kidneys', input: 'public/human_kidney/scene.gltf' },
  { id: 'eye', input: 'public/realistic_human_eye.glb' },
  { id: 'skeleton', input: 'public/skeleton/scene.gltf' },
];

function formatSize(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

function getFolderSize(dir) {
  if (!existsSync(dir)) return 0;
  let total = 0;
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      total += getFolderSize(full);
    } else if (!entry.name.includes('license')) {
      total += statSync(full).size;
    }
  }
  return total;
}

function getInputSize(inputPath) {
  const full = path.join(root, inputPath);
  if (!existsSync(full)) return 0;
  if (full.endsWith('.glb')) return statSync(full).size;
  return getFolderSize(path.dirname(full));
}

mkdirSync(outDir, { recursive: true });

const gltfTransform = path.join(root, 'node_modules', '.bin', 'gltf-transform');

console.log('Compressing anatomical models with Draco + mesh simplification...\n');

let totalBefore = 0;
let totalAfter = 0;

for (const { id, input } of MODELS) {
  const inputFull = path.join(root, input);
  const outputFull = path.join(outDir, `${id}.glb`);

  if (!existsSync(inputFull)) {
    console.warn(`  SKIP ${id}: ${input} not found`);
    continue;
  }

  const before = getInputSize(input);
  totalBefore += before;

  try {
    execSync(
      `"${gltfTransform}" optimize "${inputFull}" "${outputFull}" ` +
        `--compress draco ` +
        `--texture-compress webp ` +
        `--simplify ` +
        `--simplify-ratio 0.75 ` +
        `--simplify-error 0.0005`,
      { stdio: 'pipe', cwd: root }
    );

    const after = statSync(outputFull).size;
    totalAfter += after;
    const saved = before > 0 ? ((1 - after / before) * 100).toFixed(1) : '0';
    console.log(
      `  ✓ ${id.padEnd(10)} ${formatSize(before).padStart(10)} → ${formatSize(after).padStart(10)}  (${saved}% smaller)`
    );
  } catch (err) {
    const msg = err.stderr?.toString() || err.message;
    console.error(`  ✗ ${id} failed:`, msg.slice(0, 200));
  }
}

if (totalBefore > 0) {
  console.log(
    `\n  Total: ${formatSize(totalBefore)} → ${formatSize(totalAfter)} (${((1 - totalAfter / totalBefore) * 100).toFixed(1)}% reduction)`
  );
}
console.log(`  Output: public/models/*.glb\n`);
