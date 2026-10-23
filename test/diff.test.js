import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { diffLines, diffResource } from '../src/diff.js';

function tmp() {
  return fs.mkdtempSync(path.join(os.tmpdir(), 'teleprompter-diff-'));
}

function writeTree(dir, files) {
  for (const [file, content] of Object.entries(files)) {
    const p = path.join(dir, file);
    if (typeof content === 'object') {
      fs.mkdirSync(p, { recursive: true });
      writeTree(p, content);
    } else {
      fs.mkdirSync(path.dirname(p), { recursive: true });
      fs.writeFileSync(p, content);
    }
  }
}

const hunks = (lines) => lines.filter((l) => l.startsWith('@@'));

test('diffLines returns nothing for equal inputs', () => {
  assert.deepEqual(diffLines([], []), []);
  assert.deepEqual(diffLines(['a', 'b'], ['a', 'b']), []);
});

test('diffLines merges changes inside the context window and splits beyond it', () => {
  // Changes with 6 common lines between them merge; with 7 they split.
  const a = ['a0', 'c1', 'c2', 'c3', 'c4', 'c5', 'c6', 'a7',
    'd1', 'd2', 'd3', 'd4', 'd5', 'd6', 'd7', 'a15', 'e1', 'e2'];
  const b = ['b0', 'c1', 'c2', 'c3', 'c4', 'c5', 'c6', 'b7',
    'd1', 'd2', 'd3', 'd4', 'd5', 'd6', 'd7', 'b15', 'e1', 'e2'];
  const out = diffLines(a, b);
  assert.equal(hunks(out).length, 2);
  const joined = out.join('\n');
  assert.match(joined, /-a0\n\+b0/);
  assert.match(joined, /-a7\n\+b7/);
  assert.match(joined, /-a15\n\+b15/);
  // The merged hunk carries both close changes; the split one stands alone.
  const first = out.indexOf(hunks(out)[0]);
  const second = out.indexOf(hunks(out)[1]);
  assert.ok(out.indexOf('+b0') > first && out.indexOf('+b0') < second);
  assert.ok(out.indexOf('+b7') > first && out.indexOf('+b7') < second);
  assert.ok(out.indexOf('+b15') > second);
});

test('diffResource returns nothing when both trees match', () => {
  const dest = tmp();
  const pkg = tmp();
  writeTree(dest, { 'd': { 'f.txt': 'x\n' } });
  writeTree(pkg, { 'd': { 'f.txt': 'x\n' } });
  assert.deepEqual(diffResource(dest, pkg, { target: 'd', source: 'd' }), []);
});

test('a resource absent from the destination shows every incoming leaf as added', () => {
  const dest = tmp();
  const pkg = tmp();
  writeTree(pkg, { 'n': { 'f.txt': 'x\n' } });
  const out = diffResource(dest, pkg, { target: 'n', source: 'n' });
  assert.match(out.join('\n'),
    /--- n\/f\.txt \(ausente\)\n\+\+\+ n\/f\.txt \(paquete\)\n@@ -0,0 \+1 @@\n\+x/);
});

test('a target recorded with a trailing separator joins its leaves cleanly', () => {
  const dest = tmp();
  const pkg = tmp();
  writeTree(dest, { 'd': { 'f.txt': 'viejo\n' } });
  writeTree(pkg, { 'd': { 'f.txt': 'nuevo\n' } });
  const out = diffResource(dest, pkg, { target: 'd/', source: 'd' });
  assert.match(out.join('\n'), /--- d\/f\.txt \(destino\)/);
});

test('an empty directory is a leaf that shows as added or removed', () => {
  const dest = tmp();
  const pkg = tmp();
  fs.mkdirSync(path.join(dest, 'd'));
  writeTree(pkg, { 'd': { 'vacia': {} } });
  const out = diffResource(dest, pkg, { target: 'd', source: 'd' });
  assert.match(out.join('\n'),
    /--- d\/vacia \(ausente\)\n\+\+\+ d\/vacia \(paquete\)\n@@ -0,0 \+1 @@\n\+\(directorio vacío\)/);
});

