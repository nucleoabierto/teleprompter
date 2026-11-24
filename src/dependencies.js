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
    return { collection: false, index: new Map(), duplicated: new Set() };
  }
  const { manifest } = loadCollectionManifest(rootDir);
  const index = new Map();
  const duplicated = new Set();
  for (const entry of manifest?.packages ?? []) {
    const name = path.basename(path.normalize(entry.path));
    if (index.has(name)) duplicated.add(name);
    else index.set(name, path.join(rootDir, entry.path));
  }
  return { collection: true, index, duplicated };
}

// A site is a tree a piece can live in, carrying everything the walk
// needs about it: `key` is the identity the graph compares, `label`
// how diagnostics name it —bare for conflicts, `where`/`indexLabel`
// quoted for «no existe en»/«en el índice de» phrasing—, `tag` the
// origin suffix a piece prints in cycle paths, `lockOrigin` the
// lock-shaped origin its units record, `treeType` whether it is a
// fetched tree, and `cleanup` the release of its temp dir. The
// invocation's root is a site with no `tag` and no `lockOrigin` —
// its units keep recording the origin `installUnit` composes.
function makeSite(root, { key, tag, lockOrigin, treeType, cleanup }) {
  return {
    root, key, tag, lockOrigin, treeType, cleanup,
    label: tag ?? 'el origen',
    where: tag === undefined ? 'el origen' : `"${tag}"`,
    indexLabel: tag === undefined ? 'la colección' : `"${tag}"`,
    ...memberIndex(root),
  };
}

// How a piece of the set presents itself in diagnostics: the root
// tree's pieces go bare, a piece of another origin carries it as
// `name@origin` — the same label the cycle path and the identity
// conflict print, so `a@o1/r1 → b@o2/r2 → a@o1/r1` stays legible.
const describe = ({ name, tag }) =>
  tag === undefined ? name : `${name}@${tag}`;

