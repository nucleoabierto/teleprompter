import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { resolveSet } from '../src/dependencies.js';

function tmp() {
  return fs.mkdtempSync(path.join(os.tmpdir(), 'teleprompter-'));
}

function writePkg(dir, manifest, files = { 'a.txt': 'a' }) {
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, 'teleprompter.json'), JSON.stringify(manifest));
  for (const [name, content] of Object.entries(files)) {
    const p = path.join(dir, name);
    fs.mkdirSync(path.dirname(p), { recursive: true });
    fs.writeFileSync(p, content);
  }
}

function memberManifest(name, extra = {}) {
  return {
    name,
    version: '1.0.0',
    install: [{ source: 'a.txt', target: 'a.txt' }],
    ...extra,
  };
}

// A collection fixture mirroring cli.test.js's: the index manifest at
// the root plus one package directory per member.
function writeCollection(dir, members, index = {}) {
  writePkg(dir, {
    collection: true,
    name: path.basename(dir),
    packages: members.map(({ path: p }) => ({ path: p })),
    ...index,
  });
  for (const member of members) {
    writePkg(path.join(dir, member.path), member.manifest ?? memberManifest(path.basename(member.path)));
  }
}

const names = (resolved) => resolved.units.map((u) => u.name ?? '(root)');

test('a member without dependencies resolves to itself', async () => {
  const coll = path.join(tmp(), 'coleccion');
  writeCollection(coll, [{ path: 'alfa' }]);
  const resolved = await resolveSet({}, coll, [{ dir: path.join(coll, 'alfa'), name: 'alfa' }]);
  assert.equal(resolved.ok, true);
  assert.deepEqual(names(resolved), ['alfa']);
});

test('a declared dependency resolves before its dependent', async () => {
  const coll = path.join(tmp(), 'coleccion');
  writeCollection(coll, [
    { path: 'app', manifest: memberManifest('app', { dependencies: [{ package: 'lib' }] }) },
    { path: 'lib' },
  ]);
  const resolved = await resolveSet({}, coll, [{ dir: path.join(coll, 'app'), name: 'app' }]);
  assert.equal(resolved.ok, true);
  assert.deepEqual(names(resolved), ['lib', 'app']);
});

test('a transitive chain resolves in dependency order', async () => {
  const coll = path.join(tmp(), 'coleccion');
  writeCollection(coll, [
    { path: 'a', manifest: memberManifest('a', { dependencies: [{ package: 'b' }] }) },
    { path: 'b', manifest: memberManifest('b', { dependencies: [{ package: 'c' }] }) },
    { path: 'c' },
  ]);
  const resolved = await resolveSet({}, coll, [{ dir: path.join(coll, 'a'), name: 'a' }]);
  assert.equal(resolved.ok, true);
  assert.deepEqual(names(resolved), ['c', 'b', 'a']);
});

test('a piece reached through two paths resolves once', async () => {
  const coll = path.join(tmp(), 'coleccion');
  writeCollection(coll, [
    { path: 'a', manifest: memberManifest('a', { dependencies: [{ package: 'c' }] }) },
    { path: 'b', manifest: memberManifest('b', { dependencies: [{ package: 'c' }] }) },
    { path: 'c' },
  ]);
  const resolved = await resolveSet({}, coll, [
    { dir: path.join(coll, 'a'), name: 'a' },
    { dir: path.join(coll, 'b'), name: 'b' },
  ]);
  assert.equal(resolved.ok, true);
  assert.deepEqual(names(resolved), ['c', 'a', 'b']);
});

test('a repeated dependency entry is one piece, its ranges united', async () => {
  const coll = path.join(tmp(), 'coleccion');
  writeCollection(coll, [
    {
      path: 'a',
      manifest: memberManifest('a', {
        dependencies: [
          { package: 'b', version: '>=1.0.0' },
          { package: 'b', version: '<2.0.0' },
        ],
      }),
    },
    { path: 'b', manifest: memberManifest('b', { version: '1.4.0' }) },
  ]);
  const resolved = await resolveSet({}, coll, [{ dir: path.join(coll, 'a'), name: 'a' }]);
  assert.equal(resolved.ok, true);
  assert.deepEqual(names(resolved), ['b', 'a']);
});