test('a file missing its final newline still diffs against one that has it', () => {
  const dest = tmp();
  const pkg = tmp();
  fs.writeFileSync(path.join(dest, 'a.txt'), 'texto');
  fs.writeFileSync(path.join(pkg, 'a.txt'), 'texto\n');
  const out = diffResource(dest, pkg, { target: 'a.txt', source: 'a.txt' });
  assert.match(out.join('\n'), /\\ \(la nueva línea final difiere\)/);
});

test('an empty file diffs against content as a pure addition', () => {
  const dest = tmp();
  const pkg = tmp();
  fs.writeFileSync(path.join(dest, 'a.txt'), '');
  fs.writeFileSync(path.join(pkg, 'a.txt'), 'x\n');
  const out = diffResource(dest, pkg, { target: 'a.txt', source: 'a.txt' });
  assert.match(out.join('\n'), /@@ -0,0 \+1 @@\n\+x/);
});

test('an unreadable leaf degrades to the unreadable marker instead of aborting', () => {
  const dest = tmp();
  const pkg = tmp();
  writeTree(dest, { 'd': { 'f.txt': 'viejo\n' } });
  writeTree(pkg, { 'd': { 'f.txt': 'nuevo\n' } });
  fs.chmodSync(path.join(dest, 'd', 'f.txt'), 0o000);
  const out = diffResource(dest, pkg, { target: 'd', source: 'd' });
  fs.chmodSync(path.join(dest, 'd', 'f.txt'), 0o644);
  assert.match(out.join('\n'), /-\(no legible\)\n\+nuevo/);
});

test('an input too large for the LCS table degrades to a marker', () => {
  const a = Array.from({ length: 2001 }, (_, i) => `a${i}`);
  const b = Array.from({ length: 2000 }, (_, i) => `b${i}`);
  assert.deepEqual(diffLines(a, b),
    ['\\ (contenido demasiado extenso para el diff)']);
});

test('a target escaping the destination never discloses its content', () => {
  const dest = tmp();
  const outside = tmp();
  fs.writeFileSync(path.join(outside, 'secreto.txt'), 'SECRETO\n');
  const pkg = tmp();
  const target = path.relative(dest, path.join(outside, 'secreto.txt'));
  const out = diffResource(dest, pkg, { target, removal: true });
  const shown = out.join('\n');
  assert.match(shown, /\(ruta insegura\)/);
  assert.doesNotMatch(shown, /SECRETO/);
});

test('a linked directory in the chain never discloses outside content', () => {
  const dest = tmp();
  const outside = tmp();
  fs.writeFileSync(path.join(outside, 'secreto.txt'), 'SECRETO\n');
  fs.symlinkSync(outside, path.join(dest, 'd'));
  const pkg = tmp();
  writeTree(pkg, { 'd': { 'secreto.txt': 'x\n' } });
  const out = diffResource(dest, pkg,
    { target: 'd/secreto.txt', source: 'd/secreto.txt' });
  const shown = out.join('\n');
  assert.doesNotMatch(shown, /SECRETO/);
  assert.match(shown, /\(ruta insegura\)/);
});

test('a symlinked source in the package never discloses outside content', () => {
  const dest = tmp();
  writeTree(dest, { 'd': { 'f.txt': 'local\n' } });
  const outside = tmp();
  fs.writeFileSync(path.join(outside, 'f.txt'), 'SECRETO\n');
  const pkg = tmp();
  fs.symlinkSync(outside, path.join(pkg, 'd'));
  const out = diffResource(dest, pkg, { target: 'd/f.txt', source: 'd/f.txt' });
  const shown = out.join('\n');
  assert.doesNotMatch(shown, /SECRETO/);
  assert.match(shown, /\(ruta insegura\)/);
});

