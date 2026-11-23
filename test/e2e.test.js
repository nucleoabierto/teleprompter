import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import { hashPath } from '../src/hash.js';

const repoRoot = path.dirname(fileURLToPath(new URL('.', import.meta.url)));
const bin = path.join(repoRoot, 'bin', 'teleprompter.js');
const referencePkg = path.join(repoRoot, 'packages', 'ciclo-tareas');
const SKILLS = ['crear-tareas', 'ejecutar-tareas', 'commit'];

// The destination is rebuilt on every run: prior work plus a provoked
// collision — the local edit of ejecutar-tareas/SKILL.md that the
// package also ships.
function destWithPriorWork() {
  const dest = fs.mkdtempSync(path.join(os.tmpdir(), 'teleprompter-e2e-'));
  fs.writeFileSync(path.join(dest, 'README.md'), '# proyecto propio\n');
  const skills = path.join(dest, '.agents', 'skills');
  fs.mkdirSync(path.join(skills, 'skill-propia'), { recursive: true });
  fs.writeFileSync(path.join(skills, 'skill-propia', 'SKILL.md'), '# mía\n');
  fs.mkdirSync(path.join(skills, 'ejecutar-tareas'), { recursive: true });
  fs.writeFileSync(
    path.join(skills, 'ejecutar-tareas', 'SKILL.md'),
    '# versión local retocada a mano\n',
  );
  return dest;
}

function install(dest, flags = []) {
  // process.execPath guarantees the child runs the same Node the
  // suite runs on — a bare "node" could resolve to another version.
  return spawnSync(process.execPath, [bin, 'install', '--path', referencePkg, dest, ...flags], {
    encoding: 'utf8',
  });
}

const readLockFile = (dest) => JSON.parse(
  fs.readFileSync(path.join(dest, 'teleprompter-lock.json'), 'utf8'),
);

