import path from 'node:path';
import { hashPath } from './hash.js';
import { classifyResource, uncoveredUnits } from './drift.js';
import { lockEntry } from './lock.js';
import {
  hasEntry, isWithin, personalizationTarget, resolvesUnder,
} from './paths.js';

// Classifies each install entry by comparing the destination with the
// package resource and the recorded history:
//   create         - the destination does not exist
//   identical      - same content, nothing to do
//   managed-update - the destination still holds what a previous
//                    install wrote and the package offers an equal or
//                    later version, so overwriting it is safe
//   conflict       - different content not owned by the tool
export function buildPlan(pkgDir, manifest, destDir, creates, lock) {
  const record = lockEntry(lock, manifest.name);
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
// install — never retire. One exception to removal conflicts: a
// recorded guide the incoming version replaces — it declares its
// own personalization — retires even with drift, because it stops
// being the guide and keeping it would leave a file `guide` can
// never show; an unverifiable one stays a conflict, since forcing
// removal of an unsafe path would turn a resolvable decision into
// an execution error.
// Granularity changes work too: a recorded directory the version
// now ships by children is not retired whole — the comparison
// descends to the subtrees the new map actually abandoned, and a
// recorded target inside an incoming one never retires on its own
// because the resource's action already governs it. An intact
// recorded tree certifies its descendants — the lock keeps one
// hash for the directory, but a tree that still hashes as recorded
// proves every child holds what the tool wrote, so an incoming
// child can classify `update` instead of degrading to `conflict`.
// Targets compare normalized and without a trailing separator:
// `./a.txt`, `a.txt` and a directory recorded as `d/` all resolve
// to the same resource, so a shipped target can never masquerade
// as retired — nor a recorded directory as a different path.
const canon = (t) => path.normalize(t).replace(/[/\\]+$/, '');

export function buildUpdatePlan(pkgDir, manifest, destDir, creates, lock) {
  const record = lockEntry(lock, manifest.name);
  if (record !== undefined && record.version === manifest.version) {
    return {
      upToDate: true, mkdirs: [], resources: [], conflicts: [], retired: [],
    };
  }
  const recordedFiles = record?.files ?? [];
  const recorded = new Map(recordedFiles.map((f) => [canon(f.target), f.sha256]));
  const recordedByTarget = new Map(recordedFiles.map((f) => [canon(f.target), f]));
  const shipped = new Set(manifest.install.map(({ target }) => canon(target)));
  const updatesAllowed = semverAtLeast(manifest.version, record?.version);
  // The recorded hash of an incoming target is its own entry's when
  // it has one; inside an intact recorded tree the current hash
  // stands in — the whole subtree provably holds what was written.
  // The ancestor's drift is computed once, not once per child.
  const ancestorDrift = new Map();
  const recordedHash = (target, destHash) => {
    if (recorded.has(target)) return recorded.get(target);
    for (let p = path.dirname(target); p !== '.'; p = path.dirname(p)) {
      const entry = recordedByTarget.get(p);
      if (entry === undefined) continue;
      let drift = ancestorDrift.get(p);
      if (drift === undefined) {
        drift = classifyResource(destDir, entry);
        ancestorDrift.set(p, drift);
      }
      return drift === 'intact' ? destHash : undefined;
    }
    return undefined;
  };
  const resources = manifest.install.map(({ source, target }) => {
    const dest = path.join(destDir, target);
    if (!hasEntry(dest)) {
      const status = resolvesUnder(destDir, path.dirname(dest)) ? 'create' : 'conflict';
      return { source, target, status };
    }
    const destHash = hashPath(dest);
    const pkgHash = hashPath(path.join(pkgDir, source));
    const recHash = recordedHash(canon(target), destHash);
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
  // The managed guide is excluded from retirements only while the
  // incoming manifest still declares it — the incoming target is the
  // one that gets rewritten; when the version drops the field —or
  // renames the file— the old guide retires like any other file.
  const guideTarget = manifest.personalization === undefined
    ? undefined
    : canon(personalizationTarget(manifest.name, manifest.personalization));
  // The lock is untrusted data: a hand-edited `personalization` that
  // is not a string must not crash the plan.
  const replacedGuide = guideTarget === undefined || typeof record?.personalization !== 'string'
    ? undefined
    : canon(record.personalization);
  const shippedArr = [...shipped];
  const recordedTargets = new Set(recordedByTarget.keys());
  const retired = [];
  const removals = recordedFiles
    .filter((f) => f.action !== 'skip' && canon(f.target) !== guideTarget
      && !shipped.has(canon(f.target)))
    .flatMap((f) => {
      const t = canon(f.target);
      // Governed by the incoming resource that covers it: identical
      // keeps it, update or overwrite replaces the whole subtree.
      if (shippedArr.some((s) => isWithin(s, t))) return [];
      if (!shippedArr.some((s) => isWithin(t, s))) {
        return classifyRemoval(destDir, f, replacedGuide);
      }
      // Ancestor of incoming targets: descend to the units the new
      // map abandoned — never the whole tree. The tree's drift
      // classifies every unit at once: intact certifies the
      // subtree, anything else decides per unit — and a pinned
      // expansion decides everything, because a kept link may
      // reach inside a unit.
      const found = uncoveredUnits(destDir, t, shipped, recordedTargets);
      if (found !== null) {
        const drift = classifyResource(destDir, f);
        return found.units.map((target) => (drift === 'intact' && !found.pinned
          ? { target, status: 'retire' }
          : { target, status: 'conflict', removal: true }));
      }
      // A recorded path that cannot descend — no longer a
      // directory, unsafe, unreadable — is still on the way of the
      // incoming targets, so it is never retired automatically:
      // intact stays untouched, anything else is the user's call.
      const drift = classifyResource(destDir, f);
      if (drift === 'missing' || drift === 'intact') return [];
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

// The retirement of one recorded entry, whole: intact leaves
// automatically, absent leaves silently, a drifted replaced guide
// still leaves — it stops being the guide — and anything else
// degrades to a removal conflict.
function classifyRemoval(destDir, f, replacedGuide) {
  const drift = classifyResource(destDir, f);
  if (drift === 'intact') return [{ target: f.target, status: 'retire' }];
  if (drift === 'missing') return [];
  if (drift === 'modified' && canon(f.target) === replacedGuide) {
    return [{ target: f.target, status: 'retire' }];
  }
  return [{ target: f.target, status: 'conflict', removal: true }];
}

// Resolving is the plan's own operation: a conflict admits exactly
// `overwrite` or `skip` and the assignment lives here so callers
// decide per conflict — flag, prompt, whatever asks — without
// touching the entries. `decide` answers one conflict at a time, in
// plan order, and may return a promise.
export async function resolveConflicts(plan, decide) {
  for (const r of plan.conflicts) r.resolution = await decide(r);
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