test('a trailing-separator target that is a link shows the link, never its content', () => {
  const dest = tmp();
  const outside = tmp();
  fs.writeFileSync(path.join(outside, 'secreto.txt'), 'SECRETO\n');
  fs.symlinkSync(outside, path.join(dest, 'd'));
  const out = diffResource(dest, tmp(), { target: 'd/', removal: true });
  const shown = out.join('\n');
  assert.doesNotMatch(shown, /SECRETO/);
  assert.match(shown, /--- d \(destino\)\n\+\+\+ d \(ausente\)\n@@ -1 \+0,0 @@\n--> /);
});

test('a trailing-separator target that is a file still shows its content', () => {
  const dest = tmp();
  fs.writeFileSync(path.join(dest, 'd'), 'contenido\n');
  const out = diffResource(dest, tmp(), { target: 'd/', removal: true });
  assert.match(out.join('\n'),
    /--- d \(destino\)\n\+\+\+ d \(ausente\)\n@@ -1 \+0,0 @@\n-contenido/);
});

test('a file diff also notes a differing final newline after the hunks', () => {
  const dest = tmp();
  const pkg = tmp();
  fs.writeFileSync(path.join(dest, 'a.txt'), 'viejo\nfin');
  fs.writeFileSync(path.join(pkg, 'a.txt'), 'nuevo\nfin\n');
  const out = diffResource(dest, pkg, { target: 'a.txt', source: 'a.txt' });
  assert.match(out.join('\n'),
    /-viejo\n\+nuevo\n fin\n\\ \(la nueva línea final difiere\)/);
});

test('a link and a file with link-looking content still diff by kind', () => {
  const dest = tmp();
  const pkg = tmp();
  fs.symlinkSync('x', path.join(dest, 'e'));
  fs.writeFileSync(path.join(pkg, 'e'), '-> x\n');
  const out = diffResource(dest, pkg, { target: 'e', source: 'e' });
  assert.match(out.join('\n'),
    /--- e \(destino\)\n\+\+\+ e \(paquete\)\n\\ \(el tipo difiere: enlace → archivo\)/);
});

test('a one-sided empty file still announces itself', () => {
  const dest = tmp();
  const pkg = tmp();
  fs.mkdirSync(path.join(dest, 'd'));
  writeTree(pkg, { 'd': { 'vacio.txt': '' } });
  const out = diffResource(dest, pkg, { target: 'd', source: 'd' });
  assert.match(out.join('\n'),
    /--- d\/vacio\.txt \(ausente\)\n\+\+\+ d\/vacio\.txt \(paquete\)\n\\ \(archivo vacío\)/);
});

test('binary content diffs as a fingerprinted marker, not mojibake', () => {
  const dest = tmp();
  const pkg = tmp();
  fs.writeFileSync(path.join(dest, 'b.bin'), Buffer.from([0, 1, 2, 3]));
  fs.writeFileSync(path.join(pkg, 'b.bin'), Buffer.from([0, 1, 2, 4]));
  const out = diffResource(dest, pkg, { target: 'b.bin', source: 'b.bin' });
  const shown = out.join('\n');
  const pair = shown.match(/\(binario, sha256 ([0-9a-f]+)\)/g);
  assert.equal(pair.length, 2);
  assert.notEqual(pair[0], pair[1]);
});

test('a newline inside a name cannot forge diff lines', () => {
  const dest = tmp();
  const pkg = tmp();
  writeTree(dest, { 'd': { 'keep.txt': 'k\n' } });
  writeTree(pkg, { 'd': { 'keep.txt': 'k\n', 'e\nvil.txt': 'x\n' } });
  const out = diffResource(dest, pkg, { target: 'd', source: 'd' });
  const shown = out.join('\n');
  assert.match(shown, /--- d\/e\\nvil\.txt \(ausente\)/);
  assert.equal(shown.split('\n').filter((l) => l.startsWith('---')).length, 1);
});

