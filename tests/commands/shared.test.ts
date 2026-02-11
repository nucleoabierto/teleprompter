/* eslint-disable @typescript-eslint/no-floating-promises */
import assert from 'node:assert'
import { test, describe, mock } from 'node:test'

import { loadInstalledConfigs } from '../../src/commands/shared.js'

import type { SharedDeps } from '../../src/commands/shared.js'
import type { DetectedConfig } from '../../src/core/detector.js'

describe('Shared Commands Utils', () => {
  const mockConfig: DetectedConfig = {
    name: 'Test Config',
    slug: 'test-config',
    path: '/mock/path',
    folderName: 'test-config',
    // eslint-disable-next-line secure-coding/no-hardcoded-credentials
    script: { description: 'Test', bootstrap: 'echo' },
  }

  const pathExistsMock = mock.fn(async () => true)
  const detectConfigsMock = mock.fn(async () => [mockConfig])

  const mockDeps: SharedDeps = {
    pathExists: pathExistsMock,
    detectConfigs: detectConfigsMock,
  }

  test.afterEach(() => {
    mock.restoreAll()
    pathExistsMock.mock.mockImplementation(async () => true)
    detectConfigsMock.mock.mockImplementation(async () => [mockConfig])
    // Reset mock call counts
    pathExistsMock.mock.resetCalls()
    detectConfigsMock.mock.resetCalls()
  })

  describe('loadInstalledConfigs', () => {
    test('debe retornar configuraciones si el directorio existe', async () => {
      const result = await loadInstalledConfigs('/test/dir', mockDeps)

      assert.strictEqual(pathExistsMock.mock.callCount(), 1)
      assert.strictEqual(detectConfigsMock.mock.callCount(), 1)
      assert.strictEqual(result.length, 1)
      assert.strictEqual(result[0], mockConfig)
    })

    test('debe usar process.cwd() si no se pasa directorio', async () => {
      const result = await loadInstalledConfigs(undefined, mockDeps)

      assert.strictEqual(pathExistsMock.mock.callCount(), 1)
      const { calls } = pathExistsMock.mock
      const args = calls[0]?.arguments as unknown[]
      assert.ok(args[0] && typeof args[0] === 'string' && args[0].includes(process.cwd()))
      assert.strictEqual(result.length, 1)
    })

    test('debe retornar array vacío si el directorio no existe', async () => {
      pathExistsMock.mock.mockImplementation(async () => false)

      const result = await loadInstalledConfigs('/test/dir', mockDeps)

      assert.strictEqual(pathExistsMock.mock.callCount(), 1)
      assert.strictEqual(detectConfigsMock.mock.callCount(), 0)
      assert.strictEqual(result.length, 0)
    })
  })
})
