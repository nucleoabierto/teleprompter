import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {
  main, EXIT_OK, EXIT_PLAN,
} from '../src/cli.js';
import { buildUpdatePlan } from '../src/plan.js';
import { hashPath } from '../src/hash.js';

function tmp() {
  return fs.mkdtempSync(path.join(os.tmpdir(), 'teleprompter-'));
}

async function run(argv, io = {}) {
  const stdout = [];
  const stderr = [];
  const code = await main(argv, {
    out: (m) => stdout.push(m),
    err: (m) => stderr.push(m),
    ...io,
  });
  return { code, stdout, stderr };
}

// Fixture: package with file and directory resources; nested objects
// describe subdirectories recursively.
function pkgWith(name, files = {}) {
  const dir = path.join(tmp(), name);
  fs.mkdirSync(dir, { recursive: true });
  const install = Object.keys(files).map((f) => ({ source: f, target: f }));
  fs.writeFileSync(path.join(dir, 'teleprompter.json'), JSON.stringify({
    name, version: '1.0.0', install,
  }));
  writeTree(dir, files);
  return dir;
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

test('plan marks every resource create on an empty destination', async () => {
  const dest = tmp();
  const pkg = pkgWith('vacio', { 'a.txt': 'a', 'd/': { 'x.txt': 'x' } });
  const { code, stdout } = await run(['--path', pkg, dest]);
  assert.equal(code, EXIT_OK);
  const out = stdout.join('\n');
  assert.match(out, /create\s+a\.txt/);
  assert.match(out, /create\s+d\//);
});

test('plan marks identical when the destination already holds the same content', async () => {
  const dest = tmp();
  const pkg = pkgWith('mismo', {
    'a.txt': 'igual',
    'dir': { 'f.txt': 'inside', 'sub': { 'g.txt': 'deep' } },
  });
  writeTree(dest, {
    'a.txt': 'igual',
    'dir': { 'f.txt': 'inside', 'sub': { 'g.txt': 'deep' } },
  });
  const { code, stdout } = await run(['--path', pkg, dest]);
  assert.equal(code, EXIT_OK);
  const out = stdout.join('\n');
  assert.match(out, /identical\s+a\.txt/);
  assert.match(out, /identical\s+dir/);
});

test('plan reports conflict for foreign content without a lock record', async () => {
  const dest = tmp();
  fs.writeFileSync(path.join(dest, 'a.txt'), 'otro contenido');
  const pkg = pkgWith('choque', { 'a.txt': 'a' });
  const { code, stderr } = await run(['--path', pkg, dest]);
  assert.equal(code, EXIT_PLAN);
  assert.match(stderr.join('\n'), /conflicto sin resolver: a\.txt/);
  assert.match(stderr.join('\n'), /plan no ejecutable/);
});

test('plan marks managed-update when the destination still holds what the lock recorded', async () => {
  const dest = tmp();
  fs.writeFileSync(path.join(dest, 'a.txt'), 'versión previa');
  const sha256 = hashPath(path.join(dest, 'a.txt'));
  fs.writeFileSync(path.join(dest, 'teleprompter-lock.json'), JSON.stringify({
    packages: { propio: { version: '1.0.0', files: [{ target: 'a.txt', action: 'create', sha256 }] } },
  }));
  const pkg = pkgWith('propio', { 'a.txt': 'nueva' });
  const { code, stdout } = await run(['--path', pkg, dest]);
  assert.equal(code, EXIT_OK);
  assert.match(stdout.join('\n'), /managed-update\s+a\.txt/);
});

test('plan marks conflict when a recorded resource was modified locally', async () => {
  const dest = tmp();
  fs.writeFileSync(path.join(dest, 'a.txt'), 'tocado a mano');
  fs.writeFileSync(path.join(dest, 'teleprompter-lock.json'), JSON.stringify({
    packages: {
      mano: {
        version: '1.0.0',
        files: [{ target: 'a.txt', action: 'create', sha256: 'otro-hash' }],
      },
    },
  }));
  const pkg = pkgWith('mano', { 'a.txt': 'x' });
  const { code } = await run(['--path', pkg, dest]);
  assert.equal(code, EXIT_PLAN);
});

test('plan still computes with a missing or corrupt lock file', async () => {
  const dest = tmp();
  fs.writeFileSync(path.join(dest, 'teleprompter-lock.json'), '{roto');
  const pkg = pkgWith('sinlock', { 'a.txt': 'a' });
  const { code, stdout } = await run(['--path', pkg, dest]);
  assert.equal(code, EXIT_OK);
  assert.match(stdout.join('\n'), /aviso:.*lock.*corrupto/s);
});

test('plan treats a recorded resource as conflict when the package downgrades it', async () => {
  const dest = tmp();
  fs.writeFileSync(path.join(dest, 'a.txt'), 'previa');
  const sha256 = hashPath(path.join(dest, 'a.txt'));
  fs.writeFileSync(path.join(dest, 'teleprompter-lock.json'), JSON.stringify({
    packages: { viejo: { version: '2.0.0', files: [{ target: 'a.txt', action: 'create', sha256 }] } },
  }));
  const pkg = pkgWith('viejo', { 'a.txt': 'x' });
  const { code } = await run(['--path', pkg, dest]);
  assert.equal(code, EXIT_PLAN);
});

test('plan ignores a lock file that is valid JSON without a packages map', async () => {
  const dest = tmp();
  fs.writeFileSync(path.join(dest, 'teleprompter-lock.json'), '{}');
  const pkg = pkgWith('sinpkgs', { 'a.txt': 'a' });
  const { code } = await run(['--path', pkg, dest]);
  assert.equal(code, EXIT_OK);
});

test('plan warns and treats a structurally malformed lock as empty history', async () => {
  for (const content of [
    'null', '[]', '{"packages":[]}', '{"packages":{"x":{"files":"nope"}}}',
    '{"packages":{"x":{"files":[{}]}}}',
    '{"packages":{"x":{"files":[{"target":"a.txt"}]}}}',
    '{"packages":{"x":{"version":"1.0.0","files":[{"target":"a.txt","sha256":123}]}}}',
  ]) {
    const dest = tmp();
    fs.writeFileSync(path.join(dest, 'teleprompter-lock.json'), content);
    const pkg = pkgWith('malformado', { 'a.txt': 'a' });
    const { code, stdout } = await run(['--path', pkg, dest]);
    assert.equal(code, EXIT_OK);
    assert.match(stdout.join('\n'), /aviso:.*lock.*corrupto/s);
  }
});

test('plan treats a skip-recorded target as conflict since it carries no hash', async () => {
  const dest = tmp();
  fs.writeFileSync(path.join(dest, 'a.txt'), 'cualquiera');
  fs.writeFileSync(path.join(dest, 'teleprompter-lock.json'), JSON.stringify({
    packages: { saltado: { version: '1.0.0', files: [{ target: 'a.txt', action: 'skip' }] } },
  }));
  const pkg = pkgWith('saltado', { 'a.txt': 'x' });
  const { code } = await run(['--path', pkg, dest]);
  assert.equal(code, EXIT_PLAN);
});

test('plan does not confuse an empty file with an empty directory', async () => {
  const dest = tmp();
  fs.mkdirSync(path.join(dest, 'a.txt'));
  const pkg = pkgWith('hueco', { 'a.txt': '' });
  const { code } = await run(['--path', pkg, dest]);
  assert.equal(code, EXIT_PLAN);
});

test('plan treats a dangling symlink at the target as occupied', async () => {
  const dest = tmp();
  fs.symlinkSync('no-existe', path.join(dest, 'a.txt'));
  const pkg = pkgWith('colgado', { 'a.txt': 'a' });
  const { code } = await run(['--path', pkg, dest]);
  assert.equal(code, EXIT_PLAN);
});

test('plan hashes a destination that is itself a symlink', async () => {
  const dest = tmp();
  fs.writeFileSync(path.join(dest, 'real.txt'), 'contenido real');
  fs.symlinkSync('real.txt', path.join(dest, 'a.txt'));
  const pkg = pkgWith('enlaceraiz', { 'a.txt': 'a' });
  const { code } = await run(['--path', pkg, dest]);
  assert.equal(code, EXIT_PLAN);
});

test('plan treats symlinks inside resources as comparable leaves', async () => {
  const dest = tmp();
  fs.mkdirSync(path.join(dest, 'd'));
  fs.writeFileSync(path.join(dest, 'd', 'f.txt'), 'x');
  fs.symlinkSync('f.txt', path.join(dest, 'd', 'l'));
  const pkg = pkgWith('enlace', { 'd': { 'f.txt': 'x' } });
  fs.symlinkSync('f.txt', path.join(pkg, 'd', 'l'));
  const { code, stdout } = await run(['--path', pkg, dest]);
  assert.equal(code, EXIT_OK);
  assert.match(stdout.join('\n'), /identical\s+d/);
});

test('an interactive console without an asker reports conflicts and aborts', async () => {
  const dest = tmp();
  fs.writeFileSync(path.join(dest, 'a.txt'), 'ajeno');
  const pkg = pkgWith('sinpregunta', { 'a.txt': 'a' });
  const { code, stderr } = await run(['--path', pkg, dest], { interactive: true });
  assert.equal(code, EXIT_PLAN);
  assert.match(stderr.join('\n'), /conflicto sin resolver/);
});

test('plan downgrades managed-update to conflict when the parent chain escapes', async () => {
  const dest = tmp();
  const outside = tmp();
  fs.writeFileSync(path.join(outside, 'f.txt'), 'x');
  fs.symlinkSync(outside, path.join(dest, 'vendor'));
  fs.writeFileSync(path.join(dest, 'teleprompter-lock.json'), JSON.stringify({
    packages: {
      trapdoor: {
        version: '1.0.0',
        files: [{
          target: 'vendor/f.txt', action: 'create',
          sha256: hashPath(path.join(outside, 'f.txt')),
        }],
      },
    },
  }));
  const pkg = pkgWith('trapdoor', { 'vendor/f.txt': 'y' });
  const { code, stdout } = await run(['--path', pkg, dest]);
  assert.equal(code, EXIT_PLAN);
  assert.match(stdout.join('\n'), /conflict\s+vendor\/f\.txt/);
});

test('--dry-run prints the plan and exits without writing', async () => {
  const dest = tmp();
  const pkg = pkgWith('seco', { 'a.txt': 'a' });
  const { code, stdout } = await run(['--path', pkg, dest, '--dry-run']);
  assert.equal(code, EXIT_OK);
  assert.match(stdout.join('\n'), /--dry-run/);
  assert.deepEqual(fs.readdirSync(dest), []);
});

test('--force resolves every conflict as overwrite', async () => {
  const dest = tmp();
  fs.writeFileSync(path.join(dest, 'a.txt'), 'ajeno');
  const pkg = pkgWith('fuerza', { 'a.txt': 'a' });
  const { code, stdout } = await run(['--path', pkg, dest, '--force']);
  assert.equal(code, EXIT_OK);
  assert.match(stdout.join('\n'), /a\.txt → overwrite/);
  assert.equal(fs.readFileSync(path.join(dest, 'a.txt'), 'utf8'), 'a');
});

test('--skip resolves every conflict as skip', async () => {
  const dest = tmp();
  fs.writeFileSync(path.join(dest, 'a.txt'), 'ajeno');
  const pkg = pkgWith('omite', { 'a.txt': 'a' });
  const { code, stdout } = await run(['--path', pkg, dest, '--skip']);
  assert.equal(code, EXIT_OK);
  assert.match(stdout.join('\n'), /a\.txt → skip/);
  assert.equal(fs.readFileSync(path.join(dest, 'a.txt'), 'utf8'), 'ajeno');
});

test('an interactive console resolves each conflict per answer', async () => {
  const dest = tmp();
  fs.writeFileSync(path.join(dest, 'a.txt'), 'ajeno');
  fs.writeFileSync(path.join(dest, 'b.txt'), 'ajeno también');
  const pkg = pkgWith('interactivo', { 'a.txt': 'a', 'b.txt': 'b' });
  const answers = [true, false];
  const questions = [];
  const { code, stdout } = await run(['--path', pkg, dest], {
    interactive: true,
    createAsker: () => ({
      ask: async (q) => { questions.push(q); return answers.shift(); },
      close: () => {},
    }),
  });
  assert.equal(code, EXIT_OK);
  assert.equal(questions.length, 2);
  assert.match(questions[0], /sobrescribir/);
  assert.match(stdout.join('\n'), /a\.txt → overwrite/);
  assert.match(stdout.join('\n'), /b\.txt → skip/);
});

// --- El plan de actualización --------------------------------------

// Fixture: destination with a fabricated lock recording `version` and
// per-target hashes — the state an earlier install would have left.
function destWithLock(files, { version = '1.0.0', name = 'paquete', extra = [] } = {}) {
  const dest = tmp();
  writeTree(dest, files);
  const lockFiles = [
    ...Object.keys(files).map((target) => ({
      target,
      action: 'create',
      sha256: hashPath(path.join(dest, target)),
    })),
    ...extra,
  ];
  fs.writeFileSync(path.join(dest, 'teleprompter-lock.json'), JSON.stringify({
    packages: { [name]: { version, files: lockFiles } },
  }));
  return { dest, lock: { packages: { [name]: { version, files: lockFiles } } } };
}

test('update plan reports upToDate when the incoming version matches', () => {
  const { dest, lock } = destWithLock({ 'a.txt': 'a' });
  const pkg = pkgWith('paquete', { 'a.txt': 'a' });
  const manifest = JSON.parse(
    fs.readFileSync(path.join(pkg, 'teleprompter.json'), 'utf8'),
  );
  const plan = buildUpdatePlan(pkg, manifest, dest, [], lock);
  assert.equal(plan.upToDate, true);
  assert.deepEqual(plan.resources, []);
  assert.deepEqual(plan.conflicts, []);
  assert.deepEqual(plan.retired, []);
});

test('update plan marks a resource new in the version as create', () => {
  const { dest, lock } = destWithLock({ 'a.txt': 'a' });
  const pkg = pkgWith('paquete', { 'a.txt': 'a', 'nuevo.txt': 'n' });
  const manifest = JSON.parse(
    fs.readFileSync(path.join(pkg, 'teleprompter.json'), 'utf8'),
  );
  manifest.version = '2.0.0';
  const plan = buildUpdatePlan(pkg, manifest, dest, [], lock);
  const nuevo = plan.resources.find((r) => r.target === 'nuevo.txt');
  assert.equal(nuevo.status, 'create');
});

test('update plan marks identical when the destination already holds the incoming content', () => {
  const { dest, lock } = destWithLock({ 'a.txt': 'a' });
  const pkg = pkgWith('paquete', { 'a.txt': 'a' });
  const manifest = JSON.parse(
    fs.readFileSync(path.join(pkg, 'teleprompter.json'), 'utf8'),
  );
  manifest.version = '2.0.0';
  const plan = buildUpdatePlan(pkg, manifest, dest, [], lock);
  assert.equal(plan.resources[0].status, 'identical');
});

test('update plan marks update when the version changed an intact resource', () => {
  const { dest, lock } = destWithLock({ 'a.txt': 'viejo' });
  const pkg = pkgWith('paquete', { 'a.txt': 'nuevo' });
  const manifest = JSON.parse(
    fs.readFileSync(path.join(pkg, 'teleprompter.json'), 'utf8'),
  );
  manifest.version = '2.0.0';
  const plan = buildUpdatePlan(pkg, manifest, dest, [], lock);
  assert.equal(plan.resources[0].status, 'update');
});

test('update plan marks conflict when the version and the user both changed it', () => {
  const { dest, lock } = destWithLock({ 'a.txt': 'viejo' });
  fs.writeFileSync(path.join(dest, 'a.txt'), 'editado');
  const pkg = pkgWith('paquete', { 'a.txt': 'nuevo' });
  const manifest = JSON.parse(
    fs.readFileSync(path.join(pkg, 'teleprompter.json'), 'utf8'),
  );
  manifest.version = '2.0.0';
  const plan = buildUpdatePlan(pkg, manifest, dest, [], lock);
  assert.equal(plan.resources[0].status, 'conflict');
  assert.equal(plan.conflicts.length, 1);
});

test('update plan marks conflict when only the user changed the resource', () => {
  const { dest, lock } = destWithLock({ 'a.txt': 'viejo' });
  fs.writeFileSync(path.join(dest, 'a.txt'), 'editado');
  const pkg = pkgWith('paquete', { 'a.txt': 'viejo' });
  const manifest = JSON.parse(
    fs.readFileSync(path.join(pkg, 'teleprompter.json'), 'utf8'),
  );
  manifest.version = '2.0.0';
  const plan = buildUpdatePlan(pkg, manifest, dest, [], lock);
  assert.equal(plan.resources[0].status, 'conflict');
});

test('update plan retires an intact resource the version no longer ships', () => {
  const { dest, lock } = destWithLock({ 'a.txt': 'a', 'viejo.txt': 'v' });
  const pkg = pkgWith('paquete', { 'a.txt': 'a' });
  const manifest = JSON.parse(
    fs.readFileSync(path.join(pkg, 'teleprompter.json'), 'utf8'),
  );
  manifest.version = '2.0.0';
  const plan = buildUpdatePlan(pkg, manifest, dest, [], lock);
  assert.deepEqual(plan.retired, [{ target: 'viejo.txt', status: 'retire' }]);
  assert.equal(plan.conflicts.length, 0);
});

test('update plan turns a drifted retired resource into a removal conflict', () => {
  const { dest, lock } = destWithLock({ 'a.txt': 'a', 'viejo.txt': 'v' });
  fs.writeFileSync(path.join(dest, 'viejo.txt'), 'editado');
  const pkg = pkgWith('paquete', { 'a.txt': 'a' });
  const manifest = JSON.parse(
    fs.readFileSync(path.join(pkg, 'teleprompter.json'), 'utf8'),
  );
  manifest.version = '2.0.0';
  const plan = buildUpdatePlan(pkg, manifest, dest, [], lock);
  assert.deepEqual(plan.retired, []);
  const removal = plan.conflicts.find((r) => r.target === 'viejo.txt');
  assert.equal(removal.status, 'conflict');
  assert.equal(removal.removal, true);
});

test('update plan treats an unverifiable retired resource as a removal conflict', () => {
  const { dest, lock } = destWithLock({ 'a.txt': 'a' }, {
    extra: [{ target: 'sin-hash.txt', action: 'create' }],
  });
  writeTree(dest, { 'sin-hash.txt': 'x' });
  const pkg = pkgWith('paquete', { 'a.txt': 'a' });
  const manifest = JSON.parse(
    fs.readFileSync(path.join(pkg, 'teleprompter.json'), 'utf8'),
  );
  manifest.version = '2.0.0';
  const plan = buildUpdatePlan(pkg, manifest, dest, [], lock);
  const removal = plan.conflicts.find((r) => r.target === 'sin-hash.txt');
  assert.equal(removal.status, 'conflict');
  assert.equal(removal.removal, true);
});

test('update plan drops a retired target already missing on disk', () => {
  const { dest, lock } = destWithLock({ 'a.txt': 'a' }, {
    extra: [{ target: 'borrado.txt', action: 'create', sha256: 'x'.repeat(64) }],
  });
  const pkg = pkgWith('paquete', { 'a.txt': 'a' });
  const manifest = JSON.parse(
    fs.readFileSync(path.join(pkg, 'teleprompter.json'), 'utf8'),
  );
  manifest.version = '2.0.0';
  const plan = buildUpdatePlan(pkg, manifest, dest, [], lock);
  assert.deepEqual(plan.retired, []);
  assert.equal(plan.conflicts.find((r) => r.target === 'borrado.txt'), undefined);
});

test('update plan re-creates a recorded resource the user deleted', () => {
  const { dest, lock } = destWithLock({ 'a.txt': 'a' }, {
    extra: [{ target: 'b.txt', action: 'create', sha256: 'x'.repeat(64) }],
  });
  const pkg = pkgWith('paquete', { 'a.txt': 'a', 'b.txt': 'b' });
  const manifest = JSON.parse(
    fs.readFileSync(path.join(pkg, 'teleprompter.json'), 'utf8'),
  );
  manifest.version = '2.0.0';
  const plan = buildUpdatePlan(pkg, manifest, dest, [], lock);
  const b = plan.resources.find((r) => r.target === 'b.txt');
  assert.equal(b.status, 'create');
});

test('update plan never marks an update on a downgrade', () => {
  const { dest, lock } = destWithLock({ 'a.txt': 'viejo' }, { version: '2.0.0' });
  const pkg = pkgWith('paquete', { 'a.txt': 'nuevo' });
  const manifest = JSON.parse(
    fs.readFileSync(path.join(pkg, 'teleprompter.json'), 'utf8'),
  );
  manifest.version = '1.0.0';
  const plan = buildUpdatePlan(pkg, manifest, dest, [], lock);
  assert.equal(plan.resources[0].status, 'conflict');
});

test('update plan never retires skip entries nor the managed guide', () => {
  const { dest, lock } = destWithLock({ 'a.txt': 'a' }, {
    extra: [{ target: 'omitido.txt', action: 'skip' }],
  });
  writeTree(dest, { '.teleprompter/paquete': { 'GUIA.md': 'guía' } });
  lock.packages.paquete.files.push({
    target: '.teleprompter/paquete/GUIA.md',
    action: 'create',
    sha256: hashPath(path.join(dest, '.teleprompter/paquete/GUIA.md')),
  });
  lock.packages.paquete.personalization = '.teleprompter/paquete/GUIA.md';
  const pkg = pkgWith('paquete', { 'a.txt': 'a' });
  const manifest = JSON.parse(
    fs.readFileSync(path.join(pkg, 'teleprompter.json'), 'utf8'),
  );
  manifest.version = '2.0.0';
  manifest.personalization = 'GUIA.md';
  const plan = buildUpdatePlan(pkg, manifest, dest, [], lock);
  assert.deepEqual(plan.retired, []);
  assert.equal(plan.conflicts.length, 0);
});

test('update plan retires the old guide when the version drops personalization', () => {
  const { dest, lock } = destWithLock({ 'a.txt': 'a' });
  writeTree(dest, { '.teleprompter/paquete': { 'GUIA.md': 'guía' } });
  lock.packages.paquete.files.push({
    target: '.teleprompter/paquete/GUIA.md',
    action: 'create',
    sha256: hashPath(path.join(dest, '.teleprompter/paquete/GUIA.md')),
  });
  lock.packages.paquete.personalization = '.teleprompter/paquete/GUIA.md';
  const pkg = pkgWith('paquete', { 'a.txt': 'a' });
  const manifest = JSON.parse(
    fs.readFileSync(path.join(pkg, 'teleprompter.json'), 'utf8'),
  );
  manifest.version = '2.0.0';
  const plan = buildUpdatePlan(pkg, manifest, dest, [], lock);
  assert.deepEqual(plan.retired, [
    { target: '.teleprompter/paquete/GUIA.md', status: 'retire' },
  ]);
});

test('update plan treats a manifest-declared guide without a recorded one', () => {
  const { dest, lock } = destWithLock({ 'a.txt': 'a' });
  const pkg = pkgWith('paquete', { 'a.txt': 'a' });
  const manifest = JSON.parse(
    fs.readFileSync(path.join(pkg, 'teleprompter.json'), 'utf8'),
  );
  manifest.version = '2.0.0';
  manifest.personalization = 'GUIA.md';
  const plan = buildUpdatePlan(pkg, manifest, dest, [], lock);
  assert.deepEqual(plan.retired, []);
  assert.equal(plan.upToDate, false);
});

test('update plan demotes an update to conflict when the parent chain escapes', () => {
  const outside = tmp();
  writeTree(outside, { 'a.txt': 'viejo' });
  const dest = tmp();
  fs.symlinkSync(outside, path.join(dest, 'link'));
  const lock = {
    packages: {
      paquete: {
        version: '1.0.0',
        files: [{ target: 'link/a.txt', action: 'create', sha256: hashPath(path.join(outside, 'a.txt')) }],
      },
    },
  };
  const pkg = pkgWith('paquete', { 'b.txt': 'nuevo' });
  const manifest = JSON.parse(
    fs.readFileSync(path.join(pkg, 'teleprompter.json'), 'utf8'),
  );
  manifest.version = '2.0.0';
  manifest.install = [{ source: 'b.txt', target: 'link/a.txt' }];
  const plan = buildUpdatePlan(pkg, manifest, dest, [], lock);
  assert.equal(plan.resources[0].status, 'conflict');
});

test('update plan on an unrecorded package classifies like a fresh install', () => {
  const dest = tmp();
  const pkg = pkgWith('otro', { 'a.txt': 'a', 'b.txt': 'b' });
  writeTree(dest, { 'b.txt': 'ajeno' });
  const manifest = JSON.parse(
    fs.readFileSync(path.join(pkg, 'teleprompter.json'), 'utf8'),
  );
  const plan = buildUpdatePlan(pkg, manifest, dest, [], { packages: {} });
  assert.equal(plan.upToDate, false);
  const byTarget = Object.fromEntries(plan.resources.map((r) => [r.target, r.status]));
  assert.equal(byTarget['a.txt'], 'create');
  assert.equal(byTarget['b.txt'], 'conflict');
});

test('update plan demotes a create to conflict when the parent chain escapes', () => {
  const outside = tmp();
  const dest = tmp();
  fs.symlinkSync(outside, path.join(dest, 'link'));
  const pkg = pkgWith('paquete', { 'b.txt': 'nuevo' });
  const manifest = JSON.parse(
    fs.readFileSync(path.join(pkg, 'teleprompter.json'), 'utf8'),
  );
  manifest.version = '2.0.0';
  manifest.install = [{ source: 'b.txt', target: 'link/a.txt' }];
  const plan = buildUpdatePlan(pkg, manifest, dest, [], { packages: {} });
  assert.equal(plan.resources[0].status, 'conflict');
});

test('update plan never retires a shipped target written differently', () => {
  const { dest, lock } = destWithLock({ 'a.txt': 'viejo' });
  const pkg = pkgWith('paquete', { 'b.txt': 'nuevo' });
  const manifest = JSON.parse(
    fs.readFileSync(path.join(pkg, 'teleprompter.json'), 'utf8'),
  );
  manifest.version = '2.0.0';
  manifest.install = [{ source: 'b.txt', target: './a.txt' }];
  const plan = buildUpdatePlan(pkg, manifest, dest, [], lock);
  assert.deepEqual(plan.retired, []);
  assert.equal(plan.resources[0].status, 'update');
});

test('update plan keeps retire and conflict shapes on a mixed plan', () => {
  const { dest, lock } = destWithLock({
    'a.txt': 'a', 'viejo.txt': 'v', 'editado.txt': 'e',
  });
  fs.writeFileSync(path.join(dest, 'editado.txt'), 'editado por el usuario');
  const pkg = pkgWith('paquete', { 'a.txt': 'a' });
  const manifest = JSON.parse(
    fs.readFileSync(path.join(pkg, 'teleprompter.json'), 'utf8'),
  );
  manifest.version = '2.0.0';
  const plan = buildUpdatePlan(pkg, manifest, dest, [], lock);
  assert.deepEqual(plan.retired, [{ target: 'viejo.txt', status: 'retire' }]);
  assert.deepEqual(
    plan.conflicts.map((r) => [r.target, r.removal]),
    [['editado.txt', true]],
  );
});

test('upToDate plan carries no mkdirs nor resources', () => {
  const { dest, lock } = destWithLock({ 'a.txt': 'a' });
  const pkg = pkgWith('paquete', { 'a.txt': 'a' });
  const manifest = JSON.parse(
    fs.readFileSync(path.join(pkg, 'teleprompter.json'), 'utf8'),
  );
  const plan = buildUpdatePlan(pkg, manifest, dest, ['d/'], lock);
  assert.deepEqual(plan, {
    upToDate: true, mkdirs: [], resources: [], conflicts: [], retired: [],
  });
});

test('update plan retires the old guide when the version renames it', () => {
  const { dest, lock } = destWithLock({ 'a.txt': 'a' });
  writeTree(dest, { '.teleprompter/paquete': { 'GUIA.md': 'guía' } });
  lock.packages.paquete.files.push({
    target: '.teleprompter/paquete/GUIA.md',
    action: 'create',
    sha256: hashPath(path.join(dest, '.teleprompter/paquete/GUIA.md')),
  });
  lock.packages.paquete.personalization = '.teleprompter/paquete/GUIA.md';
  const pkg = pkgWith('paquete', { 'a.txt': 'a' });
  const manifest = JSON.parse(
    fs.readFileSync(path.join(pkg, 'teleprompter.json'), 'utf8'),
  );
  manifest.version = '2.0.0';
  manifest.personalization = 'NUEVA.md';
  const plan = buildUpdatePlan(pkg, manifest, dest, [], lock);
  assert.deepEqual(plan.retired, [
    { target: '.teleprompter/paquete/GUIA.md', status: 'retire' },
  ]);
});