test('control characters in content are escaped in the diff', () => {
  const dest = tmp();
  const pkg = tmp();
  fs.writeFileSync(path.join(dest, 'a.txt'), 'x\ry\x1bz\n');
  fs.writeFileSync(path.join(pkg, 'a.txt'), 'x\ny\nz\n');
  const out = diffResource(dest, pkg, { target: 'a.txt', source: 'a.txt' });
  const shown = out.join('\n');
  assert.match(shown, /-x\\ry\\x1bz/);
  // The escape is data, not a line break: one '-' line, not three.
  assert.equal(shown.split('\n').filter((l) => l.startsWith('-')).length, 2);
});

test('bidi and 8-bit control characters are escaped too', () => {
  const dest = tmp();
  const pkg = tmp();
  fs.writeFileSync(path.join(dest, 'a.txt'), 'x\u202ey\u0085z\n');
  fs.writeFileSync(path.join(pkg, 'a.txt'), 'x\ny\nz\n');
  const out = diffResource(dest, pkg, { target: 'a.txt', source: 'a.txt' });
  // U+202E shows as \u202e, U+0085 as \x85.
  assert.match(out.join('\n'), /-x\\u202ey\\x85z/);
});

test('a real newline in a link target still diffs from the literal escape', () => {
  const dest = tmp();
  const pkg = tmp();
  fs.symlinkSync('a\nb', path.join(dest, 'e'));
  fs.symlinkSync('a\\nb', path.join(pkg, 'e'));
  const out = diffResource(dest, pkg, { target: 'e', source: 'e' });
  assert.match(out.join('\n'), /--- e \(destino\)\n\+\+\+ e \(paquete\)\n@@ -1 \+1 @@/);
});

test('a newline inside a link target cannot forge diff lines', () => {
  const dest = tmp();
  const pkg = tmp();
  fs.symlinkSync('viejo', path.join(dest, 'e'));
  fs.symlinkSync('nuevo\n--- falso (destino)\n+x', path.join(pkg, 'e'));
  const out = diffResource(dest, pkg, { target: 'e', source: 'e' });
  const shown = out.join('\n');
  assert.match(shown, /\+-> nuevo\\n--- falso/);
  assert.equal(shown.split('\n').filter((l) => l.startsWith('---')).length, 1);
});

test('a leaf that is neither file nor link shows as unreadable', () => {
  const dest = tmp();
  const pkg = tmp();
  fs.mkdirSync(path.join(dest, 'd'));
  execFileSync('mkfifo', [path.join(dest, 'd', 'fifo')]);
  writeTree(pkg, { 'd': { 'fifo': 'x\n' } });
  const out = diffResource(dest, pkg, { target: 'd', source: 'd' });
  assert.match(out.join('\n'), /-\(no legible\)\n\+x/);
});

test('a directory that cannot be listed degrades to the unreadable marker', () => {
  const dest = tmp();
  const pkg = tmp();
  writeTree(dest, { 'd': { 'sub': { 'f.txt': 'x\n' } } });
  writeTree(pkg, { 'd': { 'sub': { 'f.txt': 'y\n' } } });
  fs.chmodSync(path.join(dest, 'd', 'sub'), 0o000);
  const out = diffResource(dest, pkg, { target: 'd', source: 'd' });
  fs.chmodSync(path.join(dest, 'd', 'sub'), 0o755);
  const shown = out.join('\n');
  // The unlistable directory is a leaf on its side; the readable
  // side's children still appear as their own one-sided leaves.
  assert.match(shown,
    /--- d\/sub \(destino\)\n\+\+\+ d\/sub \(ausente\)\n@@ -1 \+0,0 @@\n-\(no legible\)/);
  assert.match(shown, /--- d\/sub\/f\.txt \(ausente\)\n\+\+\+ d\/sub\/f\.txt \(paquete\)/);
});
