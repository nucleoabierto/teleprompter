import { fetchRepoTree } from './fetch.js';
import { isCollectionDir, resolveSelection } from './collection.js';
import { loadManifest, loadCollectionManifest } from './manifest.js';

// The version an origin publishes is the manifest's own, read from
// the same tree an install would obtain: a remote source lands in
// a temp dir that is always released, a local one is read in place.
// Errors stay in the fetching layer's vocabulary — `{ ok: false,
// error }` — so the caller reports the same cause an update would.
// The probe reads and writes nothing else: no destination, no lock.
export async function publishedVersion(io, source, member) {
  let pkgDir;
  let cleanup = null;
  if (source.kind === 'path') {
    pkgDir = source.dir;
  } else {
    const fetched = await fetchRepoTree(source.spec, {
      fetch: io.fetch, tmpBase: io.tmpBase,
    });
    if (!fetched.ok) return fetched;
    pkgDir = fetched.dir;
    cleanup = fetched.cleanup;
  }
  try {
    const unit = resolveUnit(pkgDir, member);
    if (!unit.ok) return unit;
    const { manifest, errors } = loadManifest(unit.dir);
    if (errors.length > 0) return { ok: false, error: errors[0] };
    return { ok: true, version: manifest.version };
  } finally {
    if (cleanup !== null) cleanup();
  }
}

// A plain package resolves to itself; a collection resolves through
// its index — the member name is required there, because the
// selection is what makes a collection origin name a package.
function resolveUnit(pkgDir, member) {
  if (!isCollectionDir(pkgDir)) return { ok: true, dir: pkgDir };
  if (member === undefined) {
    return { ok: false, error: 'el origen es una colección sin miembro seleccionado' };
  }
  const collection = loadCollectionManifest(pkgDir);
  if (collection.errors.length > 0) {
    return { ok: false, error: collection.errors[0] };
  }
  const selected = resolveSelection(pkgDir, collection.manifest, [member]);
  if (!selected.ok) return { ok: false, error: selected.errors[0] };
  return { ok: true, dir: selected.units[0].dir };
}
