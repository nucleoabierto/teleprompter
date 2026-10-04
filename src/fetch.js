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

function repoUrls({ owner, name, ref }) {
  const o = encodeURIComponent(owner);
  const r = encodeURIComponent(name);
  return [
    `https://codeload.github.com/${o}/${r}/tar.gz/${ref ?? 'HEAD'}`,
    `https://api.github.com/repos/${o}/${r}/tarball${ref ? `/${ref}` : ''}`,
  ];
}

// Download budgets: each endpoint gets its own timeout (a hung
// codeload says nothing about the API) and the archive is bounded
// both by the declared length and by what was actually received.
const DEFAULT_TIMEOUT_MS = 60_000;
const DEFAULT_MAX_BYTES = 50 * 1024 * 1024;

const isAbort = (error) => error?.name === 'TimeoutError' || error?.name === 'AbortError';

const specLabel = ({ owner, name, ref }) => `${owner}/${name}${ref ? `@${ref}` : ''}`;

// Downloads the public archive of a GitHub repository — no git, no
// credentials — and extracts it under a temp dir as {tmp}/{repo},
// so the package directory basename matches the manifest name rule.
// The fetch implementation comes from the caller (the CLI injects
// it for tests); the extracted tree is remote content, so `tar`
// sanitization (no "..", no absolute paths, no symlink escapes) is
// the security boundary, not a courtesy.
// Returns { ok: true, dir, cleanup } or { ok: false, error }.
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

  let response = null;
  let unreachable = true;
  let thrown = 0;
  let timedOut = 0;
  const statuses = [];
  for (const url of repoUrls(spec)) {
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
  return { ok: true, dir, cleanup };
}
