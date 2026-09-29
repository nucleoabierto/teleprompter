import path from 'node:path';
import { hashPath } from './hash.js';
import { hasEntry } from './paths.js';

// Classifies each install entry by comparing the destination with the
// package resource and the recorded history:
//   create         - the destination does not exist
//   identical      - same content, nothing to do
//   managed-update - the destination still holds what a previous
//                    install wrote and the package offers an equal or
//                    later version, so overwriting it is safe
//   conflict       - different content not owned by the tool
export function buildPlan(pkgDir, manifest, destDir, creates, lock) {
  const record = lock.packages[manifest.name];
  const recorded = new Map((record?.files ?? []).map((f) => [f.target, f.sha256]));
  const updatesAllowed = semverAtLeast(manifest.version, record?.version);
  const resources = manifest.install.map(({ source, target }) => {
    const dest = path.join(destDir, target);
    if (!hasEntry(dest)) return { source, target, status: 'create' };
    const destHash = hashPath(dest);
    const status = destHash === hashPath(path.join(pkgDir, source)) ? 'identical'
      : updatesAllowed && recorded.get(target) === destHash ? 'managed-update'
        : 'conflict';
    return { source, target, status };
  });
  return {
    mkdirs: creates,
    resources,
    conflicts: resources.filter((r) => r.status === 'conflict'),
  };
}

// Downgrades are not managed updates: writing older content over a
// newer recorded install must surface as a conflict, not silently
// pass as safe.
function semverAtLeast(version, recordedVersion) {
  const parse = (v) => /^(\d+)\.(\d+)\.(\d+)$/.exec(v ?? '')?.slice(1).map(Number);
  const a = parse(version);
  const b = parse(recordedVersion);
  if (!a || !b) return false;
  for (let i = 0; i < 3; i++) {
    if (a[i] !== b[i]) return a[i] > b[i];
  }
  return true;
}