test('a satisfied restriction resolves; an unsatisfied one aborts', async () => {
  const coll = path.join(tmp(), 'coleccion');
  const member = (version) => memberManifest('b', { version });
  writeCollection(coll, [
    { path: 'a', manifest: memberManifest('a', { dependencies: [{ package: 'b', version: '^1.0.0' }] }) },
    { path: 'b', manifest: member('1.4.0') },
  ]);
  const units = [{ dir: path.join(coll, 'a'), name: 'a' }];
  assert.equal((await resolveSet({}, coll, units)).ok, true);

  const coll2 = path.join(tmp(), 'coleccion');
  writeCollection(coll2, [
    { path: 'a', manifest: memberManifest('a', { dependencies: [{ package: 'b', version: '^2.0.0' }] }) },
    { path: 'b', manifest: member('1.4.0') },
  ]);
  const bad = await resolveSet({}, coll2, [{ dir: path.join(coll2, 'a'), name: 'a' }]);
  assert.equal(bad.ok, false);
  assert.ok(bad.errors.some((e) => /"b"@1\.4\.0 no satisface "\^2\.0\.0" exigida por "a"/.test(e)));
});

test('restrictions impossible together abort the set', async () => {
  const coll = path.join(tmp(), 'coleccion');
  writeCollection(coll, [
    { path: 'a', manifest: memberManifest('a', { dependencies: [{ package: 'c', version: '>=2.0.0' }] }) },
    { path: 'b', manifest: memberManifest('b', { dependencies: [{ package: 'c', version: '<2.0.0' }] }) },
    { path: 'c', manifest: memberManifest('c', { version: '1.5.0' }) },
  ]);
  const bad = await resolveSet({}, coll, [
    { dir: path.join(coll, 'a'), name: 'a' },
    { dir: path.join(coll, 'b'), name: 'b' },
  ]);
  assert.equal(bad.ok, false);
  assert.ok(bad.errors.some((e) => /no satisface ">=2\.0\.0" exigida por "a"/.test(e)));
});

test('a cycle aborts with its legible path; self-inclusion is a cycle of one', async () => {
  const coll = path.join(tmp(), 'coleccion');
  writeCollection(coll, [
    { path: 'a', manifest: memberManifest('a', { dependencies: [{ package: 'b' }] }) },
    { path: 'b', manifest: memberManifest('b', { dependencies: [{ package: 'a' }] }) },
  ]);
  const bad = await resolveSet({}, coll, [{ dir: path.join(coll, 'a'), name: 'a' }]);
  assert.equal(bad.ok, false);
  assert.ok(bad.errors.some((e) => /dependencia circular: a → b → a/.test(e)));

  const coll2 = path.join(tmp(), 'coleccion');
  writeCollection(coll2, [
    { path: 'a', manifest: memberManifest('a', { dependencies: [{ package: 'a' }] }) },
  ]);
  const self = await resolveSet({}, coll2, [{ dir: path.join(coll2, 'a'), name: 'a' }]);
  assert.equal(self.ok, false);
  assert.ok(self.errors.some((e) => /dependencia circular: a → a/.test(e)));
});

test('a dependency on a missing member aborts with diagnosis', async () => {
  const coll = path.join(tmp(), 'coleccion');
  writeCollection(coll, [
    { path: 'a', manifest: memberManifest('a', { dependencies: [{ package: 'fantasma' }] }) },
  ]);
  const bad = await resolveSet({}, coll, [{ dir: path.join(coll, 'a'), name: 'a' }]);
  assert.equal(bad.ok, false);
  assert.ok(bad.errors.some((e) => /"fantasma".*no existe en el origen/.test(e)));
});

