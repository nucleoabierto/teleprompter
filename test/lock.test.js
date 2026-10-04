import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { lockEntry, lockEntries, readLock, writeLock } from '../src/lock.js';

const tmp = () => fs.mkdtempSync(path.join(os.tmpdir(), 'teleprompter-lock-'));

function populatedLock() {
  return {
    packages: {
      alpha: { version: '1.0.0', files: [] },
      beta: { version: '2.0.0', files: [] },
    },
    warnings: [],
  };
}

test('lockEntry returns the recorded entry by name', () => {
  assert.equal(lockEntry(populatedLock(), 'alpha').version, '1.0.0');
});

test('lockEntry answers undefined for a name that is not installed', () => {
  assert.equal(lockEntry(populatedLock(), 'nada'), undefined);
});

test('lockEntries walks every recorded package entry', () => {
  assert.deepEqual(
    lockEntries(populatedLock()).map(([name]) => name),
    ['alpha', 'beta'],
  );
});

test('lockEntries enumerates nothing on an empty registry', () => {
  assert.deepEqual(lockEntries({ packages: {}, warnings: [] }), []);
});

const manifest = { name: 'p', version: '1.0.0' };
const actions = [{ target: 'a.txt', action: 'create', sha256: 'abc' }];

test('writeLock persists the registry and leaves no temp files', () => {
  const dest = tmp();
  writeLock(dest, { packages: {}, warnings: [] }, manifest, actions, undefined);
  const lock = readLock(dest);
  assert.equal(lockEntry(lock, 'p').version, '1.0.0');
  assert.deepEqual(
    fs.readdirSync(dest).filter((f) => f !== 'teleprompter-lock.json'),
    [],
  );
});

test('writeLock registers identical entries and preserves truthful records', () => {
  const dest = tmp();
  const lock = {
    packages: {
      p: {
        version: '0.9.0',
        files: [
          { target: 'vieja.txt', action: 'create', sha256: 'viejo' },
          { target: 'omitida.txt', action: 'skip' },
          { target: 'movida.txt', action: 'create', sha256: 'viejo' },
        ],
      },
    },
    warnings: [],
  };
  const applied = [
    { target: 'vieja.txt', action: 'identical', sha256: 'viejo' },
    { target: 'omitida.txt', action: 'identical', sha256: 'sha-omitida' },
    { target: 'movida.txt', action: 'identical', sha256: 'nuevo' },
    { target: 'nueva.txt', action: 'identical', sha256: 'sha-nueva' },
    { target: 'd/', action: 'mkdir' },
  ];
  writeLock(dest, lock, manifest, applied, undefined);
  assert.deepEqual(lockEntry(readLock(dest), 'p').files, [
    // A matching record keeps its provenance.
    { target: 'vieja.txt', action: 'create', sha256: 'viejo' },
    // A `skip` recorded an omission: it stays one.
    { target: 'omitida.txt', action: 'skip' },
    // A stale hash must not survive the proof that the resource is
    // now identical to the package.
    { target: 'movida.txt', action: 'identical', sha256: 'nuevo' },
    // An identical never written registers with its real action.
    { target: 'nueva.txt', action: 'identical', sha256: 'sha-nueva' },
  ]);
});

test('a failed write leaves the previous lock intact and no temp residue', () => {
  const dest = tmp();
  const previous = JSON.stringify({ packages: { viejo: { version: '0.9.0', files: [] } } });
  fs.writeFileSync(path.join(dest, 'teleprompter-lock.json'), previous);
  // A directory squatting on the temp name makes the write throw,
  // exercising the same cleanup path as a mid-write crash.
  fs.mkdirSync(path.join(dest, `teleprompter-lock.json.${process.pid}.tmp`));
  assert.throws(
    () => writeLock(dest, { packages: {}, warnings: [] }, manifest, actions, undefined),
  );
  assert.equal(fs.readFileSync(path.join(dest, 'teleprompter-lock.json'), 'utf8'), previous);
  assert.deepEqual(
    fs.readdirSync(dest).filter((f) => f !== 'teleprompter-lock.json'),
    [],
  );
});
