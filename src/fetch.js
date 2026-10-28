import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { extract } from 'tar';

// A ref must be a plausible git ref: no whitespace, URL delimiters or
// ".." (git itself forbids it); slashes are fine — tags like
// "cli/v2.0.0" exist.
export const isValidRef = (ref) =>
  ref.length > 0 && !/[\s?#%]/.test(ref) && !ref.includes('..');

// Parses "owner/repo[@ref]". Owner and repo follow GitHub naming:
// alphanumerics, hyphen, underscore and dots, single slash — and
// neither may be a dot segment, which would confuse the extraction
// path. The spec splits on the first "@" because refs may contain
// slashes.
export function parseRepoSpec(spec) {
  const at = spec.indexOf('@');
  const repo = at === -1 ? spec : spec.slice(0, at);
  const ref = at === -1 ? null : spec.slice(at + 1);
  if (!/^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/.test(repo)) return null;
  if (ref !== null && !isValidRef(ref)) return null;
  const [owner, name] = repo.split('/');
  if (/^\.{1,2}$/.test(owner) || /^\.{1,2}$/.test(name)) return null;
  return { owner, name, ref };
}

const isFullSha = (ref) => /^[0-9a-f]{40}$/i.test(ref);

// Downloading is anchored to the resolved commit rather than the
// requested ref: the extracted tree is exactly the commit the
// caller learns about, so a branch moving mid-fetch cannot fork
// what was recorded from what was installed.
const repoUrls = ({ owner, name }, sha) => {
  const o = encodeURIComponent(owner);
  const r = encodeURIComponent(name);
  return [
    `https://codeload.github.com/${o}/${r}/tar.gz/${sha}`,
    `https://api.github.com/repos/${o}/${r}/tarball/${sha}`,
  ];
};

// Download budgets: each endpoint gets its own timeout (a hung
// codeload says nothing about the API) and the archive is bounded
// both by the declared length and by what was actually received.
const DEFAULT_TIMEOUT_MS = 60_000;
const DEFAULT_MAX_BYTES = 50 * 1024 * 1024;

const isAbort = (error) => error?.name === 'TimeoutError' || error?.name === 'AbortError';

export const specLabel = ({ owner, name, ref }) => `${owner}/${name}${ref ? `@${ref}` : ''}`;

// Resolving the requested ref to the commit it points at is what
// anchors provenance: a branch or tag moves, a SHA does not. A
// full 40-hex ref is already resolved — no API call —; otherwise
// the commits endpoint answers the exact SHA, and commits/HEAD
// returns the default branch head, so one endpoint covers both
// explicit refs and the absent ref. The call runs under the same
// timeout and injected fetch as the download that follows it.
async function resolveCommit(spec, { fetchImpl, timeoutMs }) {
  if (spec.ref !== null && isFullSha(spec.ref)) return { ok: true, sha: spec.ref.toLowerCase() };
  const o = encodeURIComponent(spec.owner);
  const r = encodeURIComponent(spec.name);
  const url = `https://api.github.com/repos/${o}/${r}/commits/${spec.ref ?? 'HEAD'}`;
  let res;
  try {
    res = await fetchImpl(url, { signal: AbortSignal.timeout(timeoutMs) });
  } catch (error) {
    const why = isAbort(error)
      ? `no se pudo contactar con GitHub: tiempo máximo excedido (${timeoutMs} ms)`
      : 'no se pudo contactar con GitHub';
    return { ok: false, error: `${why}: ${specLabel(spec)}` };
  }
  if (!res.ok) {
    const s = res.status;
    // A nonexistent ref answers 422 «No commit found», not 404 —
    // both mean the requested tree is not there.
    const why = s === 404 || s === 422 ? 'repositorio o referencia no encontrados'
      : s === 401 || s === 403 ? 'acceso denegado o límite de peticiones'
        : typeof s === 'number' && s >= 500 ? 'GitHub responde con error de servidor'
          : typeof s === 'number' ? `GitHub responde con HTTP ${s}` : 'respuesta inesperada de GitHub';
    return { ok: false, error: `${why}: ${specLabel(spec)}` };
  }
  let sha;
  try {
    sha = (await res.json()).sha;
  } catch {
    sha = undefined;
  }
  if (typeof sha !== 'string' || !isFullSha(sha)) {
    return { ok: false, error: `respuesta inesperada de GitHub: ${specLabel(spec)}` };
  }
  return { ok: true, sha };
}

// Downloads the public archive of a GitHub repository — no git, no
// credentials — and extracts it under a temp dir as {tmp}/{repo},
// so the package directory basename matches the manifest name rule.
// The fetch implementation comes from the caller (the CLI injects
// it for tests); the extracted tree is remote content, so `tar`
// sanitization (no "..", no absolute paths, no symlink escapes) is
// the security boundary, not a courtesy.
// Returns { ok: true, dir, cleanup, commit } — the commit the tree
// was fetched at — or { ok: false, error }.
export async function fetchRepoTree(spec, {
  fetch: fetchImpl,
  tmpBase,
  timeoutMs = DEFAULT_TIMEOUT_MS,
  maxBytes = DEFAULT_MAX_BYTES,
}) {
  if (fetchImpl === undefined) {
    return { ok: false, error: 'no hay implementación de fetch disponible' };
  }

  let root;
  try {
    root = fs.mkdtempSync(path.join(tmpBase ?? os.tmpdir(), 'teleprompter-fetch-'));
  } catch (error) {
    return { ok: false, error: `no se pudo crear el directorio temporal: ${error.message}` };
  }
  const cleanup = () => fs.rmSync(root, { recursive: true, force: true });
  const dir = path.join(root, spec.name);

  const resolved = await resolveCommit(spec, { fetchImpl, timeoutMs });
  if (!resolved.ok) {
    cleanup();
    return resolved;
  }
  const commit = resolved.sha;

  let response = null;
  let unreachable = true;
  let thrown = 0;
  let timedOut = 0;
  const statuses = [];
  for (const url of repoUrls(spec, commit)) {
    try {
      const res = await fetchImpl(url, { signal: AbortSignal.timeout(timeoutMs) });
      if (res.ok) {
        response = res;
        break;
      }
      unreachable = false;
      if (typeof res.status === 'number') statuses.push(res.status);
    } catch (error) {
      // A failed request says nothing about the next endpoint:
      // codeload may be down while the API is reachable.
      thrown += 1;
      if (isAbort(error)) timedOut += 1;
    }
  }
  if (response === null) {
    cleanup();
    const why = unreachable
      ? timedOut === thrown ? `no se pudo contactar con GitHub: tiempo máximo excedido (${timeoutMs} ms)` : 'no se pudo contactar con GitHub'
      : statuses.some((s) => s >= 500) ? 'GitHub responde con error de servidor'
        : statuses.length > 0 && statuses.every((s) => s === 404) ? 'repositorio o referencia no encontrados'
          : statuses.some((s) => s === 401 || s === 403) ? 'acceso denegado o límite de peticiones'
            : statuses.length > 0 ? `GitHub responde con HTTP ${statuses.at(-1)}` : 'respuesta inesperada de GitHub';
    return { ok: false, error: `${why}: ${specLabel(spec)}` };
  }

  const declared = Number(response.headers?.get?.('content-length'));
  if (Number.isFinite(declared) && declared > maxBytes) {
    cleanup();
    return { ok: false, error: `la descarga excede el tamaño máximo (${maxBytes} bytes): ${specLabel(spec)}` };
  }

  let body;
  try {
    body = Buffer.from(await response.arrayBuffer());
  } catch (error) {
    cleanup();
    const why = isAbort(error) ? `tiempo máximo excedido (${timeoutMs} ms)` : `la descarga falló: ${error.message}`;
    return { ok: false, error: `${why}: ${specLabel(spec)}` };
  }
  if (body.byteLength > maxBytes) {
    cleanup();
    return { ok: false, error: `la descarga excede el tamaño máximo (${maxBytes} bytes): ${specLabel(spec)}` };
  }

  try {
    const archive = path.join(root, 'repo.tar.gz');
    fs.writeFileSync(archive, body);
    fs.mkdirSync(dir);
    await extract({ file: archive, cwd: dir, strip: 1 });
    fs.rmSync(archive);
  } catch (error) {
    cleanup();
    return { ok: false, error: `no se pudo extraer el archivo: ${error.message}` };
  }
  return { ok: true, dir, cleanup, commit };
}
