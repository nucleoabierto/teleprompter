import test from 'node:test';
import assert from 'node:assert/strict';
import { lockEntry, lockEntries } from '../src/lock.js';

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