test('a member whose manifest does not load is an unreachable piece', async () => {
  const coll = path.join(tmp(), 'coleccion');
  writeCollection(coll, [
    { path: 'a', manifest: memberManifest('a', { dependencies: [{ package: 'b' }] }) },
    { path: 'b', manifest: { name: 'b' } },
  ]);
  const bad = await resolveSet({}, coll, [{ dir: path.join(coll, 'a'), name: 'a' }]);
  assert.equal(bad.ok, false);
  assert.ok(bad.errors.some((e) => /"b" no es alcanzable: su manifiesto es inválido/.test(e)));
});

test('a duplicated index name makes the dependency ambiguous', async () => {
  const coll = path.join(tmp(), 'coleccion');
  writeCollection(coll, [
    { path: 'a', manifest: memberManifest('a', { dependencies: [{ package: 'b' }] }) },
    { path: 'x/b' },
    { path: 'y/b' },
  ]);
  const bad = await resolveSet({}, coll, [{ dir: path.join(coll, 'a'), name: 'a' }]);
  assert.equal(bad.ok, false);
  assert.ok(bad.errors.some((e) => /"b" aparece varias veces/.test(e)));
});

test('a broken collection index leaves every dependency unresolvable', async () => {
  const coll = path.join(tmp(), 'coleccion');
  writeCollection(coll, [
    { path: 'a', manifest: memberManifest('a', { dependencies: [{ package: 'b' }] }) },
  ], { packages: 'roto' });
  const bad = await resolveSet({}, coll, [{ dir: path.join(coll, 'a'), name: 'a' }]);
  assert.equal(bad.ok, false);
  assert.ok(bad.errors.some((e) => /"b".*no existe en el origen/.test(e)));
});

test('a standalone package declares other pieces unreachable and itself a cycle', async () => {
  const pkg = path.join(tmp(), 'a');
  writePkg(pkg, memberManifest('a', { dependencies: [{ package: 'b' }] }));
  const bad = await resolveSet({}, pkg, [{ dir: pkg }]);
  assert.equal(bad.ok, false);
  assert.ok(bad.errors.some((e) => /"b".*no existe en el origen/.test(e)));

  const selfPkg = path.join(tmp(), 'a');
  writePkg(selfPkg, memberManifest('a', { dependencies: [{ package: 'a' }] }));
  const self = await resolveSet({}, selfPkg, [{ dir: selfPkg }]);
  assert.equal(self.ok, false);
  assert.ok(self.errors.some((e) => /dependencia circular: a → a/.test(e)));
});

test('a selected unit whose manifest does not load is unreachable', async () => {
  const coll = path.join(tmp(), 'coleccion');
  writeCollection(coll, [{ path: 'a', manifest: { name: 'a' } }]);
  const bad = await resolveSet({}, coll, [{ dir: path.join(coll, 'a'), name: 'a' }]);
  assert.equal(bad.ok, false);
  assert.ok(bad.errors.some((e) => /"a" no es alcanzable: su manifiesto es inválido/.test(e)));

  const pkg = path.join(tmp(), 'rota');
  writePkg(pkg, '{');
  const worse = await resolveSet({}, pkg, [{ dir: pkg }]);
  assert.equal(worse.ok, false);
  assert.ok(worse.errors.some((e) => /pieza seleccionada no es alcanzable/.test(e)));
});

test('a selected unit carries no name when it is not an index member', async () => {
  const pkg = path.join(tmp(), 'a');
  writePkg(pkg, memberManifest('a'));
  const resolved = await resolveSet({}, pkg, [{ dir: pkg }]);
  assert.equal(resolved.ok, true);
  assert.deepEqual(resolved.units, [{ dir: pkg }]);
});

// — External origins —
// A tarball helper mirroring cli.test.js's: GitHub archives wrap the
// tree in a root directory that the extractor strips.
import { create as tarCreate } from 'tar';

const RESOLVED = 'f'.repeat(40);

async function repoTarball(name, manifest, files = { 'a.txt': 'a' }) {
  const work = tmp();
  writePkg(path.join(work, `${name}-abc123`), manifest, files);
  const archive = path.join(work, 'a.tgz');
  await tarCreate({ gzip: true, file: archive, cwd: work }, [`${name}-abc123`]);
  return fs.readFileSync(archive);
}

