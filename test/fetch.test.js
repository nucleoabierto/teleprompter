import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import zlib from 'node:zlib';
import { create as tarCreate } from 'tar';
import { parseRepoSpec, fetchRepoTree } from '../src/fetch.js';

function tmp() {
  return fs.mkdtempSync(path.join(os.tmpdir(), 'teleprompter-test-'));
}

// GitHub archives wrap the tree in a root directory
// ("owner-repo-sha/"), which the extractor strips.
async function makeTarball(rootName, files) {
  const work = tmp();
  for (const [name, content] of Object.entries(files)) {
    const p = path.join(work, rootName, name);
    fs.mkdirSync(path.dirname(p), { recursive: true });
    fs.writeFileSync(p, content);
  }
  const archive = path.join(work, 'a.tgz');
  await tarCreate({ gzip: true, file: archive, cwd: work }, [rootName]);
  return fs.readFileSync(archive);
}

// A hand-built tar entry lets the suite feed the extractor a hostile
// path that tar.create would normalize away.
function hostileTarball() {
  const header = Buffer.alloc(512);
  const content = Buffer.from('x');
  header.write('pkg/../evil.txt', 0);
  header.write('0000644\0', 100);
  header.write('0000000\0', 108);
  header.write('0000000\0', 116);
  header.write(content.length.toString(8).padStart(11, '0') + '\0', 124);
  header.write('00000000000\0', 136);
  header.write('0', 156);
  header.write('ustar\0', 257);
  header.write('00', 263);
  header.fill(' ', 148, 156);
  let sum = 0;
  for (const b of header) sum += b;
  header.write(sum.toString(8).padStart(6, '0') + '\0 ', 148);
  const tar = Buffer.concat([header, content, Buffer.alloc(512 - content.length), Buffer.alloc(1024)]);
  return zlib.gzipSync(tar);
}

const toBody = (buf) => buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength);
const okResponse = (buf) => ({ ok: true, arrayBuffer: async () => toBody(buf) });
const notFound = { ok: false, status: 404 };

// The resolution call precedes every download: this canned
// response answers it with the commit the suite pins the
// download URLs to.
const RESOLVED = 'f'.repeat(40);
const commitResponse = (sha = RESOLVED) => ({ ok: true, json: async () => ({ sha }) });
const commitsUrl = (repo, ref) => `https://api.github.com/repos/${repo}/commits/${ref}`;

function spyFetch(behaviors) {
  const urls = [];
  const impl = async (url, opts) => {
    urls.push(url);
    const next = behaviors[urls.length - 1] ?? behaviors.at(-1);
    return typeof next === 'function' ? next(opts) : next;
  };
  return { urls, fetch: impl };
}

// A request that hangs until its abort signal fires — it rejects with
// the signal's reason, like undici does on AbortSignal.timeout.
const hangUntilAbort = (opts) => new Promise((_, reject) => {
  opts.signal.addEventListener('abort', () => reject(opts.signal.reason));
});

const bigResponse = (declared, buf) => ({
  ok: true,
  headers: { get: (k) => (k === 'content-length' ? String(declared) : null) },
  arrayBuffer: async () => toBody(buf),
});

test('parseRepoSpec parses owner/repo with and without ref', () => {
  assert.deepEqual(parseRepoSpec('nucleoabierto/mi-paquete'), {
    owner: 'nucleoabierto', name: 'mi-paquete', ref: null,
  });
  assert.deepEqual(parseRepoSpec('o/r@v1.2.0'), { owner: 'o', name: 'r', ref: 'v1.2.0' });
  assert.deepEqual(parseRepoSpec('o/r@cli/v2'), { owner: 'o', name: 'r', ref: 'cli/v2' });
});

