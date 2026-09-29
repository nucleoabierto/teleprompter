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
  return spawnSync(process.execPath, [bin, 'install', referencePkg, dest, ...flags], {
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
  assert.equal(files.length, 3);
  const skippedEntry = files.find((f) => f.target.includes('ejecutar-tareas'));
  assert.deepEqual(Object.keys(skippedEntry).sort(), ['action', 'target']);
  assert.equal(skippedEntry.action, 'skip');

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
