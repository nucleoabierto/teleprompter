/* eslint-disable @typescript-eslint/no-floating-promises */
/* eslint-disable @typescript-eslint/no-empty-function */
import assert from 'node:assert'
import { test, describe, mock } from 'node:test'

import runCommand from '../../src/commands/run.js'
import logger from '../../src/utils/logger.js'

import type { RunDeps } from '../../src/commands/run.js'

describe('Run Command', () => {
  const installConfigurationMock = mock.fn(async () => {})
  const exitMock = mock.fn((code: number) => {})

  const mockDeps: RunDeps = {
    installConfiguration: installConfigurationMock,
    exit: exitMock,
  }

  test.beforeEach(() => {
    mock.method(logger, 'info', () => {})
    mock.method(logger, 'success', () => {})
    mock.method(logger, 'warning', () => {})
    mock.method(logger, 'error', () => {})
    mock.method(logger, 'plain', () => {})
  })

  test.afterEach(() => {
    mock.restoreAll()
    // Reset mock call counts
    installConfigurationMock.mock.resetCalls()
    exitMock.mock.resetCalls()
  })

  test('debe llamar a installConfiguration con repo y opciones', async () => {
    const options = { dir: '/test', force: true, branch: 'dev' }
    await runCommand('owner/repo', options, mockDeps)

    assert.strictEqual(installConfigurationMock.mock.callCount(), 1)
    const callArgs = installConfigurationMock.mock.calls[0]?.arguments
    assert.deepStrictEqual(callArgs, ['owner/repo', options])
    assert.strictEqual(exitMock.mock.callCount(), 0)
  })

  test('debe llamar a installConfiguration sin repo', async () => {
    await runCommand(undefined, {}, mockDeps)

    assert.strictEqual(installConfigurationMock.mock.callCount(), 1)
    const callArgs = installConfigurationMock.mock.calls[0]?.arguments
    assert.deepStrictEqual(callArgs, [undefined, {}])
    assert.strictEqual(exitMock.mock.callCount(), 0)
  })

  test('debe manejar errores y llamar a process.exit', async () => {
    const errorMockDeps = {
      ...mockDeps,
      installConfiguration: mock.fn(async () => {
        throw new Error('Test error')
      }),
    }

    await runCommand('owner/repo', {}, errorMockDeps)

    assert.strictEqual(exitMock.mock.callCount(), 1)
    assert.strictEqual(exitMock.mock.calls[0]?.arguments[0], 1)
  })
})
