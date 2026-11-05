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
