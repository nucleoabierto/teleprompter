import fs from 'node:fs';
import path from 'node:path';
import { hashPath } from './hash.js';
import { resolvesUnder } from './paths.js';

const ACTION = {
  create: 'create',
  identical: 'identical',
  'managed-update': 'overwrite',
  conflict: null, // taken from the resource's resolution
};

function copyResource(source, dest) {
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  const stat = fs.lstatSync(source);
  if (stat.isSymbolicLink()) {
    fs.symlinkSync(fs.readlinkSync(source), dest);
  } else if (stat.isDirectory()) {
    // verbatimSymlinks keeps links as links: dereferencing them would
    // make the written copy hash differently from the package, and the
    // next install would report a phantom conflict.
    fs.cpSync(source, dest, { recursive: true, verbatimSymlinks: true });
  } else {
    fs.copyFileSync(source, dest);
  }
}

// Materializes a resolved plan: creates the precondition directories,
// then applies exactly the action each resource was assigned. Every
// write —including the rm that precedes an overwrite— first proves the
// parent chain resolves under the destination root, so a symlinked
// directory can never redirect a write outside it.
// If a copy throws midway, the error carries `applied` — the actions
// already performed — so the caller can report them.
export function executePlan(pkgDir, destDir, plan) {
  const applied = [];
  try {
    for (const dir of plan.mkdirs) {
      const dest = path.join(destDir, dir);
      if (!resolvesUnder(destDir, dest)) {
        throw new Error(`la ruta destino escapa de la raíz: ${dest}`);
      }
      fs.mkdirSync(dest, { recursive: true });
      applied.push({ target: dir, action: 'mkdir' });
    }
    for (const r of plan.resources) {
      const action = ACTION[r.status] ?? r.resolution;
      if (action === undefined) {
        throw new Error(`plan sin resolver: ${r.target}`);
      }
      const dest = path.join(destDir, r.target);
      if (action === 'create' || action === 'overwrite') {
        if (!resolvesUnder(destDir, path.dirname(dest))) {
          throw new Error(`la ruta destino escapa de la raíz: ${dest}`);
        }
        if (action === 'overwrite') {
          fs.rmSync(dest, { recursive: true, force: true });
        }
        // Pushed before the copy so a failed write still reports the
        // destructive half it already ran.
        const entry = { target: r.target, action };
        applied.push(entry);
        copyResource(path.join(pkgDir, r.source), dest);
        entry.sha256 = hashPath(dest);
      } else {
        applied.push({ target: r.target, action });
      }
    }
  } catch (error) {
    error.applied = applied;
    throw error;
  }
  return applied;
}