// A fetch spy routing the commits-API call to the commit response and
// every tarball URL to the buffer its repo maps to — keyed by the
// repo segment of the URL.
const fetchFor = (archives, commit = RESOLVED) => {
  const spy = { calls: 0 };
  spy.fetch = async (url) => {
    spy.calls += 1;
    if (url.includes('/commits/')) {
      return { ok: true, json: async () => ({ sha: commit }) };
    }
    for (const [repo, buf] of Object.entries(archives)) {
      if (url.includes(`/${repo}/`)) {
        return { ok: true, arrayBuffer: async () => buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength) };
      }
    }
    return { ok: false, status: 404 };
  };
  return spy;
};

test('a dependency with a path origin resolves the local piece', async () => {
  const root = tmp();
  const pkg = path.join(root, 'a');
  const sibling = path.join(root, 'sibling');
  writePkg(pkg, memberManifest('a', {
    dependencies: [{ package: 'sibling', origin: { path: '../sibling' } }],
  }));
  writePkg(sibling, memberManifest('sibling'));
  const resolved = await resolveSet({}, pkg, [{ dir: pkg }]);
  assert.equal(resolved.ok, true, resolved.errors?.join(', '));
  const unit = resolved.units.find((u) => u.dir === sibling);
  assert.ok(unit);
  assert.equal(unit.name, undefined);
  assert.deepEqual(unit.origin, { type: 'path', path: sibling });
});

test('a dependency with a repo origin is fetched, anchored and recorded', async () => {
  const buf = await repoTarball('dep', memberManifest('dep'));
  const spy = fetchFor({ dep: buf });
  const io = { fetch: spy.fetch, tmpBase: tmp() };
  const pkg = path.join(tmp(), 'a');
  writePkg(pkg, memberManifest('a', {
    dependencies: [{ package: 'dep', origin: { repo: 'o/dep@v1' } }],
  }));
  const resolved = await resolveSet(io, pkg, [{ dir: pkg }]);
  assert.equal(resolved.ok, true, resolved.errors?.join(', '));
  const unit = resolved.units.find((u) => u.origin !== undefined);
  assert.deepEqual(unit.origin, { type: 'github', repo: 'o/dep', ref: 'v1', commit: RESOLVED });
  assert.equal(resolved.cleanups.length, 1);
  resolved.cleanups.forEach((c) => c());
});

test('a member of an external collection is selected by name', async () => {
  const buf = await repoTarball('suite', {
    collection: true, name: 'suite', packages: [{ path: 'pieza' }, { path: 'otra' }],
  });
  // The tarball packs both member dirs beside the collection index.
  const work = tmp();
  const suiteDir = path.join(work, 'suite-abc123');
  writePkg(suiteDir, {
    collection: true, name: 'suite', packages: [{ path: 'pieza' }, { path: 'otra' }],
  });
  writePkg(path.join(suiteDir, 'pieza'), memberManifest('pieza'));
  writePkg(path.join(suiteDir, 'otra'), memberManifest('otra'));
  const archive = path.join(work, 'a.tgz');
  await tarCreate({ gzip: true, file: archive, cwd: work }, ['suite-abc123']);
  const spy = fetchFor({ suite: fs.readFileSync(archive) });
  const io = { fetch: spy.fetch, tmpBase: tmp() };
  const pkg = path.join(tmp(), 'a');
  writePkg(pkg, memberManifest('a', {
    dependencies: [{ package: 'pieza', origin: { repo: 'o/suite' } }],
  }));
  const resolved = await resolveSet(io, pkg, [{ dir: pkg }]);
  assert.equal(resolved.ok, true, resolved.errors?.join(', '));
  const unit = resolved.units.find((u) => u.name === 'pieza');
  assert.ok(unit);
  assert.equal(unit.origin.repo, 'o/suite');
  assert.ok(unit.dir.endsWith(path.join('suite', 'pieza')));
});

