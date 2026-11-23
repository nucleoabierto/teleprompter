import path from 'node:path';
import semver from 'semver';
import { loadManifest, loadCollectionManifest } from './manifest.js';
import { isCollectionDir } from './collection.js';

// The member namespace a dependency resolves against: the
// collection's index names members by the basename of their path —
// the same reading `resolveSelection` makes — and a duplicated
// basename makes the name ambiguous, not silently first-wins. A
// non-collection origin has no index: its only member is the root
// package itself, registered by the caller once its manifest gives
// the name.
function memberIndex(rootDir) {
  if (!isCollectionDir(rootDir)) {
    return { index: new Map(), duplicated: new Set() };
  }
  const { manifest } = loadCollectionManifest(rootDir);
  const index = new Map();
  const duplicated = new Set();
  for (const entry of manifest?.packages ?? []) {
    const name = path.basename(path.normalize(entry.path));
    if (index.has(name)) duplicated.add(name);
    else index.set(name, path.join(rootDir, entry.path));
  }
  return { index, duplicated };
}

// Expands the selected units into the whole declared set, resolved
// inside the already-obtained tree: every entry names a member by
// its index name — never a path —, the walk is transitive, repeated
// demands on the same piece merge instead of duplicating, and every
// declared restriction is an assertion checked against the `version`
// the member's own manifest publishes. The result is either the
// topological order —dependency before dependent, each piece once—
// or the list of what makes the set unresolvable: a duplicated index
// name, a member that does not exist or whose manifest does not
// load, a dependency cycle reported with its legible path
// (`a → b → a`, self-inclusion being a cycle of length one) and a
// restriction the obtained version does not satisfy. Nothing here
// touches the destination: resolution precedes verification, plan
// and any write (D005).
export function resolveSet(rootDir, units) {
  const { index, duplicated } = memberIndex(rootDir);
  const errors = [];
  const demands = new Map();
  const manifests = new Map();
  const dirs = new Map();
  const member = new Set();
  const state = new Map();
  const order = [];

  const demand = (target, from, range) => {
    const list = demands.get(target) ?? [];
    list.push({ from, range });
    demands.set(target, list);
  };

  const visit = (name, dir, trail) => {
    const cycleAt = trail.indexOf(name);
    if (cycleAt !== -1) {
      errors.push(`dependencia circular: ${[...trail.slice(cycleAt), name].join(' → ')}`);
      return;
    }
    if (state.has(name)) return;
    const { manifest } = loadManifest(dir);
    if (manifest === null) {
      state.set(name, 'failed');
      errors.push(`la pieza "${name}" no es alcanzable: su manifiesto es inválido`);
      return;
    }
    manifests.set(name, manifest);
    dirs.set(name, dir);
    state.set(name, 'visiting');
    const next = [...trail, name];
    for (const dep of manifest.dependencies ?? []) {
      if (duplicated.has(dep.package)) {
        errors.push(`"${dep.package}" aparece varias veces en el índice de la colección`);
        continue;
      }
      const depDir = index.get(dep.package);
      if (depDir === undefined) {
        errors.push(`la pieza "${dep.package}" que "${name}" declara no existe en el origen`);
        continue;
      }
      demand(dep.package, name, dep.version);
      member.add(dep.package);
      visit(dep.package, depDir, next);
    }
    state.set(name, 'done');
    order.push(name);
  };

  for (const unit of units) {
    const name = unit.name ?? loadManifest(unit.dir).manifest?.name;
    if (name === undefined) {
      errors.push('la pieza seleccionada no es alcanzable: su manifiesto es inválido');
      continue;
    }
    // A standalone origin names itself: a dependency on it is a
    // cycle of length one, anything else does not exist.
    if (index.size === 0) index.set(name, unit.dir);
    if (unit.name !== undefined) member.add(name);
    visit(name, unit.dir, []);
  }

  for (const [name, list] of demands) {
    const manifest = manifests.get(name);
    if (manifest === undefined) continue;
    for (const { from, range } of list) {
      if (range !== undefined && !semver.satisfies(manifest.version, range)) {
        errors.push(`la pieza "${name}"@${manifest.version} no satisface "${range}" exigida por "${from}"`);
      }
    }
  }

  if (errors.length > 0) return { ok: false, errors };
  // Only units that came through the index carry a name: the
  // standalone root stays anonymous so `installUnit` records its
  // origin without a `package` member, as it always did.
  return {
    ok: true,
    units: order.map((name) => (member.has(name)
      ? { name, dir: dirs.get(name) }
      : { dir: dirs.get(name) })),
  };
}
