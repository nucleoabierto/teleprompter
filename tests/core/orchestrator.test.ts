/* eslint-disable @typescript-eslint/no-floating-promises */
/* eslint-disable @typescript-eslint/no-empty-function */
import assert from 'node:assert'
import { test, describe, mock } from 'node:test'

import * as orchestrator from '../../src/core/orchestrator.js'
import logger from '../../src/utils/logger.js'

import type { OrchestratorDeps } from '../../src/core/orchestrator.js'
import type { DetectedConfig } from '../../src/core/processor.js'

describe('Orchestrator', () => {
  const mockConfig: DetectedConfig = {
    name: 'Test Config',
    slug: 'test-config',
    path: '/mock/path',
    folderName: 'test-config',
    script: { description: 'Test description', bootstrap: 'echo "Test"' },
  }

  const removeMock = mock.fn(async () => {})
  const detectConfigsMock = mock.fn(async () => [mockConfig])
  const copyConfigMock = mock.fn(async () => {})
  const downloadRepoMock = mock.fn(async () => '/tmp/mock-repo')
  const selectConfigMock = mock.fn(async () => mockConfig)
  const confirmInstallationMock = mock.fn(async () => true)

  const mockDeps: OrchestratorDeps = {
    remove: removeMock,
    detectConfigs: detectConfigsMock,
    copyConfig: copyConfigMock,
    downloadRepo: downloadRepoMock,
    selectConfig: selectConfigMock,
    confirmInstallation: confirmInstallationMock,
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
    // Reset mock call counts for proper isolation
    removeMock.mock.resetCalls()
    detectConfigsMock.mock.resetCalls()
    copyConfigMock.mock.resetCalls()
    downloadRepoMock.mock.resetCalls()
    selectConfigMock.mock.resetCalls()
    confirmInstallationMock.mock.resetCalls()
  })

  describe('selectConfig', () => {
    test('debe fallar si no hay configuraciones', async () => {
      const { selectConfig } = await import('../../src/utils/prompts.js')
      await assert.rejects(
        async () => await selectConfig([]),
        /No hay configuraciones válidas disponibles/
      )
    })
  })

  describe('installConfiguration', () => {
    test('debe fallar si no hay configuraciones en el repo remoto', async () => {
      const deps = { ...mockDeps, detectConfigs: mock.fn(async () => []) }

      await assert.rejects(
        async () => await orchestrator.installConfiguration('owner/repo', {}, deps),
        /No se encontraron configuraciones válidas en el repositorio/
      )
    })

    test('debe instalar configuración única de repo remoto', async () => {
      const deps = {
        ...mockDeps,
        detectConfigs: mock.fn(async () => [mockConfig]),
        copyConfig: mock.fn(async () => {}),
        remove: mock.fn(async () => {}),
      }

      await orchestrator.installConfiguration('owner/repo', {}, deps)

      assert.strictEqual(deps.copyConfig.mock.callCount(), 1)
      assert.strictEqual(deps.remove.mock.callCount(), 1)
    })

    test('debe instalar múltiples configuraciones de repo remoto con confirmación', async () => {
      const configs = [mockConfig, { ...mockConfig, name: 'Config 2', slug: 'config-2', folderName: 'config-2' }]
      const deps = {
        ...mockDeps,
        detectConfigs: mock.fn(async () => configs),
        copyConfig: mock.fn(async () => {}),
        remove: mock.fn(async () => {}),
        confirmInstallation: mock.fn(async () => true),
      }

      await orchestrator.installConfiguration('owner/repo', {}, deps)

      assert.strictEqual(deps.confirmInstallation.mock.callCount(), 1)
      assert.strictEqual(deps.copyConfig.mock.callCount(), 2)
      assert.strictEqual(deps.remove.mock.callCount(), 1)
    })

    test('debe fallar si no hay configuraciones locales', async () => {
      const deps = { ...mockDeps, detectConfigs: mock.fn(async () => []) }

      await assert.rejects(
        async () => await orchestrator.installConfiguration(undefined, {}, deps),
        /No se encontraron configuraciones locales/
      )
    })

    test('debe instalar configuración local única sin preguntar', async () => {
      const deps = {
        ...mockDeps,
        detectConfigs: mock.fn(async () => [mockConfig]),
        copyConfig: mock.fn(async () => {}),
      }

      await orchestrator.installConfiguration(undefined, {}, deps)

      assert.strictEqual((deps.selectConfig as unknown as { mock: { callCount: () => number } }).mock.callCount(), 0)
      assert.strictEqual(deps.copyConfig.mock.callCount(), 1)
    })

    test('debe permitir seleccionar entre múltiples configuraciones locales con --select', async () => {
      const configs = [mockConfig, { ...mockConfig, name: 'Config 2', slug: 'config-2', folderName: 'config-2' }]
      const deps = {
        ...mockDeps,
        detectConfigs: mock.fn(async () => configs),
        copyConfig: mock.fn(async () => {}),
        selectConfig: mock.fn(async () => configs[1]),
        confirmInstallation: mock.fn(async () => true),
      }

      await orchestrator.installConfiguration(undefined, { select: true }, deps)

      assert.strictEqual(deps.selectConfig.mock.callCount(), 1)
      assert.strictEqual(deps.copyConfig.mock.callCount(), 1)
    })

    test('debe filtrar configuraciones por nombre con --config', async () => {
      const configs = [
        mockConfig,
        { ...mockConfig, name: 'Agents Config', slug: 'agents-config', folderName: 'agents-config' },
        { ...mockConfig, name: 'Basic Config', slug: 'basic-config', folderName: 'basic-config' },
      ]
      const copyConfigMock = mock.fn(async () => {})
      const deps = {
        ...mockDeps,
        detectConfigs: mock.fn(async () => configs),
        copyConfig: copyConfigMock,
        confirmInstallation: mock.fn(async () => true),
      }

      await orchestrator.installConfiguration(undefined, { config: 'agents' }, deps)

      // Solo debe instalar la que coincide con 'agents'
      assert.strictEqual(copyConfigMock.mock.callCount(), 1)
    })

    test('debe lanzar error si filtro no coincide con ninguna config', async () => {
      const configs = [mockConfig]
      const deps = {
        ...mockDeps,
        detectConfigs: mock.fn(async () => configs),
      }

      await assert.rejects(
        async () => await orchestrator.installConfiguration(undefined, { config: 'nonexistent' }, deps),
        /No se encontraron configuraciones que coincidan/
      )
    })

    test('debe cancelar instalación si usuario responde no', async () => {
      const confirmInstallationMock = mock.fn(async () => false)
      const copyConfigMock = mock.fn(async () => {})
      const deps = {
        ...mockDeps,
        detectConfigs: mock.fn(async () => [mockConfig]),
        confirmInstallation: confirmInstallationMock,
        copyConfig: copyConfigMock,
      }

      await orchestrator.installConfiguration(undefined, {}, deps)

      assert.strictEqual(confirmInstallationMock.mock.callCount(), 1)
      assert.strictEqual(copyConfigMock.mock.callCount(), 0)
    })

    test('debe propagar errores correctamente', async () => {
      const deps = {
        ...mockDeps,
        downloadRepo: mock.fn(async () => {
          throw new Error('Download failed')
        }),
      }

      await assert.rejects(
        async () => await orchestrator.installConfiguration('owner/repo', {}, deps),
        /Download failed/
      )
    })
  })
})
