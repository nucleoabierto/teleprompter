import path from 'node:path';
import { parseRepoSpec } from './fetch.js';
import { EXIT_USAGE } from './exits.js';

// The installation's origin in lock shape: what a later operation
// needs to fetch the package again without asking. A remote source
// records owner/repo plus the ref the user gave —absent ref means
// the remote's default branch at fetch time— and the commit the
// ref resolved to, so the registry says which exact tree produced
// the installation; a local --path is recorded absolute, because
// the relative form would die with the working directory of that
// invocation.
export function originOf(source, commit) {
  if (source.kind === 'path') {
    return { type: 'path', path: path.resolve(source.dir) };
  }
  const { owner, name, ref } = source.spec;
  const repo = `${owner}/${name}`;
  const origin = ref === null
    ? { type: 'github', repo }
    : { type: 'github', repo, ref };
  if (commit !== undefined) origin.commit = commit;
  return origin;
}

// The inverse of `originOf`: the recorded origin translates back
// into the source the update re-fetches — a local dir or a repo
// spec parsed by the same grammar the invocation used. The lock is
// repository data: a `repo` that cannot parse back into a spec is
// an unusable origin, not a crash.
export function sourceOf(err, parsed, origin) {
  if (origin === undefined) {
    err(`el paquete "${parsed.pkg}" no registra un origen: indica <user/repo[@ref]> o --path <dir>`);
    return { code: EXIT_USAGE };
  }
  if (origin.type === 'path') {
    if (parsed.ref !== undefined) {
      err('un --ref no aplica a un origen local');
      return { code: EXIT_USAGE };
    }
    return { source: { kind: 'path', dir: origin.path } };
  }
  const spec = parseRepoSpec(origin.repo);
  if (spec === null) {
    err(`el origen registrado no es un repositorio válido: ${origin.repo}`);
    return { code: EXIT_USAGE };
  }
  spec.ref = parsed.ref ?? origin.ref ?? null;
  return { source: { kind: 'repo', spec } };
}

// `sourceOf`'s reproduction variant: the recorded origin translates
// into the source that re-obtains exactly the tree the install
// consumed. The anchor is the recorded `commit`, never `origin.ref`
// — the ref only names the reference the user asked for, an
// intention the remote may have moved past. A recorded full SHA
// parses as a valid ref and `resolveCommit` takes it as already
// resolved, so the fetch downloads the registered commit with no
// resolution call; a malformed commit is left for the fetcher to
// report rather than re-validated here. A local origin has no
// anchor to restore — the recorded directory is the source. Every
// degenerate record — an entry without origin, a remote origin
// without its commit, a `repo` that does not parse back — makes the
// named unit non-reproducible with its reason instead of degrading
// to what the origin publishes today.
export function reproductionSourceOf(err, name, origin) {
  const fail = (reason) => {
    err(`la unidad "${name}" no es reproducible: ${reason}`);
    return { code: EXIT_USAGE };
  };
  if (origin === undefined) {
    return fail('la entrada no registra un origen');
  }
  if (origin.type === 'path') {
    return { source: { kind: 'path', dir: origin.path } };
  }
  if (origin.commit === undefined) {
    return fail('el origen no registra el commit de la instalación');
  }
  const spec = parseRepoSpec(origin.repo);
  if (spec === null) {
    return fail(`el origen registrado no es un repositorio válido: ${origin.repo}`);
  }
  spec.ref = origin.commit;
  return { source: { kind: 'repo', spec } };
}
