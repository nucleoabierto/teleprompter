import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { create as tarCreate } from 'tar';
import { publishedVersion } from '../src/probe.js';

function tmp() {
  return fs.mkdtempSync(path.join(os.tmpdir(), 'teleprompter-test-'));
}

function writePkg(dir, manifest, files = {}) {
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, 'teleprompter.json'), JSON.stringify(manifest));
  for (const [name, content] of Object.entries(files)) {
    const p = path.join(dir, name);
    fs.mkdirSync(path.dirname(p), { recursive: true });
    fs.writeFileSync(p, content);
  }
}

function validManifest(name, extra = {}) {
  return {
    name,
    version: '1.0.0',
    install: [{ source: 'a.txt', target: 'a.txt' }],
    ...extra,
  };
}

function writeCollection(dir, members, index = {}) {
  writePkg(dir, {
    collection: true,
    name: path.basename(dir),
    packages: members.map(({ path: p }) => ({ path: p })),
    ...index,
  });
  for (const member of members) {
    writePkg(path.join(dir, member.path),
      member.manifest ?? validManifest(path.basename(member.path)),
      member.files ?? { 'a.txt': 'a' });
  }
}

const pathSource = (dir) => ({ kind: 'path', dir });
const repoSource = (repo, ref = null) => ({ kind: 'repo', spec: { owner: 'o', name: repo, ref } });

// GitHub archives wrap the tree in a root directory, which the
// extractor strips; the same helper shape fetch.test.js uses.
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

const toBody = (buf) => buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength);
const RESOLVED = 'f'.repeat(40);
const commitResponse = () => ({ ok: true, json: async () => ({ sha: RESOLVED }) });
const okResponse = (buf) => ({ ok: true, arrayBuffer: async () => toBody(buf) });

// A fetch spy answering the commit resolution and the archive
// download from a canned tarball.
const remoteOk = (buf) => (url) => Promise.resolve(
  url.includes('/commits/') ? commitResponse() : okResponse(buf));

const tarballOf = (files) => makeTarball('o-repo-abc', files);
const pkgTarball = (manifest) => tarballOf({
  'teleprompter.json': JSON.stringify(manifest),
  'a.txt': 'a',
});

test('a local path reports the version its manifest declares', async () => {
  const dir = path.join(tmp(), 'p');
  writePkg(dir, validManifest('p', { version: '2.3.4' }), { 'a.txt': 'a' });
  const probe = await publishedVersion({}, pathSource(dir));
  assert.deepEqual(probe, { ok: true, version: '2.3.4' });
});

test('a local collection reports the version of the selected member', async () => {
  const coll = path.join(tmp(), 'familia');
  writeCollection(coll, [
    { path: 'alfa', manifest: validManifest('alfa', { version: '1.1.0' }) },
    { path: 'beta', manifest: validManifest('beta', { version: '4.5.6' }) },
  ]);
  const probe = await publishedVersion({}, pathSource(coll), 'beta');
  assert.deepEqual(probe, { ok: true, version: '4.5.6' });
});

test('a collection without a selected member fails the probe', async () => {
  const coll = path.join(tmp(), 'familia');
  writeCollection(coll, [{ path: 'alfa' }]);
  const probe = await publishedVersion({}, pathSource(coll));
  assert.equal(probe.ok, false);
  assert.match(probe.error, /colección/);
});

test('a member the index does not name fails the probe', async () => {
  const coll = path.join(tmp(), 'familia');
  writeCollection(coll, [{ path: 'alfa' }]);
  const probe = await publishedVersion({}, pathSource(coll), 'beta');
  assert.equal(probe.ok, false);
  assert.match(probe.error, /no tiene el paquete/);
});

test('a malformed collection index fails the probe', async () => {
  const dir = path.join(tmp(), 'familia');
  writePkg(dir, { collection: true, name: 'familia', packages: 'no-una-lista' });
  const probe = await publishedVersion({}, pathSource(dir), 'alfa');
  assert.equal(probe.ok, false);
});

test('a malformed package manifest fails the probe', async () => {
  const dir = path.join(tmp(), 'p');
  writePkg(dir, { name: 'p' });
  const probe = await publishedVersion({}, pathSource(dir));
  assert.equal(probe.ok, false);
  assert.match(probe.error, /version/);
});

test('a repo reports the version its remote manifest declares', async () => {
  const spy = remoteOk(await pkgTarball(validManifest('p', { version: '9.8.7' })));
  const probe = await publishedVersion({ fetch: spy, tmpBase: tmp() }, repoSource('p'));
  assert.deepEqual(probe, { ok: true, version: '9.8.7' });
});

test('a repo collection reports the version of the selected member', async () => {
  const buf = await tarballOf({
    'teleprompter.json': JSON.stringify({
      collection: true, name: 'familia', packages: [{ path: 'beta' }],
    }),
    'beta/teleprompter.json': JSON.stringify(validManifest('beta', { version: '3.2.1' })),
    'beta/a.txt': 'a',
  });
  const probe = await publishedVersion({ fetch: remoteOk(buf), tmpBase: tmp() },
    repoSource('familia'), 'beta');
  assert.deepEqual(probe, { ok: true, version: '3.2.1' });
});

test('a failed fetch propagates the error and leaves no temp behind', async () => {
  const tmpBase = tmp();
  const spy = () => Promise.resolve({ ok: false, status: 404 });
  const probe = await publishedVersion({ fetch: spy, tmpBase }, repoSource('falta'));
  assert.equal(probe.ok, false);
  assert.equal(fs.readdirSync(tmpBase).length, 0);
});

test('a failed probe after a successful download leaves no temp behind', async () => {
  const tmpBase = tmp();
  const buf = await pkgTarball({ name: 'roto' });
  const probe = await publishedVersion({ fetch: remoteOk(buf), tmpBase }, repoSource('roto'));
  assert.equal(probe.ok, false);
  assert.equal(fs.readdirSync(tmpBase).length, 0);
});