test('parseRepoSpec rejects malformed specs', () => {
  for (const spec of [
    'sin-barra', 'a/b/c', 'a//b', 'a b/c', 'a/b@',
    'o/..', '../r', 'o/r@', 'o/r@a..b', 'o/r@a b', 'o/r@a?b',
  ]) {
    assert.equal(parseRepoSpec(spec), null, spec);
  }
});

test('fetchRepoTree fails explicitly without a fetch implementation', async () => {
  const res = await fetchRepoTree({ owner: 'o', name: 'r', ref: null }, {});
  assert.equal(res.ok, false);
  assert.match(res.error, /fetch/);
});

test('fetchRepoTree downloads from codeload and extracts under {tmp}/{repo}', async () => {
  const buf = await makeTarball('o-mi-paquete-abc', {
    'teleprompter.json': '{}',
    'skills/x/SKILL.md': '# x\n',
  });
  const { urls, fetch } = spyFetch([commitResponse(), okResponse(buf)]);
  const tmpBase = tmp();
  const res = await fetchRepoTree({ owner: 'o', name: 'mi-paquete', ref: null }, { fetch, tmpBase });

  assert.equal(res.ok, true);
  assert.equal(res.commit, RESOLVED);
  assert.equal(path.basename(res.dir), 'mi-paquete');
  assert.equal(path.dirname(path.dirname(res.dir)), tmpBase);
  assert.ok(fs.existsSync(path.join(res.dir, 'teleprompter.json')));
  assert.ok(fs.existsSync(path.join(res.dir, 'skills/x/SKILL.md')));
  assert.deepEqual(urls, [
    commitsUrl('o/mi-paquete', 'HEAD'),
    `https://codeload.github.com/o/mi-paquete/tar.gz/${RESOLVED}`,
  ]);

  res.cleanup();
  assert.deepEqual(fs.readdirSync(tmpBase), []);
});

test('fetchRepoTree resolves the given ref and downloads by its commit', async () => {
  const buf = await makeTarball('o-r-def', { 'a.txt': 'a' });
  const { urls, fetch } = spyFetch([commitResponse(), okResponse(buf)]);
  const res = await fetchRepoTree({ owner: 'o', name: 'r', ref: 'v9' }, { fetch, tmpBase: tmp() });
  assert.equal(res.ok, true);
  assert.equal(res.commit, RESOLVED);
  assert.deepEqual(urls, [
    commitsUrl('o/r', 'v9'),
    `https://codeload.github.com/o/r/tar.gz/${RESOLVED}`,
  ]);
  res.cleanup();
});

test('fetchRepoTree takes a full SHA as resolved without an API call', async () => {
  const sha = 'a'.repeat(39) + 'F';
  const buf = await makeTarball('o-r-sha', { 'a.txt': 'a' });
  const { urls, fetch } = spyFetch([okResponse(buf)]);
  const res = await fetchRepoTree({ owner: 'o', name: 'r', ref: sha }, { fetch, tmpBase: tmp() });
  assert.equal(res.ok, true);
  assert.equal(res.commit, sha.toLowerCase());
  assert.deepEqual(urls, [`https://codeload.github.com/o/r/tar.gz/${sha.toLowerCase()}`]);
  res.cleanup();
});

test('fetchRepoTree falls back to the API endpoint when codeload fails', async () => {
  for (const first of [notFound, () => { throw new Error('red caída'); }]) {
    const buf = await makeTarball('o-r-x', { 'a.txt': 'a' });
    const { urls, fetch } = spyFetch([commitResponse(), first, okResponse(buf)]);
    const res = await fetchRepoTree({ owner: 'o', name: 'r', ref: 'v1' }, { fetch, tmpBase: tmp() });
    assert.equal(res.ok, true);
    assert.deepEqual(urls, [
      commitsUrl('o/r', 'v1'),
      `https://codeload.github.com/o/r/tar.gz/${RESOLVED}`,
      `https://api.github.com/repos/o/r/tarball/${RESOLVED}`,
    ]);
    res.cleanup();
  }
});

