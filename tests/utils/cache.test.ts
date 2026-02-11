/* eslint-disable @typescript-eslint/no-floating-promises */
/* eslint-disable @typescript-eslint/no-explicit-any */
import assert from 'node:assert'
import { test, describe, mock } from 'node:test'

import {
  getCacheDir,
  getCachedRepo,
  saveToCache,
  clearCacheEntry,
  clearAllCache,
  getCacheStats,
  listCachedRepos,
} from '../../src/utils/cache.js'

describe('Cache', () => {
  describe('getCacheDir', () => {
    test('debe retornar un path válido', () => {
      const cacheDir = getCacheDir()
      assert.strictEqual(typeof cacheDir, 'string')
      assert.ok(cacheDir.includes('teleprompter'))
    })
  })

  describe('getCachedRepo', () => {
    test('debe retornar undefined si no existe metadata', async () => {
      const mockDeps = {
        pathExists: mock.fn(async () => false),
        readJson: mock.fn(async () => ({})),
        remove: mock.fn(async () => {
          // Mock implementation - no operation needed
        }),
      }

      const result = await getCachedRepo('owner', 'repo', 'main', mockDeps as any)

      assert.strictEqual(result, undefined)
    })

    test('debe retornar entry válido si existe caché', async () => {
      const mockMetadata = {
        owner: 'owner',
        repo: 'repo',
        branch: 'main',
        etag: '"abc123"',
        cachedAt: '2024-01-01T00:00:00Z',
      }

      const mockDeps = {
        pathExists: mock.fn(async () => true),
        readJson: mock.fn(async () => mockMetadata),
        remove: mock.fn(async () => {
          // Mock implementation - no operation needed
        }),
      }

      const result = await getCachedRepo('owner', 'repo', 'main', mockDeps as any)

      assert.ok(result !== undefined)
      assert.strictEqual(result?.metadata.etag, '"abc123"')
      assert.strictEqual(result?.metadata.owner, 'owner')
    })

    test('debe retornar undefined si metadata es inválida', async () => {
      const mockDeps = {
        pathExists: mock.fn(async () => true),
        readJson: mock.fn(async () => ({ invalid: true })),
        remove: mock.fn(async () => {
          // Mock implementation - no operation needed
        }),
      }

      const result = await getCachedRepo('owner', 'repo', 'main', mockDeps as any)

      assert.strictEqual(result, undefined)
    })

    test('debe retornar undefined si no existe directorio extraído (solo metadata)', async () => {
      let callCount = 0
      const mockPathExists = mock.fn(async () => {
        callCount++
        // Primera llamada: metadata existe, segunda: directorio no existe
        return callCount === 1
      })
      const mockRemove = mock.fn(async () => {
        // Mock implementation - no operation needed
      })

      const mockDeps = {
        pathExists: mockPathExists,
        readJson: mock.fn(async () => ({})),
        remove: mockRemove,
      }

      const result = await getCachedRepo('owner', 'repo', 'main', mockDeps as any)

      assert.strictEqual(result, undefined)
      // Debe intentar limpiar metadata stale
      assert.strictEqual(mockRemove.mock.callCount(), 1)
    })

    test('debe retornar undefined si metadata no tiene etag', async () => {
      const mockDeps = {
        pathExists: mock.fn(async () => true),
        readJson: mock.fn(async () => ({
          owner: 'owner',
          repo: 'repo',
          branch: 'main',
          // Sin etag
          cachedAt: '2024-01-01T00:00:00Z',
        })),
        remove: mock.fn(async () => {
          // Mock implementation - no operation needed
        }),
      }

      const result = await getCachedRepo('owner', 'repo', 'main', mockDeps as any)

      assert.strictEqual(result, undefined)
    })

    test('debe retornar undefined si metadata no tiene cachedAt', async () => {
      const mockDeps = {
        pathExists: mock.fn(async () => true),
        readJson: mock.fn(async () => ({
          owner: 'owner',
          repo: 'repo',
          branch: 'main',
          etag: '"abc123"',
          // Sin cachedAt
        })),
        remove: mock.fn(async () => {
          // Mock implementation - no operation needed
        }),
      }

      const result = await getCachedRepo('owner', 'repo', 'main', mockDeps as any)

      assert.strictEqual(result, undefined)
    })

    test('debe manejar errores gracefully', async () => {
      const mockDeps = {
        pathExists: mock.fn(async () => {
          throw new Error('System error')
        }),
        readJson: mock.fn(async () => ({})),
        remove: mock.fn(async () => {
          // Mock implementation - no operation needed
        }),
      }

      const result = await getCachedRepo('owner', 'repo', 'main', mockDeps as any)

      assert.strictEqual(result, undefined)
    })
  })

  describe('saveToCache', () => {
    test('debe guardar metadata correctamente', async () => {
      const mockWriteJson = mock.fn(async () => {
        // Mock implementation - no operation needed
      })
      const mockDeps = {
        ensureDir: mock.fn(async () => {
          // Mock implementation - no operation needed
        }),
        writeJson: mockWriteJson,
      }

      await saveToCache('owner', 'repo', 'main', '/extracted/path', '"abc123"', 'commit-sha', mockDeps as any)

      assert.strictEqual(mockWriteJson.mock.callCount(), 1)

      const call = mockWriteJson.mock.calls[0] as any
      assert.ok(call)
      assert.strictEqual(call.arguments[1].owner, 'owner')
      assert.strictEqual(call.arguments[1].repo, 'repo')
      assert.strictEqual(call.arguments[1].etag, '"abc123"')
    })
  })

  describe('clearCacheEntry', () => {
    test('debe eliminar metadata y directorio', async () => {
      const mockRemove = mock.fn(async () => {
        // Mock implementation - no operation needed
      })
      const mockDeps = {
        remove: mockRemove,
      }

      await clearCacheEntry('owner-repo-main', mockDeps as any)

      assert.strictEqual(mockRemove.mock.callCount(), 2)
    })

    test('debe manejar errores de eliminación gracefully', async () => {
      const mockDeps = {
        remove: mock.fn(async () => {
          throw new Error('Permission denied')
        }),
      }

      await clearCacheEntry('owner-repo-main', mockDeps as any)
    })
  })

  describe('clearAllCache', () => {
    test('debe retornar 0 si no existe directorio de caché', async () => {
      const mockDeps = {
        pathExists: mock.fn(async () => false),
        readdir: mock.fn(async () => []),
        remove: mock.fn(async () => {
          // Mock implementation - no operation needed
        }),
      }

      const result = await clearAllCache(mockDeps as any)

      assert.strictEqual(result, 0)
    })

    test('debe limpiar todas las entradas', async () => {
      const mockRemove = mock.fn(async () => {
        // Mock implementation - no operation needed
      })
      const mockDeps = {
        pathExists: mock.fn(async () => true),
        readdir: mock.fn(async () => ['file1.json', 'file2.tar.gz', 'dir1']),
        remove: mockRemove,
      }

      const result = await clearAllCache(mockDeps as any)

      assert.strictEqual(result, 3)
      assert.strictEqual(mockRemove.mock.callCount(), 3)
    })
  })

  describe('getCacheStats', () => {
    test('debe retornar stats vacías si no existe caché', async () => {
      const mockDeps = {
        pathExists: mock.fn(async () => false),
        readdir: mock.fn(async () => []),
        readJson: mock.fn(async () => ({})),
      }

      const result = await getCacheStats(mockDeps as any)

      assert.strictEqual(result.entryCount, 0)
      assert.strictEqual(result.entries.length, 0)
    })

    test('debe retornar stats con entradas válidas', async () => {
      const mockReadJson = mock.fn(async () => {
        return {
          cachedAt: '2024-01-01T00:00:00Z',
          etag: '"some-etag"',
        }
      })

      const mockDeps = {
        pathExists: mock.fn(async () => true),
        readdir: mock.fn(async () => ['entry1.json', 'entry2.json', 'invalid.txt']),
        readJson: mockReadJson,
      }

      const result = await getCacheStats(mockDeps as any)

      assert.strictEqual(result.entryCount, 2)
      assert.strictEqual(result.entries.length, 2)
    })

    test('debe ignorar entradas inválidas en stats', async () => {
      let callCount = 0
      const mockReadJson = mock.fn(async () => {
        callCount++
        if (callCount === 1) {
          return { cachedAt: '2024-01-01T00:00:00Z', etag: '"valid"' }
        }
        throw new Error('Invalid JSON')
      })

      const mockDeps = {
        pathExists: mock.fn(async () => true),
        readdir: mock.fn(async () => ['valid.json', 'invalid.json']),
        readJson: mockReadJson,
      }

      const result = await getCacheStats(mockDeps as any)

      assert.strictEqual(result.entryCount, 1)
    })
  })

  describe('listCachedRepos', () => {
    test('debe retornar array vacío si no existe directorio de caché', async () => {
      const mockDeps = {
        pathExists: mock.fn(async () => false),
        readdir: mock.fn(async () => []),
        readJson: mock.fn(async () => ({})),
      }

      const result = await listCachedRepos(mockDeps as any)

      assert.strictEqual(result.length, 0)
    })

    test('debe listar repositorios en caché válidos', async () => {
      const mockMetadata = {
        owner: 'testowner',
        repo: 'testrepo',
        branch: 'main',
        etag: '"abc123"',
        cachedAt: '2024-01-01T00:00:00Z',
      }

      let pathExistsCallCount = 0
      const mockDeps = {
        pathExists: mock.fn(async () => {
          pathExistsCallCount++
          // Directorio de caché existe, luego el directorio extraído existe
          return pathExistsCallCount <= 2
        }),
        readdir: mock.fn(async () => ['testowner-testrepo-main.json']),
        readJson: mock.fn(async () => mockMetadata),
      }

      const result = await listCachedRepos(mockDeps as any)

      assert.strictEqual(result.length, 1)
      assert.strictEqual(result[0]?.owner, 'testowner')
      assert.strictEqual(result[0]?.repo, 'testrepo')
      assert.strictEqual(result[0]?.branch, 'main')
    })

    test('debe ignorar archivos que no son metadata', async () => {
      const mockDeps = {
        pathExists: mock.fn(async () => true),
        readdir: mock.fn(async () => ['entry1.json', 'entry2.tar.gz', 'entry3']),
        readJson: mock.fn(async () => ({
          owner: 'owner',
          repo: 'repo',
          branch: 'main',
          etag: '"abc"',
          cachedAt: '2024-01-01T00:00:00Z',
        })),
      }

      const result = await listCachedRepos(mockDeps as any)

      // Solo entry1.json es metadata válida
      assert.strictEqual(result.length, 1)
    })

    test('debe saltar repositorios con directorio extraído inexistente', async () => {
      let pathExistsCallCount = 0
      const mockDeps = {
        pathExists: mock.fn(async () => {
          pathExistsCallCount++
          // Primera llamada: caché existe, segunda: directorio no existe
          return pathExistsCallCount === 1
        }),
        readdir: mock.fn(async () => ['owner-repo-main.json']),
        readJson: mock.fn(async () => ({
          owner: 'owner',
          repo: 'repo',
          branch: 'main',
          etag: '"abc"',
          cachedAt: '2024-01-01T00:00:00Z',
        })),
      }

      const result = await listCachedRepos(mockDeps as any)

      assert.strictEqual(result.length, 0)
    })

    test('debe ignorar metadata inválida gracefully', async () => {
      const mockDeps = {
        pathExists: mock.fn(async () => true),
        readdir: mock.fn(async () => ['valid.json', 'invalid.json']),
        readJson: mock.fn(async (path: string) => {
          if (path.includes('invalid')) {
            throw new Error('Invalid JSON')
          }
          return {
            owner: 'owner',
            repo: 'repo',
            branch: 'main',
            etag: '"abc"',
            cachedAt: '2024-01-01T00:00:00Z',
          }
        }),
      }

      const result = await listCachedRepos(mockDeps as any)

      // Solo el válido debe estar presente
      assert.strictEqual(result.length, 1)
      assert.strictEqual(result[0]?.owner, 'owner')
    })
  })
})
