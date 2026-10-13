// Removes installed dependencies and build output, on any OS.
// Usage: node scripts/clean.mjs [frontend] [backend]   (no arguments = both)
import { rmSync } from 'node:fs';

const targets = {
  frontend: ['frontend/node_modules', 'frontend/dist', 'frontend/browser', 'frontend/.angular'],
  backend: ['backend/node_modules', 'backend/dist'],
};

const selected = process.argv.slice(2);
const parts = selected.length > 0 ? selected : Object.keys(targets);

for (const part of parts) {
  if (!targets[part]) {
    console.error(`Parte desconocida: ${part} (usar frontend o backend)`);
    process.exit(1);
  }
  for (const dir of targets[part]) {
    rmSync(dir, { recursive: true, force: true });
  }
  console.log(`${part} limpio`);
}
