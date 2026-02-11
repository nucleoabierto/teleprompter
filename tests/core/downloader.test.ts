/* eslint-disable @typescript-eslint/no-floating-promises */
/* eslint-disable @typescript-eslint/no-empty-function */
import assert from 'node:assert'
import { test, describe, mock } from 'node:test'

import downloadRepo, { isCacheValid } from '../../src/core/downloader.js'

import type { DownloaderDeps } from '../../src/core/downloader.js'

describe('Downloader', () => {
  const mkdtempMock = mock.fn(async () => '/tmp/teleprompter-test-123')
  const writeFileMock = mock.fn(async () => {})
  const removeMock = mock.fn(async () => {})
  const extractMock = mock.fn(async () => {})

  // Mock fetch that handles both HEAD (cache check) and GET (download) requests
  const fetchMock = mock.fn(async (_url: string, init?: RequestInit) => {
    const method = init?.method ?? 'GET'

    if (method === 'HEAD') {
      // Return ETag for cache validation
      return new Response(undefined, {
        status: 200,
        headers: { etag: '"abc123"' },
      })
    }

    // Return tarball for download
    return new Response(new ArrayBuffer(0), { status: 200, headers: { etag: '"abc123"' } })
  })

  const getCachedRepoMock = mock.fn(async () => undefined)
  const saveToCacheMock = mock.fn(async () => {})

  const mockDeps: DownloaderDeps = {
    mkdtemp: mkdtempMock,
    writeFile: writeFileMock,
    remove: removeMock,
    extract: extractMock,
    fetch: fetchMock,
    getCachedRepo: getCachedRepoMock,
    saveToCache: saveToCacheMock,
  }

  test.afterEach(() => {
    mock.restoreAll()
    // Reset mock call counts
    mkdtempMock.mock.resetCalls()
    writeFileMock.mock.resetCalls()
    removeMock.mock.resetCalls()
    extractMock.mock.resetCalls()
    fetchMock.mock.resetCalls()
    getCachedRepoMock.mock.resetCalls()
    saveToCacheMock.mock.resetCalls()
  })

  describe('isCacheValid', () => {
    test('debe retornar true cuando ETag coincide', async () => {
      const fetchWithMatchingEtag = mock.fn(async () =>
        new Response(undefined, { status: 200, headers: { etag: '"abc123"' } })
      )

      const result = await isCacheValid('owner', 'repo', 'main', '"abc123"', fetchWithMatchingEtag)

      assert.strictEqual(result, true)
      assert.strictEqual(fetchWithMatchingEtag.mock.callCount(), 1)
    })

    test('debe retornar false cuando ETag no coincide', async () => {
      const fetchWithDifferentEtag = mock.fn(async () =>
        new Response(undefined, { status: 200, headers: { etag: '"xyz789"' } })
      )

      const result = await isCacheValid('owner', 'repo', 'main', '"abc123"', fetchWithDifferentEtag)

      assert.strictEqual(result, false)
    })

    test('debe retornar false cuando HEAD retorna error 500', async () => {
      const fetchWithError = mock.fn(async () =>
        new Response(undefined, { status: 500 })
      )

      const result = await isCacheValid('owner', 'repo', 'main', '"abc123"', fetchWithError)

      assert.strictEqual(result, false)
    })

    test('debe retornar false cuando HEAD retorna 404', async () => {
      const fetchWith404 = mock.fn(async () =>
        new Response(undefined, { status: 404 })
      )

      const result = await isCacheValid('owner', 'repo', 'main', '"abc123"', fetchWith404)

      assert.strictEqual(result, false)
    })

    test('debe retornar false cuando fetch lanza excepción', async () => {
      const fetchWithException = mock.fn(async () => {
        throw new Error('Network error')
      })

      const result = await isCacheValid('owner', 'repo', 'main', '"abc123"', fetchWithException)

      assert.strictEqual(result, false)
    })

    test('debe manejar ETag con mayúsculas (ETag header)', async () => {
      const fetchWithUpperCaseEtag = mock.fn(async () =>
        new Response(undefined, { status: 200, headers: { ETag: '"abc123"' } })
      )

      const result = await isCacheValid('owner', 'repo', 'main', '"abc123"', fetchWithUpperCaseEtag)

      assert.strictEqual(result, true)
    })

    test('debe retornar false cuando no hay ETag en respuesta', async () => {
      const fetchWithoutEtag = mock.fn(async () =>
        new Response(undefined, { status: 200 })
      )

      const result = await isCacheValid('owner', 'repo', 'main', '"abc123"', fetchWithoutEtag)

      assert.strictEqual(result, false)
    })
  })

  describe('downloadRepo', () => {
    test('debe lanzar error de red al fallar el fetch', async () => {
      const fetchErrorMock = mock.fn(async () => new Response(undefined, { status: 404, statusText: 'Not Found' }))
      const deps = {
        ...mockDeps,
        fetch: fetchErrorMock,
      }

      await assert.rejects(
        async () => await downloadRepo('nonexistent', 'repo', 'main', true, deps),
        /Error al descargar: 404/
      )
    })

    test('debe manejar caché cuando ETag es "unknown"', async () => {
      const cachedPath = '/cached/extracted/path'
      const getCachedRepoHitMock = mock.fn(async () => ({
        tarballPath: '/cached/repo.tar.gz',
        extractedPath: cachedPath,
        metadata: {
          owner: 'owner',
          repo: 'repo',
          branch: 'main',
          etag: '"abc123"',
          cachedAt: '2024-01-01T00:00:00Z',
        },
      }))

      // Mock fetch that returns ETag in lowercase 'etag' header
      const fetchWithLowerCaseEtag = mock.fn(async (_url: string, init?: RequestInit) => {
        const method = init?.method ?? 'GET'
        if (method === 'HEAD') {
          return new Response(undefined, { status: 200, headers: { etag: '"abc123"' } })
        }
        return new Response(new ArrayBuffer(0), { status: 200, headers: { etag: '"abc123"' } })
      })

      const deps = {
        ...mockDeps,
        getCachedRepo: getCachedRepoHitMock,
        fetch: fetchWithLowerCaseEtag,
      }

      const result = await downloadRepo('owner', 'repo', 'main', true, deps)

      // Should use cache since ETag matches
      assert.strictEqual(result, cachedPath)
    })

    test('debe usar caché cuando isCacheValid retorna true', async () => {
      const cachedPath = '/cached/extracted/path'
      const getCachedRepoHitMock = mock.fn(async () => ({
        tarballPath: '/cached/repo.tar.gz',
        extractedPath: cachedPath,
        metadata: {
          owner: 'owner',
          repo: 'repo',
          branch: 'main',
          etag: '"abc123"',
          cachedAt: '2024-01-01T00:00:00Z',
        },
      }))

      // Mock fetch para HEAD que retorna ETag coincidente
      const fetchWithCacheHit = mock.fn(async (_url: string, init?: RequestInit) => {
        const method = init?.method ?? 'GET'
        if (method === 'HEAD') {
          return new Response(undefined, { status: 200, headers: { etag: '"abc123"' } })
        }
        return new Response(new ArrayBuffer(0), { status: 200 })
      })

      const deps = {
        ...mockDeps,
        getCachedRepo: getCachedRepoHitMock,
        fetch: fetchWithCacheHit,
      }

      const result = await downloadRepo('owner', 'repo', 'main', true, deps)

      assert.strictEqual(result, cachedPath)
      // HEAD request para validar
      assert.strictEqual(fetchWithCacheHit.mock.callCount(), 1)
      // No debe descargar
      assert.strictEqual(writeFileMock.mock.callCount(), 0)
      assert.strictEqual(extractMock.mock.callCount(), 0)
    })

    test('debe descargar cuando isCacheValid retorna false (cache stale)', async () => {
      const cachedPath = '/cached/extracted/path'
      const getCachedRepoStaleMock = mock.fn(async () => ({
        tarballPath: '/cached/repo.tar.gz',
        extractedPath: cachedPath,
        metadata: {
          owner: 'owner',
          repo: 'repo',
          branch: 'main',
          etag: '"old-etag"',
          cachedAt: '2024-01-01T00:00:00Z',
        },
      }))

      // Mock fetch: HEAD retorna ETag diferente, GET retorna nuevo tarball
      const fetchWithCacheStale = mock.fn(async (_url: string, init?: RequestInit) => {
        const method = init?.method ?? 'GET'
        if (method === 'HEAD') {
          return new Response(undefined, { status: 200, headers: { etag: '"new-etag"' } })
        }
        return new Response(new ArrayBuffer(0), { status: 200, headers: { etag: '"new-etag"' } })
      })

      const deps = {
        ...mockDeps,
        getCachedRepo: getCachedRepoStaleMock,
        fetch: fetchWithCacheStale,
      }

      const result = await downloadRepo('owner', 'repo', 'main', true, deps)

      // Descarga nueva versión (diferente path)
      assert.notStrictEqual(result, cachedPath)
      assert.strictEqual(result.includes('/tmp/teleprompter-'), true)
      // HEAD + GET
      assert.strictEqual(fetchWithCacheStale.mock.callCount(), 2)
      assert.strictEqual(writeFileMock.mock.callCount(), 1)
      assert.strictEqual(extractMock.mock.callCount(), 1)
    })

    test('debe crear directorio temporal y extraer tarball', async () => {
      const result = await downloadRepo('owner', 'repo', 'main', true, mockDeps)

      assert.strictEqual(result.includes('/tmp/teleprompter-'), true)
      assert.strictEqual(mkdtempMock.mock.callCount(), 1)
      assert.strictEqual(writeFileMock.mock.callCount(), 1)
      assert.strictEqual(extractMock.mock.callCount(), 1)
      assert.strictEqual(removeMock.mock.callCount(), 1)
    })

    test('debe usar rama personalizada', async () => {
      await downloadRepo('owner', 'repo', 'dev', true, mockDeps)

      const { calls } = fetchMock.mock
      assert.ok(calls.length > 0)
      // Check that the URL includes 'dev' in one of the calls
      const urlCalls = calls.filter((c) => {
        const args = c.arguments as unknown[]
        return args[0] && typeof args[0] === 'string' && args[0].includes('dev')
      })
      assert.ok(urlCalls.length > 0, 'Should have called fetch with dev branch')
    })
  })
})
