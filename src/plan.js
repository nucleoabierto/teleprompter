import path from 'node:path';
import { hashPath } from './hash.js';
import { classifyResource } from './drift.js';
import { hasEntry, personalizationTarget, resolvesUnder } from './paths.js';

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
  const recorded = new Map(
    (record?.files ?? []).map((f) => [path.normalize(f.target), f.sha256]),
  );
  const updatesAllowed = semverAtLeast(manifest.version, record?.version);
  const resources = manifest.install.map(({ source, target }) => {
    const dest = path.join(destDir, target);
    if (!hasEntry(dest)) {
      // A write whose parent chain escapes the root cannot be a
      // create: the path may be free here but not where it lands.
      const status = resolvesUnder(destDir, path.dirname(dest)) ? 'create' : 'conflict';
      return { source, target, status };
    }
    const destHash = hashPath(dest);
    const status = destHash === hashPath(path.join(pkgDir, source)) ? 'identical'
      : updatesAllowed && recorded.get(path.normalize(target)) === destHash
        ? 'managed-update'
        : 'conflict';
    if (status !== 'identical' && status !== 'conflict'
        && !resolvesUnder(destDir, path.dirname(dest))) {
      return { source, target, status: 'conflict' };
    }
    return { source, target, status };
  });
  return {
    mkdirs: creates,
    resources,
    conflicts: resources.filter((r) => r.status === 'conflict'),
  };
}

// The update plan adds a third comparison to the install plan: the
// incoming content against the recorded hash tells whether the
// version itself changed the resource, so each entry classifies by
// what the version brings and what the user did with it:
//   create    - the destination does not exist: a resource new in
//               the version or one the user deleted — it is written
//               again either way
//   identical - the destination already holds the incoming content
//   update    - the version changed the resource (incoming differs
//               from the recorded hash) and the destination is still
//               intact, so overwriting it is safe
//   conflict  - the destination holds content that is not provably
//               ours (a local edit or foreign) and differs from what
//               the version offers — the user decides
// Recorded targets the incoming manifest no longer ships are
// retired: intact ones are removed (`retire`) — what is ours and
// untouched is managed — while modified or unverifiable ones
// degrade to conflicts marked `removal`, where `overwrite` means
// remove and `skip` means keep; removal conflicts carry no `source`
// — the executor must check `removal` before any copy. A retired
// target already gone leaves the plan silently. Entries never
// written (`skip`) and the managed guide — rewritten on every
// install — never retire.
export function buildUpdatePlan(pkgDir, manifest, destDir, creates, lock) {
  const record = lock.packages[manifest.name];
  if (record !== undefined && record.version === manifest.version) {
    return {
      upToDate: true, mkdirs: [], resources: [], conflicts: [], retired: [],
    };
  }
  // Targets compare normalized: `./a.txt` and `a.txt` resolve to the
  // same file, so a shipped target can never masquerade as retired.
  const recorded = new Map(
    (record?.files ?? []).map((f) => [path.normalize(f.target), f.sha256]),
  );
  const updatesAllowed = semverAtLeast(manifest.version, record?.version);
  const resources = manifest.install.map(({ source, target }) => {
    const dest = path.join(destDir, target);
    if (!hasEntry(dest)) {
      const status = resolvesUnder(destDir, path.dirname(dest)) ? 'create' : 'conflict';
      return { source, target, status };
    }
    const destHash = hashPath(dest);
    const pkgHash = hashPath(path.join(pkgDir, source));
    const recHash = recorded.get(path.normalize(target));
    let status;
    if (destHash === pkgHash) status = 'identical';
    else if (updatesAllowed && destHash === recHash && pkgHash !== recHash) {
      status = 'update';
    } else status = 'conflict';
    if (status !== 'identical' && status !== 'conflict'
        && !resolvesUnder(destDir, path.dirname(dest))) {
      return { source, target, status: 'conflict' };
    }
    return { source, target, status };
  });
  const shipped = new Set(manifest.install.map(({ target }) => path.normalize(target)));
  // The managed guide is excluded from retirements only while the
  // incoming manifest still declares it — the incoming target is the
  // one that gets rewritten; when the version drops the field —or
  // renames the file— the old guide retires like any other file.
  const guideTarget = manifest.personalization === undefined
    ? undefined
    : path.normalize(personalizationTarget(manifest.name, manifest.personalization));
  const retired = [];
  const removals = (record?.files ?? [])
    .filter((f) => f.action !== 'skip' && path.normalize(f.target) !== guideTarget
      && !shipped.has(path.normalize(f.target)))
    .flatMap((f) => {
      const drift = classifyResource(destDir, f);
      if (drift === 'intact') return [{ target: f.target, status: 'retire' }];
      if (drift === 'missing') return [];
      return [{ target: f.target, status: 'conflict', removal: true }];
    });
  for (const entry of removals) {
    (entry.status === 'retire' ? retired : resources).push(entry);
  }
  return {
    upToDate: false,
    mkdirs: creates,
    resources,
    conflicts: resources.filter((r) => r.status === 'conflict'),
    retired,
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