test('fetchRepoTree reports not found when every endpoint answers HTTP error', async () => {
  const { fetch } = spyFetch([notFound]);
  const tmpBase = tmp();
  const res = await fetchRepoTree({ owner: 'o', name: 'privado', ref: null }, { fetch, tmpBase });
  assert.equal(res.ok, false);
  assert.match(res.error, /no encontrados.*o\/privado/);
  assert.deepEqual(fs.readdirSync(tmpBase), []);
});

test('fetchRepoTree diagnoses download failures after a successful resolution', async () => {
  for (const [status, pattern] of [
    [404, /no encontrados.*o\/r/],
    [403, /acceso denegado.*o\/r/],
    [500, /error de servidor.*o\/r/],
    [418, /HTTP 418.*o\/r/],
  ]) {
    const { fetch } = spyFetch([commitResponse(), { ok: false, status }]);
    const tmpBase = tmp();
    const res = await fetchRepoTree({ owner: 'o', name: 'r', ref: null }, { fetch, tmpBase });
    assert.equal(res.ok, false);
    assert.match(res.error, pattern, `status ${status}`);
    assert.deepEqual(fs.readdirSync(tmpBase), []);
  }
});

test('fetchRepoTree reports unreachable when every request throws', async () => {
  const { fetch } = spyFetch([() => { throw new Error('ENOTFOUND'); }]);
  const tmpBase = tmp();
  const res = await fetchRepoTree({ owner: 'o', name: 'r', ref: 'x' }, { fetch, tmpBase });
  assert.equal(res.ok, false);
  assert.match(res.error, /no se pudo contactar.*o\/r@x/);
  assert.deepEqual(fs.readdirSync(tmpBase), []);
});

test('fetchRepoTree distinguishes server errors from not-found', async () => {
  for (const [status, pattern] of [
    [500, /error de servidor.*o\/r/],
    [502, /error de servidor.*o\/r/],
    [403, /acceso denegado.*o\/r/],
    [401, /acceso denegado.*o\/r/],
    [418, /HTTP 418.*o\/r/],
  ]) {
    const { fetch } = spyFetch([{ ok: false, status }]);
    const tmpBase = tmp();
    const res = await fetchRepoTree({ owner: 'o', name: 'r', ref: null }, { fetch, tmpBase });
    assert.equal(res.ok, false);
    assert.match(res.error, pattern, `status ${status}`);
    assert.deepEqual(fs.readdirSync(tmpBase), []);
  }
});

test('fetchRepoTree reports server error when endpoints disagree', async () => {
  const { fetch } = spyFetch([commitResponse(), { ok: false, status: 404 }, { ok: false, status: 500 }]);
  const res = await fetchRepoTree({ owner: 'o', name: 'r', ref: null }, { fetch, tmpBase: tmp() });
  assert.equal(res.ok, false);
  assert.match(res.error, /error de servidor/);
});

test('fetchRepoTree tries the next endpoint when a request times out', async () => {
  const buf = await makeTarball('o-r-t', { 'a.txt': 'a' });
  const { urls, fetch } = spyFetch([commitResponse(), hangUntilAbort, okResponse(buf)]);
  const res = await fetchRepoTree(
    { owner: 'o', name: 'r', ref: null },
    { fetch, tmpBase: tmp(), timeoutMs: 25 },
  );
  assert.equal(res.ok, true);
  assert.equal(urls.length, 3);
  res.cleanup();
});

test('fetchRepoTree reports the timeout when every request expires', async () => {
  const { fetch } = spyFetch([hangUntilAbort]);
  const tmpBase = tmp();
  const res = await fetchRepoTree(
    { owner: 'o', name: 'r', ref: null },
    { fetch, tmpBase, timeoutMs: 25 },
  );
  assert.equal(res.ok, false);
  assert.match(res.error, /tiempo máximo excedido.*o\/r/);
  assert.deepEqual(fs.readdirSync(tmpBase), []);
});

