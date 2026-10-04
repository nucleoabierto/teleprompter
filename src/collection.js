import fs from 'node:fs';
import path from 'node:path';
import { loadManifest } from './manifest.js';

// Peeks the root manifest without validating it: anything that is
// not parseable JSON with `collection: true` goes down the package
// pipeline, which reports the manifest's real errors.
export function isCollectionDir(dir) {
  try {
    const manifest = JSON.parse(
      fs.readFileSync(path.join(dir, 'teleprompter.json'), 'utf8'),
    );
    return typeof manifest === 'object' && manifest !== null
      && manifest.collection === true;
  } catch {
    return false;
  }
}

// The index names members by the basename of their path: package
// manifests must name their own directory, so the basename is the
// name — no member manifest needs to be read for resolution.
function indexEntries(manifest) {
  return manifest.packages.map((entry) => ({
    path: entry.path,
    name: path.basename(path.normalize(entry.path)),
  }));
}

// Resolves the selected names to member directories. A repeated
// name is one selection — the selection is a set — while a name
// that matches no index entry or several (duplicated basenames)
// makes the collection unusable for that selection.
export function resolveSelection(rootDir, manifest, names) {
  const entries = indexEntries(manifest);
  const byName = new Map();
  const duplicated = new Set();
  for (const entry of entries) {
    if (byName.has(entry.name)) duplicated.add(entry.name);
    else byName.set(entry.name, entry.path);
  }

  const errors = [];
  const selected = [...new Set(names)];
  for (const name of selected) {
    if (duplicated.has(name)) {
      errors.push(`"${name}" aparece varias veces en el índice de la colección`);
    } else if (!byName.has(name)) {
      errors.push(`la colección no tiene el paquete "${name}"`);
    }
  }
  if (errors.length > 0) {
    return { ok: false, errors, available: [...byName.keys()] };
  }
  return {
    ok: true,
    units: selected.map((name) => ({ name, dir: path.join(rootDir, byName.get(name)) })),
  };
}

// The human-readable index: name from the path basename, version
// and description from each member's own manifest — a member that
// does not load shows as invalid instead of hiding the rest.
export function describeIndex(rootDir, manifest) {
  return indexEntries(manifest).map(({ name, path: memberPath }) => {
    const { manifest: member } = loadManifest(path.join(rootDir, memberPath));
    if (member === null) return { name, invalid: true };
    return { name, version: member.version, description: member.description, invalid: false };
  });
}