test('an external package whose name differs from the declared is rejected', async () => {
  const buf = await repoTarball('otro', memberManifest('otro'));
  const spy = fetchFor({ otro: buf });
  const io = { fetch: spy.fetch, tmpBase: tmp() };
  const pkg = path.join(tmp(), 'a');
  writePkg(pkg, memberManifest('a', {
    dependencies: [{ package: 'dep', origin: { repo: 'o/otro' } }],
  }));
  const bad = await resolveSet(io, pkg, [{ dir: pkg }]);
  assert.equal(bad.ok, false);
  assert.ok(bad.errors.some((e) => /publica "otro", no "dep"/.test(e)));
});

test('the walk crosses origins transitively', async () => {
  // dep declares lib inside its own tree (same-origin within o1) and
  // tool in another origin — o1 is a collection so lib resolves in it.
  const work = tmp();
  const o1dir = path.join(work, 'o1-abc123');
  writePkg(o1dir, { collection: true, name: 'o1', packages: [{ path: 'dep' }, { path: 'lib' }] });
  writePkg(path.join(o1dir, 'dep'), memberManifest('dep', {
    dependencies: [
      { package: 'lib' },
      { package: 'tool', origin: { repo: 'o2/tool' } },
    ],
  }));
  writePkg(path.join(o1dir, 'lib'), memberManifest('lib'));
  const a1 = path.join(work, 'a1.tgz');
  await tarCreate({ gzip: true, file: a1, cwd: work }, ['o1-abc123']);
  const toolBuf = await repoTarball('tool', memberManifest('tool'));
  const spy = fetchFor({ 'o1': fs.readFileSync(a1), 'tool': toolBuf });
  const io = { fetch: spy.fetch, tmpBase: tmp() };
  const pkg = path.join(tmp(), 'a');
  writePkg(pkg, memberManifest('a', {
    dependencies: [{ package: 'dep', origin: { repo: 'o/o1' } }],
  }));
  const resolved = await resolveSet(io, pkg, [{ dir: pkg }]);
  assert.equal(resolved.ok, true, resolved.errors?.join(', '));
  const idx = (p) => resolved.units.findIndex(p);
  // lib resolves in dep's own tree; tool in a third origin — both
  // install before dep, dep before the root package.
  assert.ok(idx((u) => u.name === 'lib') < idx((u) => u.name === 'dep'));
  assert.ok(idx((u) => u.origin?.repo === 'o2/tool') < idx((u) => u.name === 'dep'));
  assert.ok(idx((u) => u.name === undefined && u.origin === undefined) === resolved.units.length - 1);
  assert.equal(resolved.units.find((u) => u.name === 'lib').origin.repo, 'o/o1');
});

test('a cycle that crosses origins aborts with its legible path', async () => {
  // root → a@o1/a → b@o2/b → a@o1/a: both ends of the edge live in
  // the same external origin, so the walk closes a true cycle, not
  // an identity conflict.
  const aBuf = await repoTarball('a', memberManifest('a', {
    dependencies: [{ package: 'b', origin: { repo: 'o2/b' } }],
  }));
  const bBuf = await repoTarball('b', memberManifest('b', {
    dependencies: [{ package: 'a', origin: { repo: 'o1/a' } }],
  }));
  const spy = fetchFor({ 'a': aBuf, 'b': bBuf });
  const io = { fetch: spy.fetch, tmpBase: tmp() };
  const pkg = path.join(tmp(), 'main');
  writePkg(pkg, memberManifest('main', {
    dependencies: [{ package: 'a', origin: { repo: 'o1/a' } }],
  }));
  const bad = await resolveSet(io, pkg, [{ dir: pkg }]);
  assert.equal(bad.ok, false);
  assert.ok(bad.errors.some((e) => /dependencia circular: a@o1\/a → b@o2\/b → a@o1\/a/.test(e)),
    bad.errors.join(', '));
});

