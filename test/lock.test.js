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