test('fetchRepoTree stays generic when only some requests time out', async () => {
  const { fetch } = spyFetch([() => { throw new Error('ENOTFOUND'); }, hangUntilAbort]);
  const res = await fetchRepoTree(
    { owner: 'o', name: 'r', ref: null },
    { fetch, tmpBase: tmp(), timeoutMs: 25 },
  );
  assert.equal(res.ok, false);
  assert.match(res.error, /no se pudo contactar con GitHub: o\/r/);
  assert.doesNotMatch(res.error, /tiempo máximo/);
});

test('fetchRepoTree reports an unexpected response without a status', async () => {
  const { fetch } = spyFetch([{ ok: false }]);
  const res = await fetchRepoTree(
    { owner: 'o', name: 'r', ref: null },
    { fetch, tmpBase: tmp() },
  );
  assert.equal(res.ok, false);
  assert.match(res.error, /respuesta inesperada.*o\/r/);
});

test('fetchRepoTree reports an unexpected download response without a status', async () => {
  const { fetch } = spyFetch([commitResponse(), { ok: false }]);
  const res = await fetchRepoTree(
    { owner: 'o', name: 'r', ref: null },
    { fetch, tmpBase: tmp() },
  );
  assert.equal(res.ok, false);
  assert.match(res.error, /respuesta inesperada.*o\/r/);
});

test('fetchRepoTree rejects an oversized declared length without reading the body', async () => {
  let bodyRead = false;
  const impl = async (url) => url.includes('/commits/') ? commitResponse() : ({
    ok: true,
    headers: { get: () => '1048576' },
    arrayBuffer: async () => { bodyRead = true; return new ArrayBuffer(0); },
  });
  const tmpBase = tmp();
  const res = await fetchRepoTree(
    { owner: 'o', name: 'r', ref: null },
    { fetch: impl, tmpBase, maxBytes: 1024 },
  );
  assert.equal(res.ok, false);
  assert.match(res.error, /tamaño máximo/);
  assert.equal(bodyRead, false);
  assert.deepEqual(fs.readdirSync(tmpBase), []);
});

test('fetchRepoTree rejects an oversized body without declared length', async () => {
  const { fetch } = spyFetch([commitResponse(), bigResponse(0, Buffer.alloc(2048))]);
  const tmpBase = tmp();
  const res = await fetchRepoTree(
    { owner: 'o', name: 'r', ref: null },
    { fetch, tmpBase, maxBytes: 1024 },
  );
  assert.equal(res.ok, false);
  assert.match(res.error, /tamaño máximo/);
  assert.deepEqual(fs.readdirSync(tmpBase), []);
});

test('fetchRepoTree accepts a body exactly at the size limit', async () => {
  const buf = await makeTarball('o-r-b', { 'a.txt': 'a' });
  const { fetch } = spyFetch([commitResponse(), okResponse(buf)]);
  const res = await fetchRepoTree(
    { owner: 'o', name: 'r', ref: null },
    { fetch, tmpBase: tmp(), maxBytes: buf.byteLength },
  );
  assert.equal(res.ok, true);
  res.cleanup();
});

test('fetchRepoTree reports a body-read failure and a mid-download timeout', async () => {
  const failing = (error) => async (url) => url.includes('/commits/') ? commitResponse() : ({
    ok: true,
    arrayBuffer: async () => { throw error; },
  });
  const timeout = new Error('agotado');
  timeout.name = 'TimeoutError';
  for (const [impl, pattern] of [
    [failing(new Error('corte de red')), /la descarga falló.*o\/r/],
    [failing(timeout), /tiempo máximo excedido.*o\/r/],
  ]) {
    const tmpBase = tmp();
    const res = await fetchRepoTree({ owner: 'o', name: 'r', ref: null }, { fetch: impl, tmpBase });
    assert.equal(res.ok, false);
    assert.match(res.error, pattern);
    assert.deepEqual(fs.readdirSync(tmpBase), []);
  }
});

