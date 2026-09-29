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

// Downloads the public archive of a GitHub repository — no git, no
// credentials — and extracts it under a temp dir as {tmp}/{repo},
// so the package directory basename matches the manifest name rule.
// The fetch implementation comes from the caller (the CLI injects
// it for tests); the extracted tree is remote content, so `tar`
// sanitization (no "..", no absolute paths, no symlink escapes) is
// the security boundary, not a courtesy.
// Returns { ok: true, dir, cleanup } or { ok: false, error }.
export async function fetchRepoTree(spec, { fetch: fetchImpl, tmpBase }) {
  if (fetchImpl === undefined) {
    return { ok: false, error: 'no hay implementación de fetch disponible' };
  }
  const root = fs.mkdtempSync(path.join(tmpBase ?? os.tmpdir(), 'teleprompter-fetch-'));
  const cleanup = () => fs.rmSync(root, { recursive: true, force: true });
  const dir = path.join(root, spec.name);

  let response = null;
  let unreachable = true;
  for (const url of repoUrls(spec)) {
    try {
      const res = await fetchImpl(url);
      if (res.ok) {
        response = res;
        break;
      }
      unreachable = false;
    } catch {
      // A failed request says nothing about the next endpoint:
      // codeload may be down while the API is reachable.
    }
  }
  if (response === null) {
    cleanup();
    const why = unreachable ? 'no se pudo contactar con GitHub' : 'repositorio o referencia no encontrados';
    return { ok: false, error: `${why}: ${spec.owner}/${spec.name}${spec.ref ? `@${spec.ref}` : ''}` };
  }

  try {
    const archive = path.join(root, 'repo.tar.gz');
    fs.writeFileSync(archive, Buffer.from(await response.arrayBuffer()));
    fs.mkdirSync(dir);
    await extract({ file: archive, cwd: dir, strip: 1 });
    fs.rmSync(archive);
  } catch (error) {
    cleanup();
    return { ok: false, error: `no se pudo extraer el archivo: ${error.message}` };
  }
  return { ok: true, dir, cleanup };
}
