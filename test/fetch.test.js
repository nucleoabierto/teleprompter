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

function spyFetch(behaviors) {
  const urls = [];
  const impl = async (url) => {
    urls.push(url);
    const next = behaviors[urls.length - 1] ?? behaviors.at(-1);
    return typeof next === 'function' ? next() : next;
  };
  return { urls, fetch: impl };
}

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
  const { urls, fetch } = spyFetch([okResponse(buf)]);
  const tmpBase = tmp();
  const res = await fetchRepoTree({ owner: 'o', name: 'mi-paquete', ref: null }, { fetch, tmpBase });

  assert.equal(res.ok, true);
  assert.equal(path.basename(res.dir), 'mi-paquete');
  assert.equal(path.dirname(path.dirname(res.dir)), tmpBase);
  assert.ok(fs.existsSync(path.join(res.dir, 'teleprompter.json')));
  assert.ok(fs.existsSync(path.join(res.dir, 'skills/x/SKILL.md')));
  assert.deepEqual(urls, ['https://codeload.github.com/o/mi-paquete/tar.gz/HEAD']);

  res.cleanup();
  assert.deepEqual(fs.readdirSync(tmpBase), []);
});

test('fetchRepoTree asks for the ref in the URL when given', async () => {
  const buf = await makeTarball('o-r-def', { 'a.txt': 'a' });
  const { urls, fetch } = spyFetch([okResponse(buf)]);
  const res = await fetchRepoTree({ owner: 'o', name: 'r', ref: 'v9' }, { fetch, tmpBase: tmp() });
  assert.equal(res.ok, true);
  assert.deepEqual(urls, ['https://codeload.github.com/o/r/tar.gz/v9']);
  res.cleanup();
});

test('fetchRepoTree falls back to the API endpoint when codeload fails', async () => {
  for (const first of [notFound, () => { throw new Error('red caída'); }]) {
    const buf = await makeTarball('o-r-x', { 'a.txt': 'a' });
    const { urls, fetch } = spyFetch([first, okResponse(buf)]);
    const res = await fetchRepoTree({ owner: 'o', name: 'r', ref: 'v1' }, { fetch, tmpBase: tmp() });
    assert.equal(res.ok, true);
    assert.deepEqual(urls, [
      'https://codeload.github.com/o/r/tar.gz/v1',
      'https://api.github.com/repos/o/r/tarball/v1',
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

test('fetchRepoTree reports unreachable when every request throws', async () => {
  const { fetch } = spyFetch([() => { throw new Error('ENOTFOUND'); }]);
  const tmpBase = tmp();
  const res = await fetchRepoTree({ owner: 'o', name: 'r', ref: 'x' }, { fetch, tmpBase });
  assert.equal(res.ok, false);
  assert.match(res.error, /no se pudo contactar.*o\/r@x/);
  assert.deepEqual(fs.readdirSync(tmpBase), []);
});

test('fetchRepoTree reports extraction failure on a corrupt archive', async () => {
  const { fetch } = spyFetch([okResponse(Buffer.from('no es un tar.gz'))]);
  const tmpBase = tmp();
  const res = await fetchRepoTree({ owner: 'o', name: 'r', ref: null }, { fetch, tmpBase });
  assert.equal(res.ok, false);
  assert.match(res.error, /no se pudo extraer/);
  assert.deepEqual(fs.readdirSync(tmpBase), []);
});

test('fetchRepoTree does not let a hostile entry escape the temp dir', async () => {
  const { fetch } = spyFetch([okResponse(hostileTarball())]);
  const tmpBase = tmp();
  const res = await fetchRepoTree({ owner: 'o', name: 'r', ref: null }, { fetch, tmpBase });
  if (res.ok) {
    assert.equal(fs.existsSync(path.join(path.dirname(res.dir), 'evil.txt')), false);
    res.cleanup();
  }
  assert.deepEqual(fs.readdirSync(tmpBase), []);
});