// Expands the selected units into the whole declared set, resolved
// across every origin involved: a dependency without `origin` names
// a member of the index of the tree it is declared in — never a
// path —; one with `origin` obtains its own site —a GitHub spec
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
  const pieces = new Map();
  const extSites = new Map();
  const order = [];

  // Two `path` strings only name the same origin if they resolve to
  // the same directory — the key is the resolved path, because each
  // declaring package reads the string against its own dir.
  const originKey = (dep, fromDir) =>
    dep.origin.repo === undefined
      ? `path:${path.resolve(fromDir, dep.origin.path)}`
      : `repo:${dep.origin.repo}`;

  // A demand registers the restriction and checks the piece's
  // identity: two origins demanding the same name is a conflict the
  // set cannot arbitrate, so the walk refuses to visit it.
  const demand = (target, from, range, site) => {
    const list = demands.get(target) ?? [];
    list.push({ from, range });
    demands.set(target, list);
    const seen = pieces.get(target);
    if (seen?.site !== undefined && seen.site.key !== site.key) {
      errors.push(`conflicto de identidad: la pieza "${target}" se declara desde ${seen.site.label} y desde ${site.label}`);
      return false;
    }
    return true;
  };

  // A member of a site's index by name — the shared resolution a
  // same-tree dependency and a collection member of an external
  // origin both make: absent or ambiguous names diagnose against the
  // site's own labels.
  const memberOf = (site, dep, declarer) => {
    if (site.duplicated.has(dep.package)) {
      return { error: `"${dep.package}" aparece varias veces en el índice de ${site.indexLabel}` };
    }
    const dir = site.index.get(dep.package);
    if (dir === undefined) {
      return { error: `la pieza "${dep.package}" que "${declarer}" declara no existe en ${site.where}` };
    }
    return { dir, site, member: true };
  };

  // An external origin is obtained once per declared reference: a
  // repo spec downloads the tree anchored at the commit the ref
  // resolves to, a path resolves against the declaring package's
  // directory. The site is cached by origin key —several pieces may
  // declare the same origin— and carries the lock-shaped origin its
  // units will register.
  const obtainSite = async (dep, fromDir) => {
    const key = originKey(dep, fromDir);
    const cached = extSites.get(key);
    if (cached !== undefined) return cached;
    let entry;
    if (dep.origin.repo === undefined) {
      const dir = path.resolve(fromDir, dep.origin.path);
      // statSync throws on more than ENOENT — an unreadable parent
      // must not escape as an uncaught exception.
      let isDir = false;
      try { isDir = fs.statSync(dir).isDirectory(); } catch { /* unreadable */ }
      entry = isDir
        ? {
          site: makeSite(dir, {
            key, tag: dep.origin.path, treeType: 'path',
            lockOrigin: { type: 'path', path: dir },
          }),
        }
        : { error: `la ruta no es un directorio: ${dep.origin.path}` };
    } else {
      // The spec is well-formed — the manifest validator rejected
      // it otherwise — so it fetches straight.
      const spec = parseRepoSpec(dep.origin.repo);
      const fetched = await fetchRepoTree(spec, { fetch: io.fetch, tmpBase: io.tmpBase });
      entry = fetched.ok
        ? {
          site: makeSite(fetched.dir, {
            key, tag: specLabel(spec), treeType: 'github',
            lockOrigin: originOf({ kind: 'repo', spec }, fetched.commit),
            cleanup: fetched.cleanup,
          }),
        }
        : { error: fetched.error };
    }
    extSites.set(key, entry);
    return entry;
  };

  // A dependency with `origin`: the origin is checked statically
  // first —`path` inside a fetched tree can only point at the
  // ephemeral extraction, and a name already owned by another origin
  // is a conflict— then obtained, then its piece selected by the
  // same rules every tree shares: member of its collection by index
  // name, or its root package, whose `name` must match.
  const externalMember = async (dep, dir, site, declarer) => {
    // The lock would record a directory the cleanup erases —
    // unreproducible by definition. `path` belongs to local trees.
    if (dep.origin.path !== undefined && site.treeType === 'github') {
      return { error: `la pieza "${dep.package}" que "${declarer}" declara usa "path" dentro de un árbol remoto: la ruta no sobrevive a la obtención` };
    }
    const owned = pieces.get(dep.package);
    if (owned?.site !== undefined && owned.site.key !== originKey(dep, dir)) {
      return { error: `conflicto de identidad: la pieza "${dep.package}" se declara desde ${owned.site.label} y desde ${dep.origin.repo ?? dep.origin.path}` };
    }
    const obtained = await obtainSite(dep, dir);
    if (obtained.error !== undefined) {
      return { error: `la pieza "${dep.package}" que "${declarer}" declara no es alcanzable: ${obtained.error}` };
    }
    const ext = obtained.site;
    if (ext.collection) return memberOf(ext, dep, declarer);
    const { manifest: depManifest } = loadManifest(ext.root);
    if (depManifest !== null && depManifest.name !== dep.package) {
      return { error: `el origen ${ext.where} publica "${depManifest.name}", no "${dep.package}"` };
    }
    // Its own name enters the index: a dependency of this package
    // on itself resolves to itself —a cycle of one—.
    ext.index.set(dep.package, ext.root);
    return { dir: ext.root, site: ext, member: false };
  };

  const visit = async (name, dir, site, trail) => {
    const node = { name, tag: site.tag };
    const cycleAt = trail.findIndex((n) => n.name === name);
    if (cycleAt !== -1) {
      errors.push(`dependencia circular: ${[...trail.slice(cycleAt), node].map(describe).join(' → ')}`);
      return;
    }
    const seen = pieces.get(name);
    if (seen?.site !== undefined && seen.site.key !== site.key) {
      seen.state = 'failed';
      errors.push(`conflicto de identidad: la pieza "${name}" se declara desde ${seen.site.label} y desde ${site.label}`);
      return;
    }
    if (seen !== undefined) return;
    const { manifest } = loadManifest(dir);
    if (manifest === null) {
      pieces.set(name, { state: 'failed' });
      errors.push(`la pieza "${name}" no es alcanzable: su manifiesto es inválido`);
      return;
    }
    const piece = { state: 'visiting', site, manifest, dir, member: false };
    pieces.set(name, piece);
    const next = [...trail, node];
    for (const dep of manifest.dependencies ?? []) {
      const resolved = dep.origin === undefined
        ? memberOf(site, dep, name)
        : await externalMember(dep, dir, site, name);
      if (resolved.error !== undefined) {
        errors.push(resolved.error);
        continue;
      }
      if (!demand(dep.package, name, dep.version, resolved.site)) continue;
      await visit(dep.package, resolved.dir, resolved.site, next);
      // The piece records what resolution established: an index
      // member keeps its `package` in the lock, and a piece of an
      // external tree carries that tree's lock-shaped origin —not
      // the invocation's—.
      const target = pieces.get(dep.package);
      if (target === undefined) continue;
      if (resolved.member) target.member = true;
      if (resolved.site.lockOrigin !== undefined) {
        target.origin ??= resolved.site.lockOrigin;
      }
    }
    piece.state = 'done';
    order.push(name);
  };

  const rootSite = makeSite(rootDir, {
    key: rootDir, tag: undefined, treeType: rootOrigin?.type,
  });
  for (const unit of units) {
    const name = unit.name ?? loadManifest(unit.dir).manifest?.name;
    if (name === undefined) {
      errors.push('la pieza seleccionada no es alcanzable: su manifiesto es inválido');
      continue;
    }
    // A standalone origin names itself: a dependency on it is a
    // cycle of length one, anything else does not exist.
    if (rootSite.index.size === 0) rootSite.index.set(name, unit.dir);
    await visit(name, unit.dir, rootSite, []);
    const piece = pieces.get(name);
    if (piece !== undefined && unit.name !== undefined) piece.member = true;
  }

  for (const [name, list] of demands) {
    const manifest = pieces.get(name)?.manifest;
    if (manifest === undefined) continue;
    for (const { from, range } of list) {
      if (range !== undefined && !semver.satisfies(manifest.version, range)) {
        errors.push(`la pieza "${name}"@${manifest.version} no satisface "${range}" exigida por "${from}"`);
      }
    }
  }

  if (errors.length > 0) {
    for (const { site } of extSites.values()) site?.cleanup?.();
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
      const piece = pieces.get(name);
      const unit = piece.member ? { name, dir: piece.dir } : { dir: piece.dir };
      if (piece.origin !== undefined) unit.origin = { ...piece.origin };
      return unit;
    }),
    cleanups: [...extSites.values()]
      .map(({ site }) => site?.cleanup)
      .filter((cleanup) => cleanup !== undefined),
  };
}