test('the same name demanded from two different origins is a conflict', async () => {
  const buf = await repoTarball('b', memberManifest('b'));
  const spy = fetchFor({ b: buf });
  const io = { fetch: spy.fetch, tmpBase: tmp() };
  const coll = path.join(tmp(), 'coleccion');
  writeCollection(coll, [
    {
      path: 'a',
      manifest: memberManifest('a', {
        dependencies: [
          { package: 'b' },
          { package: 'b', origin: { repo: 'o/b' } },
        ],
      }),
    },
    { path: 'b' },
  ]);
  const bad = await resolveSet(io, coll, [{ dir: path.join(coll, 'a'), name: 'a' }]);
  assert.equal(bad.ok, false);
  // b is first demanded same-origin — resolves in-tree —, then the
  // external demand finds the name already owned by another origin.
  assert.ok(bad.errors.some((e) => /conflicto de identidad/.test(e)),
    bad.errors.join(', '));
});

test('two demands on the same external origin fetch it once', async () => {
  const buf = await repoTarball('dep', memberManifest('dep'));
  const spy = fetchFor({ dep: buf });
  const io = { fetch: spy.fetch, tmpBase: tmp() };
  const coll = path.join(tmp(), 'coleccion');
  writeCollection(coll, [
    { path: 'a', manifest: memberManifest('a', { dependencies: [{ package: 'dep', origin: { repo: 'o/dep' } }] }) },
    { path: 'c', manifest: memberManifest('c', { dependencies: [{ package: 'dep', origin: { repo: 'o/dep' } }] }) },
  ]);
  const resolved = await resolveSet(io, coll, [
    { dir: path.join(coll, 'a'), name: 'a' },
    { dir: path.join(coll, 'c'), name: 'c' },
  ]);
  assert.equal(resolved.ok, true, resolved.errors?.join(', '));
  // one commits-API call plus one tarball download — the two demands
  // share the cached tree
  assert.equal(spy.calls, 2, `expected one resolve + one download, got ${spy.calls} calls`);
  assert.equal(resolved.units.filter((u) => u.dir.endsWith('dep')).length, 1);
  assert.equal(resolved.cleanups.length, 1);
  resolved.cleanups.forEach((c) => c());
});

test('an unreachable external origin aborts the set with diagnosis', async () => {
  const spy = fetchFor({});
  const io = { fetch: spy.fetch, tmpBase: tmp() };
  const pkg = path.join(tmp(), 'a');
  writePkg(pkg, memberManifest('a', {
    dependencies: [{ package: 'dep', origin: { repo: 'o/fantasma' } }],
  }));
  const bad = await resolveSet(io, pkg, [{ dir: pkg }]);
  assert.equal(bad.ok, false);
  assert.ok(bad.errors.some((e) => /"dep".*no es alcanzable/.test(e)),
    bad.errors.join(', '));
});

test('a member missing from the external index is unresolvable', async () => {
  const work = tmp();
  const suiteDir = path.join(work, 'suite-abc123');
  writePkg(suiteDir, { collection: true, name: 'suite', packages: [{ path: 'otra' }] });
  writePkg(path.join(suiteDir, 'otra'), memberManifest('otra'));
  const archive = path.join(work, 'a.tgz');
  await tarCreate({ gzip: true, file: archive, cwd: work }, ['suite-abc123']);
  const spy = fetchFor({ suite: fs.readFileSync(archive) });
  const io = { fetch: spy.fetch, tmpBase: tmp() };
  const pkg = path.join(tmp(), 'a');
  writePkg(pkg, memberManifest('a', {
    dependencies: [{ package: 'pieza', origin: { repo: 'o/suite' } }],
  }));
  const bad = await resolveSet(io, pkg, [{ dir: pkg }]);
  assert.equal(bad.ok, false);
  assert.ok(bad.errors.some((e) => /"pieza".*no existe en "o\/suite"/.test(e)),
    bad.errors.join(', '));
});

