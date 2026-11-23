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

test('a member without dependencies resolves to itself', () => {
  const coll = path.join(tmp(), 'coleccion');
  writeCollection(coll, [{ path: 'alfa' }]);
  const resolved = resolveSet(coll, [{ dir: path.join(coll, 'alfa'), name: 'alfa' }]);
  assert.equal(resolved.ok, true);
  assert.deepEqual(names(resolved), ['alfa']);
});

test('a declared dependency resolves before its dependent', () => {
  const coll = path.join(tmp(), 'coleccion');
  writeCollection(coll, [
    { path: 'app', manifest: memberManifest('app', { dependencies: [{ package: 'lib' }] }) },
    { path: 'lib' },
  ]);
  const resolved = resolveSet(coll, [{ dir: path.join(coll, 'app'), name: 'app' }]);
  assert.equal(resolved.ok, true);
  assert.deepEqual(names(resolved), ['lib', 'app']);
});

test('a transitive chain resolves in dependency order', () => {
  const coll = path.join(tmp(), 'coleccion');
  writeCollection(coll, [
    { path: 'a', manifest: memberManifest('a', { dependencies: [{ package: 'b' }] }) },
    { path: 'b', manifest: memberManifest('b', { dependencies: [{ package: 'c' }] }) },
    { path: 'c' },
  ]);
  const resolved = resolveSet(coll, [{ dir: path.join(coll, 'a'), name: 'a' }]);
  assert.equal(resolved.ok, true);
  assert.deepEqual(names(resolved), ['c', 'b', 'a']);
});

test('a piece reached through two paths resolves once', () => {
  const coll = path.join(tmp(), 'coleccion');
  writeCollection(coll, [
    { path: 'a', manifest: memberManifest('a', { dependencies: [{ package: 'c' }] }) },
    { path: 'b', manifest: memberManifest('b', { dependencies: [{ package: 'c' }] }) },
    { path: 'c' },
  ]);
  const resolved = resolveSet(coll, [
    { dir: path.join(coll, 'a'), name: 'a' },
    { dir: path.join(coll, 'b'), name: 'b' },
  ]);
  assert.equal(resolved.ok, true);
  assert.deepEqual(names(resolved), ['c', 'a', 'b']);
});

test('a repeated dependency entry is one piece, its ranges united', () => {
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
  const resolved = resolveSet(coll, [{ dir: path.join(coll, 'a'), name: 'a' }]);
  assert.equal(resolved.ok, true);
  assert.deepEqual(names(resolved), ['b', 'a']);
});

test('a satisfied restriction resolves; an unsatisfied one aborts', () => {
  const coll = path.join(tmp(), 'coleccion');
  const member = (version) => memberManifest('b', { version });
  writeCollection(coll, [
    { path: 'a', manifest: memberManifest('a', { dependencies: [{ package: 'b', version: '^1.0.0' }] }) },
    { path: 'b', manifest: member('1.4.0') },
  ]);
  const units = [{ dir: path.join(coll, 'a'), name: 'a' }];
  assert.equal(resolveSet(coll, units).ok, true);

  const coll2 = path.join(tmp(), 'coleccion');
  writeCollection(coll2, [
    { path: 'a', manifest: memberManifest('a', { dependencies: [{ package: 'b', version: '^2.0.0' }] }) },
    { path: 'b', manifest: member('1.4.0') },
  ]);
  const bad = resolveSet(coll2, [{ dir: path.join(coll2, 'a'), name: 'a' }]);
  assert.equal(bad.ok, false);
  assert.ok(bad.errors.some((e) => /"b"@1\.4\.0 no satisface "\^2\.0\.0" exigida por "a"/.test(e)));
});

test('restrictions impossible together abort the set', () => {
  const coll = path.join(tmp(), 'coleccion');
  writeCollection(coll, [
    { path: 'a', manifest: memberManifest('a', { dependencies: [{ package: 'c', version: '>=2.0.0' }] }) },
    { path: 'b', manifest: memberManifest('b', { dependencies: [{ package: 'c', version: '<2.0.0' }] }) },
    { path: 'c', manifest: memberManifest('c', { version: '1.5.0' }) },
  ]);
  const bad = resolveSet(coll, [
    { dir: path.join(coll, 'a'), name: 'a' },
    { dir: path.join(coll, 'b'), name: 'b' },
  ]);
  assert.equal(bad.ok, false);
  assert.ok(bad.errors.some((e) => /no satisface ">=2\.0\.0" exigida por "a"/.test(e)));
});