test('the reference package installs end to end through the real binary', () => {
  const dest = destWithPriorWork();
  const localEdit = path.join(dest, '.agents/skills/ejecutar-tareas/SKILL.md');

  // Non-interactive console with an unresolved conflict aborts and
  // writes nothing.
  const aborted = install(dest);
  assert.equal(aborted.status, 2, aborted.stderr);
  assert.match(aborted.stdout, /conflict\s+\.agents\/skills\/ejecutar-tareas/);
  assert.match(aborted.stderr, /conflicto sin resolver.*ejecutar-tareas/s);
  assert.equal(fs.readFileSync(localEdit, 'utf8'), '# versión local retocada a mano\n');
  assert.equal(fs.existsSync(path.join(dest, 'teleprompter-lock.json')), false);
  assert.equal(fs.existsSync(path.join(dest, '.agents/skills/crear-tareas')), false);
  assert.equal(fs.existsSync(path.join(dest, '.teleprompter')), false);

  // --skip installs the free resources and leaves the conflicted one
  // untouched; the lock records the decision without a hash.
  const skipped = install(dest, ['--skip']);
  assert.equal(skipped.status, 0, skipped.stderr);
  assert.match(skipped.stdout, /ejecutar-tareas\/?\s*→ skip/);
  assert.equal(fs.readFileSync(localEdit, 'utf8'), '# versión local retocada a mano\n');
  for (const skill of ['crear-tareas', 'commit']) {
    assert.ok(fs.existsSync(path.join(dest, '.agents/skills', skill, 'SKILL.md')));
  }
  let files = readLockFile(dest).packages['ciclo-tareas'].files;
  assert.equal(files.length, 4);
  const skippedEntry = files.find((f) => f.target.includes('ejecutar-tareas'));
  assert.deepEqual(Object.keys(skippedEntry).sort(), ['action', 'target']);
  assert.equal(skippedEntry.action, 'skip');
  // The declared guide lands in the managed namespace and is recorded.
  const guideTarget = '.teleprompter/ciclo-tareas/PERSONALIZE.md';
  assert.equal(fs.readFileSync(path.join(dest, guideTarget), 'utf8'),
    fs.readFileSync(path.join(referencePkg, 'PERSONALIZE.md'), 'utf8'));
  assert.match(skipped.stdout, /personalización \(\.teleprompter\/ciclo-tareas\/PERSONALIZE\.md\):/);
  assert.match(skipped.stdout, /# Personalización de ciclo-tareas/);
  assert.equal(readLockFile(dest).packages['ciclo-tareas'].personalization, guideTarget);

  // --force overwrites the conflict; the lock records the new content.
  const forced = install(dest, ['--force']);
  assert.equal(forced.status, 0, forced.stderr);
  const shipped = fs.readFileSync(
    path.join(referencePkg, 'skills/ejecutar-tareas/SKILL.md'), 'utf8',
  );
  assert.equal(fs.readFileSync(localEdit, 'utf8'), shipped);
  files = readLockFile(dest).packages['ciclo-tareas'].files;
  const forcedEntry = files.find((f) => f.target.includes('ejecutar-tareas'));
  assert.equal(forcedEntry.action, 'overwrite');
  assert.match(forcedEntry.sha256, /^[0-9a-f]{64}$/);
  assert.equal(forcedEntry.sha256, hashPath(localEdit.replace(/SKILL\.md$/, '')));

  // A third pass owns every resource and reports identical.
  const again = install(dest);
  assert.equal(again.status, 0, again.stderr);
  for (const skill of SKILLS) {
    assert.match(again.stdout, new RegExp(`identical\\s+\\.agents/skills/${skill}`));
  }
  assert.equal(fs.existsSync(path.join(dest, 'teleprompter-lock.json')), true);
});

// --- colección de referencia ---

const referenceCollection = path.join(repoRoot, 'examples', 'coleccion-skills');
const singlePackage = path.join(repoRoot, 'examples', 'paquete-unico');

function installFrom(origin, dest, flags = []) {
  return spawnSync(process.execPath, [bin, 'install', '--path', origin, dest, ...flags], {
    encoding: 'utf8',
  });
}

function updateIn(dest, flags = []) {
  return spawnSync(process.execPath, [bin, 'update', 'crear-tareas', ...flags], {
    encoding: 'utf8', cwd: dest,
  });
}

test('the reference collection installs a selected member end to end', () => {
  // A disposable copy: the update phase mutates the collection, and
  // the repository's example must stay untouched.
  const coll = fs.mkdtempSync(path.join(os.tmpdir(), 'teleprompter-coll-'));
  fs.cpSync(referenceCollection, path.join(coll, 'coleccion-skills'), { recursive: true });
  const origin = path.join(coll, 'coleccion-skills');
  const dest = fs.mkdtempSync(path.join(os.tmpdir(), 'teleprompter-e2e-'));

  // Without a selection the real binary prints the index and aborts.
  const discovery = installFrom(origin, dest);
  assert.equal(discovery.status, 4, discovery.stderr);
  for (const skill of SKILLS) {
    assert.match(discovery.stdout, new RegExp(`${skill}\\s+1\\.0\\.0`));
  }
  assert.match(discovery.stderr, /--package/);
  assert.equal(fs.existsSync(path.join(dest, 'teleprompter-lock.json')), false);
  assert.equal(fs.existsSync(path.join(dest, '.teleprompter')), false);
  assert.equal(fs.existsSync(path.join(dest, '.agents')), false);

  // The selected member installs like any package: skill in place,
  // lock with the collection origin and the member name, guide
  // delivered from the member's own personalization.
  const installed = installFrom(origin, dest, ['--package', 'crear-tareas']);
  assert.equal(installed.status, 0, installed.stderr);
  assert.ok(fs.existsSync(path.join(dest, '.agents/skills/crear-tareas/SKILL.md')));
  assert.equal(fs.existsSync(path.join(dest, '.agents/skills/commit')), false);
  const lock = readLockFile(dest).packages['crear-tareas'];
  assert.deepEqual(lock.origin, { type: 'path', path: origin, package: 'crear-tareas' });
  assert.match(installed.stdout, /personalización \(\.teleprompter\/crear-tareas\/PERSONALIZE\.md\):/);
  const guideTarget = '.teleprompter/crear-tareas/PERSONALIZE.md';
  assert.equal(lock.personalization, guideTarget);
  assert.equal(fs.readFileSync(path.join(dest, guideTarget), 'utf8'),
    fs.readFileSync(path.join(origin, 'crear-tareas/PERSONALIZE.md'), 'utf8'));

  // Upstream changes to the member are picked up by updating the
  // same package: the index re-resolves the name in the fresh tree.
  const member = path.join(origin, 'crear-tareas');
  const manifest = JSON.parse(fs.readFileSync(path.join(member, 'teleprompter.json'), 'utf8'));
  manifest.version = '2.0.0';
  fs.writeFileSync(path.join(member, 'teleprompter.json'), JSON.stringify(manifest, null, 2));
  fs.writeFileSync(path.join(member, 'skills/crear-tareas/SKILL.md'), '# skill actualizada\n');

  const updated = updateIn(dest);
  assert.equal(updated.status, 0, updated.stderr);
  assert.match(updated.stdout, /actualizado: crear-tareas@2\.0\.0/);
  assert.equal(
    fs.readFileSync(path.join(dest, '.agents/skills/crear-tareas/SKILL.md'), 'utf8'),
    '# skill actualizada\n',
  );
  assert.deepEqual(readLockFile(dest).packages['crear-tareas'].origin, {
    type: 'path', path: origin, package: 'crear-tareas',
  });
});

test('the single-package example installs the whole familia as one deliverable', () => {
  const dest = fs.mkdtempSync(path.join(os.tmpdir(), 'teleprompter-e2e-'));
  const installed = installFrom(singlePackage, dest);
  assert.equal(installed.status, 0, installed.stderr);
  for (const skill of SKILLS) {
    assert.ok(fs.existsSync(path.join(dest, '.agents/skills', skill, 'SKILL.md')), skill);
  }
  const lock = readLockFile(dest).packages['paquete-unico'];
  assert.equal(lock.version, '1.0.0');
  assert.deepEqual(lock.origin, { type: 'path', path: singlePackage });
  assert.match(installed.stdout, /personalización \(\.teleprompter\/paquete-unico\/PERSONALIZE\.md\):/);
});

test('reinstall restores the declared state of every recorded unit', () => {
  const dest = destWithPriorWork();
  // Two units on record: the reference package (its seeded collision
  // forced through) and a small second one installed next.
  assert.equal(install(dest, ['--force']).status, 0);
  const other = path.join(
    fs.mkdtempSync(path.join(os.tmpdir(), 'teleprompter-pkg-')), 'extra');
  fs.mkdirSync(other);
  fs.writeFileSync(path.join(other, 'teleprompter.json'), JSON.stringify({
    name: 'extra',
    version: '1.0.0',
    install: [{ source: 'extra.conf', target: 'extra.conf' }],
  }));
  fs.writeFileSync(path.join(other, 'extra.conf'), 'extra=1\n');
  const second = spawnSync(
    process.execPath, [bin, 'install', '--path', other, dest], { encoding: 'utf8' },
  );
  assert.equal(second.status, 0, second.stderr);

  // One divergence per unit: a hand edit and a deletion.
  const edited = path.join(dest, '.agents/skills/commit/SKILL.md');
  fs.writeFileSync(edited, '# tocado a mano\n');
  fs.rmSync(path.join(dest, 'extra.conf'));

  const reinstalled = spawnSync(
    process.execPath, [bin, 'reinstall', '--force'], { encoding: 'utf8', cwd: dest },
  );
  assert.equal(reinstalled.status, 0, reinstalled.stderr);
  assert.match(reinstalled.stdout, /plan de instalación de "ciclo-tareas"/);
  assert.match(reinstalled.stdout, /plan de instalación de "extra":\n  create\s+extra\.conf/);
  assert.match(reinstalled.stdout, /reinstalado: ciclo-tareas@1\.0\.0/);
  assert.match(reinstalled.stdout, /reinstalado: extra@1\.0\.0/);
  assert.equal(
    fs.readFileSync(edited, 'utf8'),
    fs.readFileSync(
      path.join(referencePkg, 'skills/commit/SKILL.md'), 'utf8'),
  );
  assert.equal(fs.readFileSync(path.join(dest, 'extra.conf'), 'utf8'), 'extra=1\n');
  // The displaced local edit was backed up under the managed root —
  // beside the one the install's forced collision already produced.
  const backups = fs.readdirSync(path.join(dest, '.teleprompter', 'backups'));
  assert.equal(backups.length, 2);
  const reinstallBackup = backups.find((d) => fs.existsSync(
    path.join(
      dest, '.teleprompter', 'backups', d, '.agents/skills/commit/SKILL.md'),
  ));
  assert.match(reinstallBackup, /-ciclo-tareas@1\.0\.0$/);
  assert.equal(
    fs.readFileSync(
      path.join(
        dest, '.teleprompter', 'backups', reinstallBackup,
        '.agents/skills/commit/SKILL.md'), 'utf8'),
    '# tocado a mano\n',
  );

  // `check` now sees the disk exactly as the registry declares it.
  const checked = spawnSync(
    process.execPath, [bin, 'check'], { encoding: 'utf8', cwd: dest },
  );
  assert.equal(checked.status, 0, checked.stderr);
  assert.doesNotMatch(checked.stdout, /modificado|ausente|no verificable/);
});

test('a metapackage installs its whole declared set through the real binary', () => {
  const dest = destWithPriorWork();
  const coll = fs.mkdtempSync(path.join(os.tmpdir(), 'teleprompter-coll-'));
  const writePkg = (dir, manifest, files = {}) => {
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(path.join(dir, 'teleprompter.json'), JSON.stringify(manifest));
    for (const [name, content] of Object.entries(files)) {
      fs.writeFileSync(path.join(dir, name), content);
    }
  };
  writePkg(coll, {
    collection: true, name: 'suite', packages: [{ path: 'suite' }, { path: 'pieza' }],
  });
  writePkg(path.join(coll, 'suite'), {
    name: 'suite', version: '1.0.0', dependencies: [{ package: 'pieza' }],
  });
  writePkg(path.join(coll, 'pieza'), {
    name: 'pieza', version: '1.0.0',
    install: [{ source: 'pieza.conf', target: 'pieza.conf' }],
  }, { 'pieza.conf': 'pieza=1\n' });

  const result = spawnSync(
    process.execPath, [bin, 'install', '--path', coll, '--package', 'suite', dest],
    { encoding: 'utf8' },
  );
  assert.equal(result.status, 0, result.stderr);
  assert.ok(result.stdout.indexOf('instalado: pieza') < result.stdout.indexOf('instalado: suite'));
  assert.equal(fs.readFileSync(path.join(dest, 'pieza.conf'), 'utf8'), 'pieza=1\n');
  const lock = JSON.parse(fs.readFileSync(path.join(dest, 'teleprompter-lock.json'), 'utf8'));
  assert.deepEqual(lock.packages.suite.files, []);
  assert.equal(lock.packages.pieza.origin.package, 'pieza');
});