test('an external piece whose manifest does not load is unreachable', async () => {
  const buf = await repoTarball('dep', { name: 'dep' });
  const spy = fetchFor({ dep: buf });
  const io = { fetch: spy.fetch, tmpBase: tmp() };
  const pkg = path.join(tmp(), 'a');
  writePkg(pkg, memberManifest('a', {
    dependencies: [{ package: 'dep', origin: { repo: 'o/dep' } }],
  }));
  const bad = await resolveSet(io, pkg, [{ dir: pkg }]);
  assert.equal(bad.ok, false);
  assert.ok(bad.errors.some((e) => /"dep" no es alcanzable: su manifiesto es inválido/.test(e)),
    bad.errors.join(', '));
});

test('restrictions on an external piece are united', async () => {
  const buf = await repoTarball('dep', memberManifest('dep', { version: '1.4.0' }));
  const spy = fetchFor({ dep: buf });
  const io = { fetch: spy.fetch, tmpBase: tmp() };
  const coll = path.join(tmp(), 'coleccion');
  writeCollection(coll, [
    { path: 'a', manifest: memberManifest('a', { dependencies: [{ package: 'dep', version: '^1.0.0', origin: { repo: 'o/dep' } }] }) },
    { path: 'c', manifest: memberManifest('c', { dependencies: [{ package: 'dep', version: '>=2.0.0', origin: { repo: 'o/dep' } }] }) },
  ]);
  const bad = await resolveSet(io, coll, [
    { dir: path.join(coll, 'a'), name: 'a' },
    { dir: path.join(coll, 'c'), name: 'c' },
  ]);
  assert.equal(bad.ok, false);
  assert.ok(bad.errors.some((e) => /"dep"@1\.4\.0 no satisface ">=2\.0\.0"/.test(e)),
    bad.errors.join(', '));
});

test('a selected unit already owned by an external origin conflicts', async () => {
  const buf = await repoTarball('b', memberManifest('b'));
  const spy = fetchFor({ b: buf });
  const io = { fetch: spy.fetch, tmpBase: tmp() };
  const coll = path.join(tmp(), 'coleccion');
  writeCollection(coll, [
    { path: 'a', manifest: memberManifest('a', { dependencies: [{ package: 'b', origin: { repo: 'o/b' } }] }) },
    { path: 'b' },
  ]);
  // 'a' resolves 'b' from o/b; the selected 'b' —a member of this
  // tree— then finds the name already owned by another origin.
  const bad = await resolveSet(io, coll, [
    { dir: path.join(coll, 'a'), name: 'a' },
    { dir: path.join(coll, 'b'), name: 'b' },
  ]);
  assert.equal(bad.ok, false);
  assert.ok(bad.errors.some((e) => /conflicto de identidad.*"b"/.test(e)),
    bad.errors.join(', '));
});

test('a path origin that is not a directory is unreachable', async () => {
  const pkg = path.join(tmp(), 'a');
  writePkg(pkg, memberManifest('a', {
    dependencies: [{ package: 'dep', origin: { path: '../inexistente' } }],
  }));
  const bad = await resolveSet({}, pkg, [{ dir: pkg }]);
  assert.equal(bad.ok, false);
  assert.ok(bad.errors.some((e) => /"dep".*no es alcanzable.*no es un directorio/.test(e)),
    bad.errors.join(', '));
});

test('a duplicated name in the external index is ambiguous', async () => {
  const work = tmp();
  const suiteDir = path.join(work, 'suite-abc123');
  writePkg(suiteDir, {
    collection: true, name: 'suite',
    packages: [{ path: 'x/pieza' }, { path: 'y/pieza' }],
  });
  writePkg(path.join(suiteDir, 'x/pieza'), memberManifest('pieza'));
  writePkg(path.join(suiteDir, 'y/pieza'), memberManifest('pieza'));
  const archive = path.join(work, 'a.tgz');
  await tarCreate({ gzip: true, file: archive, cwd: work }, ['suite-abc123']);
  const spy = fetchFor({ suite: fs.readFileSync(archive) });
  const io = { fetch: spy.fetch, tmpBase: tmp() };
  const pkg = path.join(tmp(), 'a');
  writePkg(pkg, memberManifest('a', {
    dependencies: [{ package: 'pieza', origin: { repo: 'o/suite' } }],
  }));
  const bad = await resolveSet(io, pkg, [{ dir: pkg }]);
  assert.equal(bad.ok, false);
  assert.ok(bad.errors.some((e) => /"pieza" aparece varias veces/.test(e)),
    bad.errors.join(', '));
});

