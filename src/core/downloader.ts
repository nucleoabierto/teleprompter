import os from 'os'
import path from 'path'

import fs from 'fs-extra'
import * as tar from 'tar'

import { getCachedRepo, saveToCache } from '../utils/cache.js'
import { getTarballUrl } from '../utils/github.js'
import logger, { getErrorMessage } from '../utils/logger.js'

export interface DownloaderDeps {
  mkdtemp: (prefix: string) => Promise<string>
  writeFile: (path: string, data: Buffer) => Promise<void>
  remove: (path: string) => Promise<void>
  extract: (options: Record<string, unknown>) => Promise<void>
  fetch: (url: string, init?: RequestInit) => Promise<Response>
  getCachedRepo: typeof getCachedRepo
  saveToCache: typeof saveToCache
}

const { mkdtemp, writeFile, remove } = fs

const defaultDeps: DownloaderDeps = {
  mkdtemp: mkdtemp.bind(fs),
  writeFile: writeFile.bind(fs),
  remove: remove.bind(fs),
  extract: tar.extract.bind(tar) as (options: Record<string, unknown>) => Promise<void>,
  fetch: globalThis.fetch.bind(globalThis),
  getCachedRepo,
  saveToCache,
}

/**
 * Check if cached repository is still valid by comparing ETag
 * @param owner - Propietario del repositorio
 * @param repo - Nombre del repositorio
 * @param branch - Rama del repositorio
 * @param cachedEtag - ETag almacenado en caché
 * @param fetchFn - Función fetch para hacer petición HEAD
 * @returns Promise<boolean> - true si caché es válido
 */
export async function isCacheValid(
  owner: string,
  repo: string,
  branch: string,
  cachedEtag: string,
  fetchFn: (url: string, init?: RequestInit) => Promise<Response>
): Promise<boolean> {
  try {
    const url = getTarballUrl(owner, repo, branch)
    // Make HEAD request to check ETag without downloading
    const response = await fetchFn(url, { method: 'HEAD' })

    if (!response.ok) {
      return false
    }

    const currentEtag = response.headers.get('etag') ?? response.headers.get('ETag')
    return currentEtag === cachedEtag
  } catch {
    // If HEAD request fails, assume cache is invalid
    return false
  }
}

/**
 * Descarga y extrae un repositorio de GitHub con soporte de caché
 * @param owner - Propietario del repositorio GitHub
 * @param repo - Nombre del repositorio
 * @param branch - Rama a descargar (por defecto: 'main')
 * @param useCache - Si se debe usar caché (por defecto: true)
 * @param deps - Dependencias inyectables para testing
 * @returns Promise<string> - Ruta al directorio extraído
 */
async function downloadRepo(
  owner: string,
  repo: string,
  branch = 'main',
  useCache = true,
  deps: DownloaderDeps = defaultDeps
): Promise<string> {
  try {
    const url = getTarballUrl(owner, repo, branch)

    // Check cache if enabled
    if (useCache) {
      const cached = await deps.getCachedRepo(owner, repo, branch)

      if (cached) {
        logger.info(`Verificando caché para ${owner}/${repo}...`)

        // Validate cache with ETag
        const cacheValid = await isCacheValid(owner, repo, branch, cached.metadata.etag, deps.fetch)

        if (cacheValid) {
          logger.success(`Usando repositorio en caché: ${cached.extractedPath}`)
          return cached.extractedPath
        }

        logger.info('Caché desactualizado, descargando nueva versión...')
      }
    }

    const tempDir = await deps.mkdtemp(path.join(os.tmpdir(), 'teleprompter-'))

    logger.info(`Descargando ${owner}/${repo}...`)

    // Descargar el tarball con timeout
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 30000) // 30 segundos timeout

    let response: Response
    try {
      response = await deps.fetch(url, {
        signal: controller.signal,
        headers: {
          'User-Agent': 'teleprompter-cli/0.1.0',
        },
      })
      clearTimeout(timeoutId)
    } catch (error) {
      clearTimeout(timeoutId)
      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error(`Timeout al descargar ${owner}/${repo} después de 30 segundos`)
      }
      throw new Error(`Error de red al descargar ${owner}/${repo}: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }

    if (!response.ok) {
      throw new Error(`Error al descargar: ${response.status} ${response.statusText}`)
    }

    // Get ETag for caching
    /* c8 ignore next */
    const etag = response.headers.get('etag') ?? response.headers.get('ETag') ?? 'unknown'

    const buffer = await response.arrayBuffer()
    const tarballPath = path.join(tempDir, 'repo.tar.gz')
    await deps.writeFile(tarballPath, Buffer.from(buffer))

    // Extraer el tarball
    logger.info('Extrayendo archivos...')
    const extractDir = path.join(tempDir, 'extracted')
    await fs.ensureDir(extractDir)
    await deps.extract({
      file: tarballPath,
      cwd: extractDir,
      strip: 1, // Elimina la carpeta principal (ej: repo-main/)
    })

    // Limpiar el tarball
    await deps.remove(tarballPath)

    // Save to cache if enabled
    if (useCache) {
      await deps.saveToCache(owner, repo, branch, extractDir, etag)
      logger.info('Guardado en caché para uso futuro')
    }

    logger.success(`Repositorio descargado en: ${extractDir}`)
    return extractDir
  } catch (error) {
    logger.error(`Error al descargar repositorio: ${getErrorMessage(error)}`)
    throw error
  }
}

export default downloadRepo
