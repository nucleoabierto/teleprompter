/* eslint-disable @typescript-eslint/no-floating-promises */
/* eslint-disable @typescript-eslint/no-empty-function */
import assert from 'node:assert'
import { test, describe, mock } from 'node:test'

import listCommand from '../../src/commands/list.js'
import logger from '../../src/utils/logger.js'

import type { ListDeps } from '../../src/commands/list.js'
import type { DetectedConfig } from '../../src/core/processor.js'

describe('List Command', () => {
  const loadInstalledConfigsMock = mock.fn<() => Promise<DetectedConfig[]>>(async () => [])
  const listCachedReposMock = mock.fn<() => Promise<{
    owner: string
    repo: string
    branch: string
    extractedPath: string
    cachedAt: string
  }[]>>(async () => [])
  const downloadRepoMock = mock.fn<(owner: string, repo: string, branch?: string, useCache?: boolean) => Promise<string>>(async () => '/mock/path')
  const detectConfigsMock = mock.fn<(sourcePath: string) => Promise<DetectedConfig[]>>(async () => [])
  const parseRepoMock = mock.fn<(repoString: string) => { owner: string, repo: string }>((repoString: string) => {
    const [owner, repo] = repoString.split('/')
    return { owner, repo }
  })
  const exitMock = mock.fn((code: number) => {})

  const mockDeps: ListDeps = {
    loadInstalledConfigs: loadInstalledConfigsMock,
    listCachedRepos: listCachedReposMock,
    downloadRepo: downloadRepoMock,
    detectConfigs: detectConfigsMock,
    parseRepo: parseRepoMock,
    exit: exitMock,
  }

  const mockConfig: DetectedConfig = {
    name: 'Test Config',
    slug: 'test-config',
    path: '/mock/path',
    folderName: 'test-config',
    script: {
      description: 'Test description',
      bootstrap: 'echo "Test"',
      criteria: ['criterio A', 'criterio B'],
    },
  }

  test.beforeEach(() => {
    mock.method(logger, 'info', () => {})
    mock.method(logger, 'success', () => {})
    mock.method(logger, 'warning', () => {})
    mock.method(logger, 'error', () => {})
    mock.method(logger, 'plain', () => {})

    loadInstalledConfigsMock.mock.mockImplementation(async () => [])
    listCachedReposMock.mock.mockImplementation(async () => [])
    detectConfigsMock.mock.mockImplementation(async () => [])
  })

  test.afterEach(() => {
    mock.restoreAll()
    // Reset mock call counts for proper isolation
    loadInstalledConfigsMock.mock.resetCalls()
    listCachedReposMock.mock.resetCalls()
    downloadRepoMock.mock.resetCalls()
    detectConfigsMock.mock.resetCalls()
    parseRepoMock.mock.resetCalls()
    exitMock.mock.resetCalls()
  })

  test('debe mostrar mensaje cuando no hay configuraciones', async () => {
    loadInstalledConfigsMock.mock.mockImplementation(async () => [])
    const infoMock = mock.method(logger, 'info', () => {})

    await listCommand(undefined, {}, mockDeps)

    assert.strictEqual(loadInstalledConfigsMock.mock.callCount(), 1)
    assert.strictEqual(infoMock.mock.callCount(), 2)
    const { calls } = infoMock.mock
    assert.ok(calls[0]?.arguments[0]?.includes('No hay configuraciones instaladas'))
    assert.strictEqual(exitMock.mock.callCount(), 0)
  })

  test('debe listar configuraciones instaladas', async () => {
    loadInstalledConfigsMock.mock.mockImplementation(async () => [mockConfig])
    const infoMock = mock.method(logger, 'info', () => {})
    const plainMock = mock.method(logger, 'plain', () => {})

    await listCommand(undefined, {}, mockDeps)

    assert.strictEqual(infoMock.mock.callCount(), 3) // header + blank + config name
    const infoCalls = infoMock.mock.calls
    assert.ok(infoCalls[2]?.arguments[0]?.includes('Test Config'))

    assert.strictEqual(plainMock.mock.callCount(), 3) // description + install instruction + blank line
    const plainCalls = plainMock.mock.calls
    assert.ok(plainCalls[0]?.arguments[0]?.includes('Test description'))
    assert.ok(plainCalls[1]?.arguments[0]?.includes('Ya instalada'))
  })

  test('debe mostrar criterios con opción --criteria', async () => {
    loadInstalledConfigsMock.mock.mockImplementation(async () => [mockConfig])
    const plainMock = mock.method(logger, 'plain', () => {})

    await listCommand(undefined, { criteria: true }, mockDeps)

    // description + install instruction + header criterios + 2 criterios + blank line
    assert.strictEqual(plainMock.mock.callCount(), 6)
    const { calls } = plainMock.mock
    assert.ok(calls[3]?.arguments[0]?.includes('criterio A'))
    assert.ok(calls[4]?.arguments[0]?.includes('criterio B'))
  })

  test('no debe mostrar criterios si config.script.criteria es undefined aunque option sea true', async () => {
    const configUndefinedCriteria: DetectedConfig = {
      ...mockConfig,
      // eslint-disable-next-line secure-coding/no-hardcoded-credentials
      script: { description: 'test', bootstrap: 'test' },
    }
    loadInstalledConfigsMock.mock.mockImplementation(async () => [configUndefinedCriteria])
    const plainMock = mock.method(logger, 'plain', () => {})

    await listCommand(undefined, { criteria: true }, mockDeps)

    assert.strictEqual(plainMock.mock.callCount(), 3) // description + install instruction + blank line
  })

  test('no debe mostrar criterios si options.criteria es false aunque existan', async () => {
    loadInstalledConfigsMock.mock.mockImplementation(async () => [mockConfig])
    const plainMock = mock.method(logger, 'plain', () => {})

    await listCommand(undefined, { criteria: false }, mockDeps)

    // Solo description + install instruction + blank line (no muestra header "Criterios:" ni lista)
    assert.strictEqual(plainMock.mock.callCount(), 3)
  })

  test('no debe mostrar header de criterios si criteria array está vacío', async () => {
    const configSinCriterios: DetectedConfig = {
      ...mockConfig,
      script: { ...mockConfig.script, criteria: [] },
    }
    loadInstalledConfigsMock.mock.mockImplementation(async () => [configSinCriterios])
    const plainMock = mock.method(logger, 'plain', () => {})

    await listCommand(undefined, { criteria: true }, mockDeps)

    // Solo description + install instruction + blank line (no muestra header "Criterios:" ni lista)
    assert.strictEqual(plainMock.mock.callCount(), 3)
  })

  test('debe manejar errores y llamar a process.exit', async () => {
    loadInstalledConfigsMock.mock.mockImplementation(async () => {
      throw new Error('Test error')
    })
    const errorMock = mock.method(logger, 'error', () => {})

    await listCommand(undefined, {}, mockDeps)

    assert.strictEqual(errorMock.mock.callCount(), 1)
    assert.strictEqual(exitMock.mock.callCount(), 1)
    assert.strictEqual(exitMock.mock.calls[0]?.arguments[0], 1)
  })

  // Tests for cached listing mode
  describe('cached listing', () => {
    test('debe mostrar mensaje cuando no hay repositorios en caché', async () => {
      listCachedReposMock.mock.mockImplementation(async () => [])
      const infoMock = mock.method(logger, 'info', () => {})

      await listCommand(undefined, { cached: true }, mockDeps)

      assert.strictEqual(listCachedReposMock.mock.callCount(), 1)
      assert.strictEqual(infoMock.mock.callCount(), 2)
      const { calls } = infoMock.mock
      assert.ok(calls[0]?.arguments[0]?.includes('No hay repositorios en caché'))
    })

    test('debe listar configuraciones desde caché con instrucciones de instalación', async () => {
      listCachedReposMock.mock.mockImplementation(async () => [
        { owner: 'testowner', repo: 'testrepo', branch: 'main', extractedPath: '/cache/repo1', cachedAt: '2024-01-01T00:00:00Z' },
      ])
      detectConfigsMock.mock.mockImplementation(async () => [mockConfig])
      const plainMock = mock.method(logger, 'plain', () => {})

      await listCommand(undefined, { cached: true }, mockDeps)

      assert.strictEqual(listCachedReposMock.mock.callCount(), 1)
      assert.strictEqual(detectConfigsMock.mock.callCount(), 1)

      // Verificar que muestra instrucción de instalación para cache
      const plainCalls = plainMock.mock.calls
      assert.ok(plainCalls[1]?.arguments[0]?.includes('Usa:'))
      assert.ok(plainCalls[1]?.arguments[0]?.includes('testowner/testrepo'))
    })

    test('debe manejar repo en caché sin configuraciones válidas', async () => {
      listCachedReposMock.mock.mockImplementation(async () => [
        { owner: 'emptyowner', repo: 'emptyrepo', branch: 'main', extractedPath: '/cache/empty', cachedAt: '2024-01-01T00:00:00Z' },
      ])
      detectConfigsMock.mock.mockImplementation(async () => [])
      const infoMock = mock.method(logger, 'info', () => {})

      await listCommand(undefined, { cached: true }, mockDeps)

      const infoCalls = infoMock.mock.calls
      assert.ok(infoCalls.some((call) => call.arguments[0]?.includes('(Sin configuraciones válidas)')))
    })

    test('debe manejar múltiples repositorios en caché', async () => {
      listCachedReposMock.mock.mockImplementation(async () => [
        { owner: 'owner1', repo: 'repo1', branch: 'main', extractedPath: '/cache/repo1', cachedAt: '2024-01-01T00:00:00Z' },
        { owner: 'owner2', repo: 'repo2', branch: 'dev', extractedPath: '/cache/repo2', cachedAt: '2024-02-01T00:00:00Z' },
      ])
      detectConfigsMock.mock.mockImplementation(async (path: string) => {
        if (path === '/cache/repo1') return [mockConfig]
        return [{ ...mockConfig, name: 'Config 2', folderName: 'config-2' }]
      })

      await listCommand(undefined, { cached: true }, mockDeps)

      assert.strictEqual(listCachedReposMock.mock.callCount(), 1)
      assert.strictEqual(detectConfigsMock.mock.callCount(), 2)
    })
  })

  // Tests for remote listing mode
  describe('remote listing', () => {
    test('debe usar cache si está disponible para repositorio remoto', async () => {
      listCachedReposMock.mock.mockImplementation(async () => [
        { owner: 'owner', repo: 'repo', branch: 'main', extractedPath: '/cache/repo', cachedAt: '2024-01-01T00:00:00Z' },
      ])
      detectConfigsMock.mock.mockImplementation(async () => [mockConfig])
      const infoMock = mock.method(logger, 'info', () => {})

      await listCommand('owner/repo', { branch: 'main', cache: true }, mockDeps)

      assert.strictEqual(listCachedReposMock.mock.callCount(), 1)
      assert.strictEqual(downloadRepoMock.mock.callCount(), 0) // No debe descargar
      assert.strictEqual(detectConfigsMock.mock.callCount(), 1)

      const infoCalls = infoMock.mock.calls
      assert.ok(infoCalls[0]?.arguments[0]?.includes('Usando repositorio en caché'))
    })

    test('debe descargar si no está en cache', async () => {
      listCachedReposMock.mock.mockImplementation(async () => [])
      downloadRepoMock.mock.mockImplementation(async () => '/downloaded/path')
      detectConfigsMock.mock.mockImplementation(async () => [mockConfig])

      await listCommand('owner/repo', { branch: 'main', cache: true }, mockDeps)

      assert.strictEqual(listCachedReposMock.mock.callCount(), 1)
      assert.strictEqual(downloadRepoMock.mock.callCount(), 1)
      assert.strictEqual(detectConfigsMock.mock.callCount(), 1)

      const { calls } = downloadRepoMock.mock
      assert.strictEqual(calls[0]?.arguments[0], 'owner')
      assert.strictEqual(calls[0]?.arguments[1], 'repo')
      assert.strictEqual(calls[0]?.arguments[2], 'main')
    })

    test('debe salir con error si no hay configuraciones válidas en repositorio remoto', async () => {
      listCachedReposMock.mock.mockImplementation(async () => [])
      downloadRepoMock.mock.mockImplementation(async () => '/downloaded/path')
      detectConfigsMock.mock.mockImplementation(async () => [])

      await listCommand('owner/repo', { branch: 'main', cache: true }, mockDeps)

      assert.strictEqual(exitMock.mock.callCount(), 1)
      assert.strictEqual(exitMock.mock.calls[0]?.arguments[0], 1)
    })

    test('debe pasar branch correctamente', async () => {
      listCachedReposMock.mock.mockImplementation(async () => [])
      downloadRepoMock.mock.mockImplementation(async () => '/downloaded/path')
      detectConfigsMock.mock.mockImplementation(async () => [mockConfig])

      await listCommand('owner/repo', { branch: 'dev', cache: true }, mockDeps)

      const { calls } = downloadRepoMock.mock
      assert.strictEqual(calls[0]?.arguments[2], 'dev')
    })

    test('debe mostrar instrucción de instalación para repositorio remoto', async () => {
      listCachedReposMock.mock.mockImplementation(async () => [])
      downloadRepoMock.mock.mockImplementation(async () => '/downloaded/path')
      detectConfigsMock.mock.mockImplementation(async () => [mockConfig])
      const plainMock = mock.method(logger, 'plain', () => {})

      await listCommand('owner/repo', { branch: 'main', cache: true }, mockDeps)

      const plainCalls = plainMock.mock.calls
      assert.ok(plainCalls[1]?.arguments[0]?.includes('Usa:'))
      assert.ok(plainCalls[1]?.arguments[0]?.includes('owner/repo'))
      assert.ok(plainCalls[1]?.arguments[0]?.includes('Test Config'))
    })

    test('debe manejar error de descarga en listado remoto', async () => {
      listCachedReposMock.mock.mockImplementation(async () => [])
      downloadRepoMock.mock.mockImplementation(async () => {
        throw new Error('Network error')
      })
      const errorMock = mock.method(logger, 'error', () => {})

      await listCommand('owner/repo', { branch: 'main', cache: true }, mockDeps)

      assert.strictEqual(errorMock.mock.callCount(), 1)
      const errorCalls = errorMock.mock.calls
      assert.ok(errorCalls[0]?.arguments[0]?.includes('Error al listar configuraciones remotas'))
      assert.strictEqual(exitMock.mock.callCount(), 1)
      assert.strictEqual(exitMock.mock.calls[0]?.arguments[0], 1)
    })
  })

  // Tests for error handling
  describe('error handling', () => {
    test('debe manejar errores en listado desde cache', async () => {
      listCachedReposMock.mock.mockImplementation(async () => {
        throw new Error('Cache error')
      })
      const errorMock = mock.method(logger, 'error', () => {})

      await listCommand(undefined, { cached: true }, mockDeps)

      assert.strictEqual(errorMock.mock.callCount(), 1)
      assert.strictEqual(exitMock.mock.callCount(), 1)
      assert.strictEqual(exitMock.mock.calls[0]?.arguments[0], 1)
    })
  })
})