test('a same-origin demand on an externally-owned name conflicts', async () => {
  const buf = await repoTarball('b', memberManifest('b'));
  const spy = fetchFor({ b: buf });
  const io = { fetch: spy.fetch, tmpBase: tmp() };
  const coll = path.join(tmp(), 'coleccion');
  writeCollection(coll, [
    { path: 'a', manifest: memberManifest('a', { dependencies: [{ package: 'b', origin: { repo: 'o/b' } }] }) },
    { path: 'b' },
    { path: 'c', manifest: memberManifest('c', { dependencies: [{ package: 'b' }] }) },
  ]);
  // 'a' resolves 'b' from o/b; 'c' then demands 'b' of this tree —
  // the name is already owned by another origin.
  const bad = await resolveSet(io, coll, [
    { dir: path.join(coll, 'a'), name: 'a' },
    { dir: path.join(coll, 'c'), name: 'c' },
  ]);
  assert.equal(bad.ok, false);
  assert.ok(bad.errors.some((e) => /conflicto de identidad.*"b"/.test(e)),
    bad.errors.join(', '));
});

test('the same path string from different dirs means different origins', async () => {
  const coll = path.join(tmp(), 'coleccion');
  writeCollection(coll, [
    {
      path: 'a1',
      manifest: memberManifest('a1', { dependencies: [{ package: 'lib', origin: { path: 'lib' } }] }),
    },
    {
      path: 'a2',
      manifest: memberManifest('a2', { dependencies: [{ package: 'lib', origin: { path: 'lib' } }] }),
    },
    { path: 'a1/lib' },
    { path: 'a2/lib' },
  ]);
  // 'lib' resolves to a1/lib for 'a1' and to a2/lib for 'a2' —
  // different directories are different origins, so the shared name
  // is a conflict, not a dedup.
  const bad = await resolveSet({}, coll, [
    { dir: path.join(coll, 'a1'), name: 'a1' },
    { dir: path.join(coll, 'a2'), name: 'a2' },
  ]);
  assert.equal(bad.ok, false);
  assert.ok(bad.errors.some((e) => /conflicto de identidad.*"lib"/.test(e)),
    bad.errors.join(', '));
});

test('a path dependency declared inside a remote tree is rejected', async () => {
  const buf = await repoTarball('dep', memberManifest('dep', {
    dependencies: [{ package: 'tool', origin: { path: '../tool' } }],
  }));
  const spy = fetchFor({ dep: buf });
  const io = { fetch: spy.fetch, tmpBase: tmp() };
  const pkg = path.join(tmp(), 'a');
  writePkg(pkg, memberManifest('a', {
    dependencies: [{ package: 'dep', origin: { repo: 'o/dep' } }],
  }));
  const bad = await resolveSet(io, pkg, [{ dir: pkg }]);
  assert.equal(bad.ok, false);
  assert.ok(bad.errors.some((e) => /"tool".*"path" dentro de un árbol remoto/.test(e)),
    bad.errors.join(', '));
});

test('a remote root declaring a path dependency is rejected too', async () => {
  const pkg = path.join(tmp(), 'a');
  writePkg(pkg, memberManifest('a', {
    dependencies: [{ package: 'dep', origin: { path: '../dep' } }],
  }));
  const bad = await resolveSet(
    {}, pkg, [{ dir: pkg }], { type: 'github', repo: 'o/a' },
  );
  assert.equal(bad.ok, false);
  assert.ok(bad.errors.some((e) => /"dep".*"path" dentro de un árbol remoto/.test(e)),
    bad.errors.join(', '));
});
