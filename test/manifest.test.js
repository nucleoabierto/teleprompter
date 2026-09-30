import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { loadManifest } from '../src/manifest.js';
import { isSafeRelative } from '../src/paths.js';

function tmp() {
  return fs.mkdtempSync(path.join(os.tmpdir(), 'teleprompter-'));
}

// The manifest name must equal the package directory name.
function pkgWith(name, manifest, files = { 'a.txt': 'a' }) {
  const dir = path.join(tmp(), name);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, 'teleprompter.json'),
    typeof manifest === 'string' ? manifest : JSON.stringify(manifest));
  for (const [file, content] of Object.entries(files)) {
    const p = path.join(dir, file);
    fs.mkdirSync(path.dirname(p), { recursive: true });
    fs.writeFileSync(p, content);
  }
  return dir;
}

function base(name, extra = {}) {
  return { name, version: '1.2.3', install: [{ source: 'a.txt', target: 'b.txt' }], ...extra };
}

function errorsOf(name, manifest, files) {
  return loadManifest(pkgWith(name, manifest, files)).errors;
}

test('loadManifest fails when teleprompter.json is missing', () => {
  const dir = path.join(tmp(), 'vacio');
  fs.mkdirSync(dir);
  const { errors } = loadManifest(dir);
  assert.match(errors[0], /no existe/);
});

test('loadManifest fails on malformed JSON', () => {
  const { errors } = loadManifest(pkgWith('roto', '{'));
  assert.match(errors[0], /JSON inválido/);
});

test('loadManifest fails when the manifest is not a JSON object', () => {
  const { errors } = loadManifest(pkgWith('lista', '[]'));
  assert.match(errors[0], /debe ser un objeto/);
  const nulo = loadManifest(pkgWith('nulo', 'null'));
  assert.match(nulo.errors[0], /debe ser un objeto/);
});

test('loadManifest rejects a semver version with leading zeros', () => {
  assert.ok(errorsOf('vz', base('vz', { version: '01.2.3' })).some((e) => /version/.test(e)));
});

test('loadManifest rejects collection manifests as not installable', () => {
  const errors = errorsOf('col', { collection: true, name: 'col', packages: [] });
  assert.ok(errors.some((e) => /colección/.test(e)));
  assert.ok(errorsOf('col2', base('col2', { collection: 1 })).some((e) => /collection: debe ser booleano/.test(e)));
});

test('loadManifest rejects an unknown format value and accepts the known one', () => {
  assert.ok(errorsOf('f1', base('f1', { format: 'otro@2' })).some((e) => /format/.test(e)));
  assert.deepEqual(errorsOf('f2', base('f2', { format: 'teleprompter-package@1' })), []);
});

test('loadManifest warns on unknown top-level fields without failing', () => {
  const { errors, warnings } = loadManifest(pkgWith('aviso', base('aviso', { extra: 1 })));
  assert.deepEqual(errors, []);
  assert.match(warnings[0], /extra/);
});

test('loadManifest requires name to be kebab-case, at most 64 chars, and match the directory', () => {
  assert.ok(errorsOf('n1', { version: '1.0.0', install: [{ source: 'a.txt', target: 'b' }] })
    .some((e) => /name: obligatorio/.test(e)));
  assert.ok(errorsOf('Mayus', base('Mayus', { name: 'Mayus' })).some((e) => /kebab-case/.test(e)));
  const largo = 'a'.repeat(65);
  assert.ok(errorsOf(largo, base(largo, { name: largo })).some((e) => /kebab-case/.test(e)));
  assert.ok(errorsOf('dir', base('dir', { name: 'otro' })).some((e) => /no coincide/.test(e)));
});

test('loadManifest requires an explicit x.y.z semver version', () => {
  assert.ok(errorsOf('v1', { name: 'v1', install: [{ source: 'a.txt', target: 'b' }] })
    .some((e) => /version/.test(e)));
  assert.ok(errorsOf('v2', base('v2', { version: '1.0' })).some((e) => /version/.test(e)));
});

test('loadManifest requires a non-empty install list of well-formed entries', () => {
  assert.ok(errorsOf('i1', { name: 'i1', version: '1.0.0' }).some((e) => /install/.test(e)));
  assert.ok(errorsOf('i2', base('i2', { install: [] })).some((e) => /install/.test(e)));
  assert.ok(errorsOf('i3', base('i3', { install: ['x'] })).some((e) => /debe ser un objeto/.test(e)));
  assert.ok(errorsOf('i4', base('i4', { install: [{ source: 'a.txt', target: 'b', sobra: 1 }] }))
    .some((e) => /campo desconocido "sobra"/.test(e)));
  assert.ok(errorsOf('i5', base('i5', { install: [{ source: '', target: 'b' }] }))
    .some((e) => /source: debe ser una cadena/.test(e)));
  assert.ok(errorsOf('i6', base('i6', { install: [{ source: 'a.txt', target: 7 }] }))
    .some((e) => /target: debe ser una cadena/.test(e)));
});

test('loadManifest rejects absolute paths, ".." segments, and missing sources', () => {
  assert.ok(errorsOf('r1', base('r1', { install: [{ source: '/etc/x', target: 'b' }] }))
    .some((e) => /no permitida/.test(e)));
  assert.ok(errorsOf('r2', base('r2', { install: [{ source: 'a.txt', target: '../fuera' }] }))
    .some((e) => /no permitida/.test(e)));
  assert.ok(errorsOf('r3', base('r3', { install: [{ source: 'no-esta.txt', target: 'b' }] }))
    .some((e) => /no existe "no-esta\.txt"/.test(e)));
});