test('fetchRepoTree reports a temp-dir failure instead of throwing', async () => {
  const work = tmp();
  const blocker = path.join(work, 'bloqueo');
  fs.writeFileSync(blocker, 'x');
  const { fetch } = spyFetch([notFound]);
  const res = await fetchRepoTree(
    { owner: 'o', name: 'r', ref: null },
    { fetch, tmpBase: path.join(blocker, 'imposible') },
  );
  assert.equal(res.ok, false);
  assert.match(res.error, /directorio temporal/);
});

test('fetchRepoTree reports extraction failure on a corrupt archive', async () => {
  const { fetch } = spyFetch([commitResponse(), okResponse(Buffer.from('no es un tar.gz'))]);
  const tmpBase = tmp();
  const res = await fetchRepoTree({ owner: 'o', name: 'r', ref: null }, { fetch, tmpBase });
  assert.equal(res.ok, false);
  assert.match(res.error, /no se pudo extraer/);
  assert.deepEqual(fs.readdirSync(tmpBase), []);
});

test('fetchRepoTree does not let a hostile entry escape the temp dir', async () => {
  const { fetch } = spyFetch([commitResponse(), okResponse(hostileTarball())]);
  const tmpBase = tmp();
  const res = await fetchRepoTree({ owner: 'o', name: 'r', ref: null }, { fetch, tmpBase });
  if (res.ok) {
    assert.equal(fs.existsSync(path.join(path.dirname(res.dir), 'evil.txt')), false);
    res.cleanup();
  }
  assert.deepEqual(fs.readdirSync(tmpBase), []);
});

test('fetchRepoTree reports a nonexistent ref from the resolution call', async () => {
  const { urls, fetch } = spyFetch([{ ok: false, status: 422 }]);
  const res = await fetchRepoTree(
    { owner: 'o', name: 'r', ref: 'no-existe' },
    { fetch, tmpBase: tmp() },
  );
  assert.equal(res.ok, false);
  assert.match(res.error, /no encontrados.*o\/r@no-existe/);
  assert.deepEqual(urls, [commitsUrl('o/r', 'no-existe')]);
});

test('fetchRepoTree aborts before any download when resolution fails', async () => {
  for (const behavior of [
    { ok: false, status: 422 },
    () => { throw new Error('red caída'); },
    { ok: true, json: async () => ({ sha: 'no-es-un-sha' }) },
    { ok: true, json: async () => ({}) },
  ]) {
    const { urls, fetch } = spyFetch([behavior]);
    const res = await fetchRepoTree({ owner: 'o', name: 'r', ref: null }, { fetch, tmpBase: tmp() });
    assert.equal(res.ok, false);
    assert.equal(urls.length, 1, `sin descarga tras ${JSON.stringify(res.error)}`);
    assert.ok(urls[0].includes('/commits/'));
  }
});

test('fetchRepoTree reports an unexpected resolution response', async () => {
  for (const behavior of [
    { ok: true, json: async () => ({ sha: 'no-es-un-sha' }) },
    { ok: true, json: async () => { throw new Error('JSON.parse'); } },
    { ok: true },
  ]) {
    const { fetch } = spyFetch([behavior]);
    const res = await fetchRepoTree({ owner: 'o', name: 'r', ref: null }, { fetch, tmpBase: tmp() });
    assert.equal(res.ok, false);
    assert.match(res.error, /respuesta inesperada.*o\/r/);
  }
});

test('fetchRepoTree reports the resolution timeout as unreachable', async () => {
  const { fetch } = spyFetch([hangUntilAbort]);
  const res = await fetchRepoTree(
    { owner: 'o', name: 'r', ref: 'v1' },
    { fetch, tmpBase: tmp(), timeoutMs: 25 },
  );
  assert.equal(res.ok, false);
  assert.match(res.error, /tiempo máximo excedido.*o\/r@v1/);
});
