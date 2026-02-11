/* eslint-disable @typescript-eslint/no-floating-promises */
/* eslint-disable @typescript-eslint/no-empty-function */
import assert from 'node:assert'
import { describe, test, mock } from 'node:test'
import os from 'os'
import path from 'path'

import fs from 'fs-extra'

import { copyConfig } from '../../src/core/installer.js'

import type { InstallerDeps } from '../../src/core/installer.js'

describe('Installer', () => {
  let tempDir: string
  let sourceDir: string
  let targetDir: string

  const pathExistsMock = mock.fn(async () => false)
  const removeMock = mock.fn(async () => {})
  const ensureDirMock = mock.fn(async () => {})
  const copyMock = mock.fn(async () => {})

  const mockDeps: InstallerDeps = {
    pathExists: pathExistsMock,
    remove: removeMock,
    ensureDir: ensureDirMock,
    copy: copyMock,
  }

  test.before(async () => {
    tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'teleprompter-test-'))
    sourceDir = path.join(tempDir, 'source')
    targetDir = path.join(tempDir, 'target')

    // Create source configuration
    await fs.ensureDir(sourceDir)
    await fs.writeFile(
      path.join(sourceDir, 'script.yaml'),
      'name: Test Config\ndescription: Test configuration\nbootstrap: Instructions\n'
    )
    await fs.ensureDir(path.join(sourceDir, 'scaffolding'))
    await fs.writeFile(path.join(sourceDir, 'scaffolding', 'README.md'), '# README')
  })

  test.after(async () => {
    await fs.remove(tempDir)
  })

  test.afterEach(() => {
    mock.restoreAll()
    // Resetear el mock sin restoreContext para node:test
    pathExistsMock.mock.mockImplementation(async () => false)
    // Reset mock call counts
    pathExistsMock.mock.resetCalls()
    removeMock.mock.resetCalls()
    ensureDirMock.mock.resetCalls()
    copyMock.mock.resetCalls()
  })

  describe('copyConfig', () => {
    test('debe copiar configuración correctamente si no existe', async () => {
      await copyConfig(sourceDir, path.join(targetDir, 'copied'), false, mockDeps)

      assert.strictEqual(pathExistsMock.mock.callCount(), 1)
      assert.strictEqual(ensureDirMock.mock.callCount(), 1)
      assert.strictEqual(copyMock.mock.callCount(), 1)
      assert.strictEqual(removeMock.mock.callCount(), 0)
    })

    test('debe lanzar error si la configuración ya existe y no se usa force', async () => {
      pathExistsMock.mock.mockImplementationOnce(async () => true)

      await assert.rejects(
        async () => await copyConfig(sourceDir, path.join(targetDir, 'existing'), false, mockDeps),
        /La configuración ya existe en .*\. Use --force para sobrescribir\./
      )

      assert.strictEqual(ensureDirMock.mock.callCount(), 0)
      assert.strictEqual(copyMock.mock.callCount(), 0)
    })

    test('debe sobrescribir si la configuración existe y se usa force', async () => {
      pathExistsMock.mock.mockImplementationOnce(async () => true)

      await copyConfig(sourceDir, path.join(targetDir, 'overwrite'), true, mockDeps)

      assert.strictEqual(pathExistsMock.mock.callCount(), 1)
      assert.strictEqual(removeMock.mock.callCount(), 1)
      assert.strictEqual(ensureDirMock.mock.callCount(), 1)
      assert.strictEqual(copyMock.mock.callCount(), 1)
    })

    test('debe propagar errores del sistema de archivos', async () => {
      pathExistsMock.mock.mockImplementationOnce(async () => {
        throw new Error('Permiso denegado')
      })

      await assert.rejects(
        async () => await copyConfig(sourceDir, path.join(targetDir, 'error'), false, mockDeps),
        /Permiso denegado/
      )
    })

    test('debe crear directorio padre si no existe', async () => {
      const deepTarget = path.join(targetDir, 'nested', 'deep', 'config')

      await copyConfig(sourceDir, deepTarget, false, mockDeps)

      assert.strictEqual(ensureDirMock.mock.callCount(), 1)
      const { calls } = ensureDirMock.mock
      assert.ok(calls.length > 0)
      const args = calls[0]?.arguments as unknown[]
      assert.ok(args[0] && typeof args[0] === 'string' && args[0].includes('nested/deep'))
    })
  })
})