test('loadManifest validates requires.paths entries', () => {
  assert.ok(errorsOf('q1', base('q1', { requires: 3 })).some((e) => /requires: debe ser un objeto/.test(e)));
  assert.ok(errorsOf('q2', base('q2', { requires: { otra: [] } })).some((e) => /campo desconocido/.test(e)));
  assert.ok(errorsOf('q3', base('q3', { requires: { paths: 'x' } })).some((e) => /paths: debe ser una lista/.test(e)));
  assert.ok(errorsOf('q4', base('q4', { requires: { paths: ['x'] } }))
    .some((e) => /paths\[0\]: debe ser un objeto/.test(e)));
  assert.ok(errorsOf('q5', base('q5', { requires: { paths: [{ path: 'p', otra: 1 }] } }))
    .some((e) => /campo desconocido/.test(e)));
  assert.ok(errorsOf('q6', base('q6', { requires: { paths: [{ path: '' }] } }))
    .some((e) => /path: debe ser una cadena/.test(e)));
  assert.ok(errorsOf('q7', base('q7', { requires: { paths: [{ path: '../x' }] } }))
    .some((e) => /no permitida/.test(e)));
  assert.ok(errorsOf('q8', base('q8', { requires: { paths: [{ path: 'p', create: 'sí' }] } }))
    .some((e) => /create: debe ser booleano/.test(e)));
  assert.deepEqual(errorsOf('q9', base('q9', { requires: {} })), []);
});

test('loadManifest validates optional fields: author, description, license, personalization, metadata', () => {
  assert.ok(errorsOf('a1', base('a1', { author: 'x' })).some((e) => /author: debe ser un objeto/.test(e)));
  assert.ok(errorsOf('a2', base('a2', { author: {} })).some((e) => /author\.name/.test(e)));
  assert.ok(errorsOf('a3', base('a3', { author: { name: 'x', raro: 1 } })).some((e) => /campo desconocido/.test(e)));
  assert.deepEqual(errorsOf('a4', base('a4', { author: { name: 'x' } })), []);
  assert.ok(errorsOf('d1', base('d1', { description: 1 })).some((e) => /description/.test(e)));
  assert.ok(errorsOf('l1', base('l1', { license: 1 })).some((e) => /license/.test(e)));
  assert.ok(errorsOf('p1', base('p1', { personalization: 1 })).some((e) => /personalization/.test(e)));
  assert.ok(errorsOf('p2', base('p2', { personalization: '/abs' })).some((e) => /no permitida/.test(e)));
  assert.deepEqual(errorsOf('p3', base('p3', { personalization: 'docs/guia.md' }), { 'a.txt': 'a', 'docs/guia.md': 'sigue esto' }), []);
  assert.ok(errorsOf('m1', base('m1', { metadata: 'x' })).some((e) => /metadata/.test(e)));
});

test('loadManifest requires personalization to point to an existing file in the package', () => {
  assert.ok(errorsOf('g1', base('g1', { personalization: 'guia.md' }))
    .some((e) => /no existe "guia\.md"/.test(e)));
  assert.ok(errorsOf('g2', base('g2', { personalization: 'guia.md' }), { 'a.txt': 'a', 'guia.md/x.txt': 'x' })
    .some((e) => /no es un archivo/.test(e)));
  const dir = pkgWith('g3', base('g3', { personalization: 'guia.md' }));
  fs.symlinkSync('no-existe', path.join(dir, 'guia.md'));
  assert.ok(loadManifest(dir).errors.some((e) => /no es un archivo/.test(e)));
});

test('loadManifest rejects a personalization symlink resolving outside the package', () => {
  const outside = tmp();
  const real = path.join(outside, 'secreto.md');
  fs.writeFileSync(real, 'contenido ajeno');
  const dir = pkgWith('g4', base('g4', { personalization: 'guia.md' }));
  fs.symlinkSync(real, path.join(dir, 'guia.md'));
  assert.ok(loadManifest(dir).errors.some((e) => /apunta fuera del paquete/.test(e)));
});

test('loadManifest reserves the .teleprompter/ managed namespace', () => {
  assert.ok(errorsOf('t1', base('t1', { install: [{ source: 'a.txt', target: '.teleprompter/guia.md' }] }))
    .some((e) => /prefijo reservado/.test(e)));
  assert.ok(errorsOf('t2', base('t2', { install: [{ source: 'a.txt', target: '.teleprompter' }] }))
    .some((e) => /prefijo reservado/.test(e)));
  assert.ok(errorsOf('t3', base('t3', { requires: { paths: [{ path: '.teleprompter/x', create: true }] } }))
    .some((e) => /prefijo reservado/.test(e)));
});

test('isSafeRelative rejects absolute, dot-dot, and Windows-style paths', () => {
  assert.equal(isSafeRelative('a/b/'), true);
  assert.equal(isSafeRelative('/abs'), false);
  assert.equal(isSafeRelative('../x'), false);
  assert.equal(isSafeRelative('a/../b'), false);
  assert.equal(isSafeRelative('a\\..\\b'), false);
  assert.equal(isSafeRelative('C:\\x'), false);
  assert.equal(isSafeRelative('\\\\servidor\\x'), false);
});