test('a cycle aborts with its legible path; self-inclusion is a cycle of one', () => {
  const coll = path.join(tmp(), 'coleccion');
  writeCollection(coll, [
    { path: 'a', manifest: memberManifest('a', { dependencies: [{ package: 'b' }] }) },
    { path: 'b', manifest: memberManifest('b', { dependencies: [{ package: 'a' }] }) },
  ]);
  const bad = resolveSet(coll, [{ dir: path.join(coll, 'a'), name: 'a' }]);
  assert.equal(bad.ok, false);
  assert.ok(bad.errors.some((e) => /dependencia circular: a → b → a/.test(e)));

  const coll2 = path.join(tmp(), 'coleccion');
  writeCollection(coll2, [
    { path: 'a', manifest: memberManifest('a', { dependencies: [{ package: 'a' }] }) },
  ]);
  const self = resolveSet(coll2, [{ dir: path.join(coll2, 'a'), name: 'a' }]);
  assert.equal(self.ok, false);
  assert.ok(self.errors.some((e) => /dependencia circular: a → a/.test(e)));
});

test('a dependency on a missing member aborts with diagnosis', () => {
  const coll = path.join(tmp(), 'coleccion');
  writeCollection(coll, [
    { path: 'a', manifest: memberManifest('a', { dependencies: [{ package: 'fantasma' }] }) },
  ]);
  const bad = resolveSet(coll, [{ dir: path.join(coll, 'a'), name: 'a' }]);
  assert.equal(bad.ok, false);
  assert.ok(bad.errors.some((e) => /"fantasma".*no existe en el origen/.test(e)));
});

test('a member whose manifest does not load is an unreachable piece', () => {
  const coll = path.join(tmp(), 'coleccion');
  writeCollection(coll, [
    { path: 'a', manifest: memberManifest('a', { dependencies: [{ package: 'b' }] }) },
    { path: 'b', manifest: { name: 'b' } },
  ]);
  const bad = resolveSet(coll, [{ dir: path.join(coll, 'a'), name: 'a' }]);
  assert.equal(bad.ok, false);
  assert.ok(bad.errors.some((e) => /"b" no es alcanzable: su manifiesto es inválido/.test(e)));
});

test('a duplicated index name makes the dependency ambiguous', () => {
  const coll = path.join(tmp(), 'coleccion');
  writeCollection(coll, [
    { path: 'a', manifest: memberManifest('a', { dependencies: [{ package: 'b' }] }) },
    { path: 'x/b' },
    { path: 'y/b' },
  ]);
  const bad = resolveSet(coll, [{ dir: path.join(coll, 'a'), name: 'a' }]);
  assert.equal(bad.ok, false);
  assert.ok(bad.errors.some((e) => /"b" aparece varias veces/.test(e)));
});

test('a broken collection index leaves every dependency unresolvable', () => {
  const coll = path.join(tmp(), 'coleccion');
  writeCollection(coll, [
    { path: 'a', manifest: memberManifest('a', { dependencies: [{ package: 'b' }] }) },
  ], { packages: 'roto' });
  const bad = resolveSet(coll, [{ dir: path.join(coll, 'a'), name: 'a' }]);
  assert.equal(bad.ok, false);
  assert.ok(bad.errors.some((e) => /"b".*no existe en el origen/.test(e)));
});

test('a standalone package declares other pieces unreachable and itself a cycle', () => {
  const pkg = path.join(tmp(), 'a');
  writePkg(pkg, memberManifest('a', { dependencies: [{ package: 'b' }] }));
  const bad = resolveSet(pkg, [{ dir: pkg }]);
  assert.equal(bad.ok, false);
  assert.ok(bad.errors.some((e) => /"b".*no existe en el origen/.test(e)));

  const selfPkg = path.join(tmp(), 'a');
  writePkg(selfPkg, memberManifest('a', { dependencies: [{ package: 'a' }] }));
  const self = resolveSet(selfPkg, [{ dir: selfPkg }]);
  assert.equal(self.ok, false);
  assert.ok(self.errors.some((e) => /dependencia circular: a → a/.test(e)));
});

test('a selected unit whose manifest does not load is unreachable', () => {
  const coll = path.join(tmp(), 'coleccion');
  writeCollection(coll, [{ path: 'a', manifest: { name: 'a' } }]);
  const bad = resolveSet(coll, [{ dir: path.join(coll, 'a'), name: 'a' }]);
  assert.equal(bad.ok, false);
  assert.ok(bad.errors.some((e) => /"a" no es alcanzable: su manifiesto es inválido/.test(e)));

  const pkg = path.join(tmp(), 'rota');
  writePkg(pkg, '{');
  const worse = resolveSet(pkg, [{ dir: pkg }]);
  assert.equal(worse.ok, false);
  assert.ok(worse.errors.some((e) => /pieza seleccionada no es alcanzable/.test(e)));
});

test('a selected unit carries no name when it is not an index member', () => {
  const pkg = path.join(tmp(), 'a');
  writePkg(pkg, memberManifest('a'));
  const resolved = resolveSet(pkg, [{ dir: pkg }]);
  assert.equal(resolved.ok, true);
  assert.deepEqual(resolved.units, [{ dir: pkg }]);
});
