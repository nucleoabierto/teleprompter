import fs from 'node:fs';
import path from 'node:path';
import semver from 'semver';
import { loadManifest, loadCollectionManifest } from './manifest.js';
import { isCollectionDir } from './collection.js';
import { parseRepoSpec, specLabel, fetchRepoTree } from './fetch.js';
import { originOf } from './origin.js';

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

// How a piece of the set presents itself in diagnostics: the root
// tree's pieces go bare, a piece of another origin carries it as
// `name@origin` — the same label the cycle path and the identity
// conflict print, so `a@o1/r1 → b@o2/r2 → a@o1/r1` stays legible.
const describe = ({ name, originLabel }) =>
  originLabel === undefined ? name : `${name}@${originLabel}`;

// Expands the selected units into the whole declared set, resolved
// across every origin involved: a dependency without `origin` names
// a member of the index of the tree it is declared in — never a
// path —; one with `origin` obtains its own tree —a GitHub spec
// fetched anchored at its resolved commit, a local directory
// resolved against the declaring package— and selects the piece in
// it, member of its collection by index name or its root package,
// whose manifest name must equal the `package` declared. The walk
// is transitive and crosses trees; repeated demands on the same
// piece merge instead of duplicating, the same name demanded from
// two different origins is an identity conflict, and every declared
// restriction is an assertion checked against the `version` the
// piece's own manifest publishes. The result is either the
// topological order —dependency before dependent, each piece once—
// or the list of what makes the set unresolvable: a duplicated
// index name, a piece that does not exist, whose origin cannot be
// reached or whose manifest does not load, a dependency cycle
// reported with its legible path, an identity conflict, and a
// restriction the obtained version does not satisfy. Nothing here
// touches the destination: resolution precedes verification, plan
// and any write (D005), and the temp trees fetched land in
// `cleanups` for the caller to release. `rootOrigin` — the
// lock-shaped origin of the invocation's tree — lets the walk tell
// a local root (`{ type: 'path' }`, where `path` dependencies make
// sense) from a fetched one (`{ type: 'github' }`, where they can
// only point at the ephemeral extraction).
export async function resolveSet(io, rootDir, units, rootOrigin = undefined) {
  const errors = [];
  const demands = new Map();
  const manifests = new Map();
  const dirs = new Map();
  const member = new Set();
  const origins = new Map();
  const extOrigins = new Map();
  const trees = new Map();
  const external = new Map();
  const state = new Map();
  const order = [];

  const treeOf = (root) => {
    let tree = trees.get(root);
    if (tree === undefined) {
      tree = memberIndex(root);
      trees.set(root, tree);
    }
    return tree;
  };

  // A demand registers the restriction and checks the piece's
  // identity: two origins demanding the same name is a conflict the
  // set cannot arbitrate, so the walk refuses to visit it.
  const demand = (target, from, range, key, label) => {
    const list = demands.get(target) ?? [];
    list.push({ from, range });
    demands.set(target, list);
    const seen = origins.get(target);
    if (seen !== undefined && seen.key !== key) {
      errors.push(`conflicto de identidad: la pieza "${target}" se declara desde ${seen.label} y desde ${label}`);
      return false;
    }
    return true;
  };

  // An external origin is obtained once per declared reference: a
  // repo spec downloads the tree anchored at the commit the ref
  // resolves to, a path resolves against the declaring package's
  // directory. The result is cached by origin key —several pieces
  // may declare the same origin— and carries the lock-shaped origin
  // the resolved unit will register.
  // Two `path` strings only name the same origin if they resolve to
  // the same directory — the key is the resolved path, because each
  // declaring package reads the string against its own dir.
  const originKey = (dep, fromDir) =>
    dep.origin.repo === undefined
      ? `path:${path.resolve(fromDir, dep.origin.path)}`
      : `repo:${dep.origin.repo}`;

  const obtainExternal = async (dep, fromDir) => {
    const repo = dep.origin.repo;
    const key = originKey(dep, fromDir);
    const cached = external.get(key);
    if (cached !== undefined) return cached;
    let entry;
    if (repo === undefined) {
      const dir = path.resolve(fromDir, dep.origin.path);
      // statSync throws on more than ENOENT — an unreadable parent
      // must not escape as an uncaught exception.
      let isDir = false;
      try { isDir = fs.statSync(dir).isDirectory(); } catch { /* unreadable */ }
      entry = isDir
        ? { rootDir: dir, origin: { type: 'path', path: dir }, label: dep.origin.path, key }
        : { error: `la ruta no es un directorio: ${dep.origin.path}` };
    } else {
      // The spec is well-formed — the manifest validator rejected
      // it otherwise — so it fetches straight.
      const spec = parseRepoSpec(repo);
      const fetched = await fetchRepoTree(spec, { fetch: io.fetch, tmpBase: io.tmpBase });
      entry = fetched.ok
        ? {
          rootDir: fetched.dir,
          origin: originOf({ kind: 'repo', spec }, fetched.commit),
          label: specLabel(spec), key, cleanup: fetched.cleanup,
        }
        : { error: fetched.error };
    }
    external.set(key, entry);
    return entry;
  };

  // `treeOrigin` is the lock-shaped origin of the tree the piece
  // lives in — undefined for the invocation's tree, whose units keep
  // recording the origin `installUnit` composes.
  const visit = async (name, dir, tree, key, originLabel, trail, treeOrigin) => {
    const node = { name, originLabel };
    const cycleAt = trail.findIndex((n) => n.name === name);
    if (cycleAt !== -1) {
      errors.push(`dependencia circular: ${[...trail.slice(cycleAt), node].map(describe).join(' → ')}`);
      return;
    }
    const label = originLabel ?? 'el origen';
    const seen = origins.get(name);
    if (seen !== undefined && seen.key !== key) {
      state.set(name, 'failed');
      errors.push(`conflicto de identidad: la pieza "${name}" se declara desde ${seen.label} y desde ${label}`);
      return;
    }
    if (state.has(name)) return;
    const { manifest } = loadManifest(dir);
    if (manifest === null) {
      state.set(name, 'failed');
      errors.push(`la pieza "${name}" no es alcanzable: su manifiesto es inválido`);
      return;
    }
    origins.set(name, { key, label });
    manifests.set(name, manifest);
    dirs.set(name, dir);
    state.set(name, 'visiting');
    const next = [...trail, node];
    for (const dep of manifest.dependencies ?? []) {
      if (dep.origin === undefined) {
        if (tree.duplicated.has(dep.package)) {
          errors.push(`"${dep.package}" aparece varias veces en el índice de ${label === 'el origen' ? 'la colección' : `"${label}"`}`);
          continue;
        }
        const depDir = tree.index.get(dep.package);
        if (depDir === undefined) {
          errors.push(`la pieza "${dep.package}" que "${name}" declara no existe en ${label}`);
          continue;
        }
        member.add(dep.package);
        if (demand(dep.package, name, dep.version, key, label)) {
          if (treeOrigin !== undefined) extOrigins.set(dep.package, treeOrigin);
          await visit(dep.package, depDir, tree, key, originLabel, next, treeOrigin);
        }
        continue;
      }
      // A `path` inside a fetched tree can only point at the
      // ephemeral extraction: the lock would record a directory the
      // cleanup erases — unreproducible by definition. `path` belongs
      // to local trees.
      if (dep.origin.path !== undefined && (treeOrigin ?? rootOrigin)?.type === 'github') {
        errors.push(`la pieza "${dep.package}" que "${name}" declara usa "path" dentro de un árbol remoto: la ruta no sobrevive a la obtención`);
        continue;
      }
      // The identity check precedes the fetch: a name already owned
      // by another origin is a conflict the manifest declares, no
      // tree needs downloading to tell.
      const extLabel = dep.origin.repo ?? dep.origin.path;
      const owned = origins.get(dep.package);
      if (owned !== undefined && owned.key !== originKey(dep, dir)) {
        errors.push(`conflicto de identidad: la pieza "${dep.package}" se declara desde ${owned.label} y desde ${extLabel}`);
        continue;
      }
      const ext = await obtainExternal(dep, dir);
      if (ext.error !== undefined) {
        errors.push(`la pieza "${dep.package}" que "${name}" declara no es alcanzable: ${ext.error}`);
        continue;
      }
      const extTree = treeOf(ext.rootDir);
      let depDir;
      if (isCollectionDir(ext.rootDir)) {
        if (extTree.duplicated.has(dep.package)) {
          errors.push(`"${dep.package}" aparece varias veces en el índice de "${ext.label}"`);
          continue;
        }
        depDir = extTree.index.get(dep.package);
        if (depDir === undefined) {
          errors.push(`la pieza "${dep.package}" que "${name}" declara no existe en "${ext.label}"`);
          continue;
        }
        member.add(dep.package);
      } else {
        depDir = ext.rootDir;
        const { manifest: depManifest } = loadManifest(depDir);
        if (depManifest !== null && depManifest.name !== dep.package) {
          errors.push(`el origen "${ext.label}" publica "${depManifest.name}", no "${dep.package}"`);
          continue;
        }
        // Its own name enters the index: a dependency of this
        // package on itself resolves to itself —a cycle of one—.
        extTree.index.set(dep.package, depDir);
      }
      if (demand(dep.package, name, dep.version, ext.key, ext.label)) {
        extOrigins.set(dep.package, ext.origin);
        await visit(dep.package, depDir, extTree, ext.key, ext.label, next, ext.origin);
      }
    }
    state.set(name, 'done');
    order.push(name);
  };

  const rootTree = treeOf(rootDir);
  for (const unit of units) {
    const name = unit.name ?? loadManifest(unit.dir).manifest?.name;
    if (name === undefined) {
      errors.push('la pieza seleccionada no es alcanzable: su manifiesto es inválido');
      continue;
    }
    // A standalone origin names itself: a dependency on it is a
    // cycle of length one, anything else does not exist.
    if (rootTree.index.size === 0) rootTree.index.set(name, unit.dir);
    if (unit.name !== undefined) member.add(name);
    await visit(name, unit.dir, rootTree, rootDir, undefined, [], undefined);
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

  if (errors.length > 0) {
    for (const fetched of external.values()) {
      fetched.cleanup?.();
    }
    return { ok: false, errors };
  }
  // Only units that came through an index carry a name: the
  // standalone root stays anonymous so `installUnit` records its
  // origin without a `package` member, as it always did. Units of an
  // external origin carry it in lock shape; `installUnit` records it
  // instead of the invocation's.
  return {
    ok: true,
    units: order.map((name) => {
      const unit = member.has(name) ? { name, dir: dirs.get(name) } : { dir: dirs.get(name) };
      const ext = extOrigins.get(name);
      if (ext !== undefined) unit.origin = { ...ext };
      return unit;
    }),
    cleanups: [...external.values()]
      .filter((fetched) => fetched.cleanup !== undefined)
      .map((fetched) => fetched.cleanup),
  };
}
