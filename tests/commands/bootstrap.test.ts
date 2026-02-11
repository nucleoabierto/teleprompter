/* eslint-disable @typescript-eslint/no-floating-promises */
/* eslint-disable @typescript-eslint/no-empty-function */
import assert from 'node:assert'
import { test, describe, mock } from 'node:test'

import bootstrapCommand from '../../src/commands/bootstrap.js'
import logger from '../../src/utils/logger.js'

import type { BootstrapDeps } from '../../src/commands/bootstrap.js'
import type { DetectedConfig } from '../../src/core/processor.js'

describe('Bootstrap Command', () => {
  const loadInstalledConfigsMock = mock.fn<() => Promise<DetectedConfig[]>>(async () => [])
  const exitMock = mock.fn((code: number) => {})

  const mockDeps: BootstrapDeps = {
    loadInstalledConfigs: loadInstalledConfigsMock,
    exit: exitMock,
  }

  const mockConfig: DetectedConfig = {
    name: 'Test Config',
    slug: 'test-config',
    path: '/mock/path',
    folderName: 'test-config',
    script: {
      description: 'Test description',
      bootstrap: 'echo "Test bootstrap"',
    },
  }

  test.beforeEach(() => {
    mock.method(logger, 'info', () => {})
    mock.method(logger, 'success', () => {})
    mock.method(logger, 'warning', () => {})
    mock.method(logger, 'error', () => {})
    mock.method(logger, 'plain', () => {})

    loadInstalledConfigsMock.mock.mockImplementation(async () => [])
  })

  test.afterEach(() => {
    mock.restoreAll()
    // Reset mock call counts for proper isolation
    loadInstalledConfigsMock.mock.resetCalls()
    exitMock.mock.resetCalls()
  })

  test('debe mostrar mensaje cuando no hay configuraciones', async () => {
    loadInstalledConfigsMock.mock.mockImplementation(async () => [])
    const infoMock = mock.method(logger, 'info', () => {})

    await bootstrapCommand({}, mockDeps)

    assert.strictEqual(loadInstalledConfigsMock.mock.callCount(), 1)
    assert.strictEqual(infoMock.mock.callCount(), 2)
    const { calls } = infoMock.mock
    assert.ok(calls[0]?.arguments[0]?.includes('No hay configuraciones instaladas'))
    assert.strictEqual(exitMock.mock.callCount(), 0)
  })

  test('debe mostrar instrucciones de bootstrap para las configuraciones', async () => {
    loadInstalledConfigsMock.mock.mockImplementation(async () => [mockConfig])
    const plainMock = mock.method(logger, 'plain', () => {})

    await bootstrapCommand({}, mockDeps)

    assert.strictEqual(plainMock.mock.callCount(), 2)
    const { calls } = plainMock.mock
    assert.ok(calls[0]?.arguments[0]?.includes('echo "Test bootstrap"'))
  })

  test('debe manejar errores y llamar a process.exit', async () => {
    loadInstalledConfigsMock.mock.mockImplementation(async () => {
      throw new Error('Test error')
    })
    const errorMock = mock.method(logger, 'error', () => {})

    await bootstrapCommand({}, mockDeps)

    assert.strictEqual(errorMock.mock.callCount(), 1)
    assert.strictEqual(exitMock.mock.callCount(), 1)
    assert.strictEqual(exitMock.mock.calls[0]?.arguments[0], 1)
  })
})
