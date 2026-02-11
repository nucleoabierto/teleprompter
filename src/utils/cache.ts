import os from 'os'
import path from 'path'

import fs from 'fs-extra'

/**
 * Metadata stored with cached repository
 */
interface CacheMetadata {
  owner: string
  repo: string
  branch: string
  etag: string
  cachedAt: string
  commitSha?: string
}

/**
 * Cache entry information
 */
interface CacheEntry {
  tarballPath: string
  extractedPath: string
  metadata: CacheMetadata
}

/**
 * Dependencies for cache operations (for testing)
 */
export interface CacheDeps {
  ensureDir: (path: string) => Promise<void>
  pathExists: (path: string) => Promise<boolean>
  readJson: (path: string) => Promise<unknown>
  writeJson: (path: string, data: unknown) => Promise<void>
  remove: (path: string) => Promise<void>
  readdir: (path: string) => Promise<string[]>
}

const { ensureDir, pathExists, readJson, writeJson, remove, readdir } = fs

const defaultDeps: CacheDeps = {
  ensureDir: ensureDir.bind(fs),
  pathExists: pathExists.bind(fs),
  readJson: readJson.bind(fs),
  writeJson: writeJson.bind(fs),
  remove: remove.bind(fs),
  readdir: readdir.bind(fs),
}

/**
 * Get the platform-specific cache directory
 * Follows XDG Base Directory Specification where possible
 */
function getCacheDir(): string {
  const { platform } = process

  // Check for XDG_CACHE_HOME (Linux/macOS convention)
  /* c8 ignore next 2 */
  if (process.env.XDG_CACHE_HOME) {
    return path.join(process.env.XDG_CACHE_HOME, 'teleprompter')
  }

  // Platform-specific defaults
  if (platform === 'win32') {
    // Windows: %LOCALAPPDATA%\teleprompter\Cache
    /* c8 ignore next 3 */
    const localAppData = process.env.LOCALAPPDATA ?? path.join(os.homedir(), 'AppData', 'Local')
    return path.join(localAppData, 'teleprompter', 'Cache')
  }

  // Linux and others: ~/.cache/teleprompter
  return path.join(os.homedir(), '.cache', 'teleprompter')
}

/**
 * Generate cache key for a repository
 */
function generateCacheKey(owner: string, repo: string, branch: string): string {
  return `${owner}-${repo}-${branch}`.replace(/[^\w-]/g, '_')
}

/**
 * Get cache entry if it exists and is valid
 */
async function getCachedRepo(
  owner: string,
  repo: string,
  branch: string,
  deps: CacheDeps = defaultDeps
): Promise<CacheEntry | undefined> {
  const cacheDir = getCacheDir()
  const cacheKey = generateCacheKey(owner, repo, branch)
  const metadataPath = path.join(cacheDir, `${cacheKey}.json`)
  const extractedPath = path.join(cacheDir, cacheKey)

  try {
    // Check if metadata exists
    if (!await deps.pathExists(metadataPath)) {
      return undefined
    }

    // Check if extracted directory exists
    if (!await deps.pathExists(extractedPath)) {
      // Clean up stale metadata
      /* c8 ignore next */
      await deps.remove(metadataPath).catch(() => { /* ignore */ })
      return undefined
    }

    // Read metadata
    const metadata = await deps.readJson(metadataPath) as CacheMetadata

    // Validate metadata structure
    if (!metadata.etag || !metadata.cachedAt) {
      await clearCacheEntry(cacheKey, deps)
      return undefined
    }

    return {
      tarballPath: path.join(cacheDir, `${cacheKey}.tar.gz`),
      extractedPath,
      metadata,
    }
  } catch {
    // If anything goes wrong, return undefined (cache miss)
    return undefined
  }
}

/**
 * Save repository to cache with metadata
 */
async function saveToCache(
  owner: string,
  repo: string,
  branch: string,
  extractedPath: string,
  etag: string,
  commitSha?: string,
  deps: CacheDeps = defaultDeps
): Promise<void> {
  const cacheDir = getCacheDir()
  const cacheKey = generateCacheKey(owner, repo, branch)

  await deps.ensureDir(cacheDir)

  const metadata: CacheMetadata = {
    owner,
    repo,
    branch,
    etag,
    cachedAt: new Date().toISOString(),
    commitSha,
  }

  const metadataPath = path.join(cacheDir, `${cacheKey}.json`)
  await deps.writeJson(metadataPath, metadata)
}

/**
 * Clear a specific cache entry
 */
async function clearCacheEntry(
  cacheKey: string,
  deps: CacheDeps = defaultDeps
): Promise<void> {
  const cacheDir = getCacheDir()
  const metadataPath = path.join(cacheDir, `${cacheKey}.json`)
  const extractedPath = path.join(cacheDir, cacheKey)

  await deps.remove(metadataPath).catch(() => { /* ignore */ })
  await deps.remove(extractedPath).catch(() => { /* ignore */ })
}

/**
 * Clear all cached repositories
 */
async function clearAllCache(deps: CacheDeps = defaultDeps): Promise<number> {
  const cacheDir = getCacheDir()

  if (!await deps.pathExists(cacheDir)) {
    return 0
  }

  const entries = await deps.readdir(cacheDir)
  let count = 0

  for (const entry of entries) {
    await deps.remove(path.join(cacheDir, entry)).catch(() => { /* ignore */ })
    count++
  }

  return count
}

/**
 * Get cache statistics
 */
async function getCacheStats(deps: CacheDeps = defaultDeps): Promise<{
  entryCount: number
  totalSize: number
  entries: { key: string; cachedAt: string; etag: string }[]
}> {
  const cacheDir = getCacheDir()
  const entries: { key: string; cachedAt: string; etag: string }[] = []

  if (!await deps.pathExists(cacheDir)) {
    return { entryCount: 0, totalSize: 0, entries }
  }

  const files = await deps.readdir(cacheDir)
  const metadataFiles = files.filter(f => f.endsWith('.json'))

  for (const file of metadataFiles) {
    try {
      const metadata = await deps.readJson(path.join(cacheDir, file)) as CacheMetadata
      entries.push({
        key: file.replace('.json', ''),
        cachedAt: metadata.cachedAt,
        etag: metadata.etag,
      })
    } catch {
      // Skip invalid entries
    }
  }

  return {
    entryCount: entries.length,
    totalSize: 0, // Could implement size calculation if needed
    entries,
  }
}

/**
 * List all cached repositories with their configurations
 */
async function listCachedRepos(
  deps: CacheDeps = defaultDeps
): Promise<{
  owner: string
  repo: string
  branch: string
  extractedPath: string
  cachedAt: string
}[]> {
  const cacheDir = getCacheDir()
  const repos: {
    owner: string
    repo: string
    branch: string
    extractedPath: string
    cachedAt: string
  }[] = []

  if (!await deps.pathExists(cacheDir)) {
    return repos
  }

  const files = await deps.readdir(cacheDir)
  const metadataFiles = files.filter(f => f.endsWith('.json'))

  for (const file of metadataFiles) {
    try {
      const metadata = await deps.readJson(path.join(cacheDir, file)) as CacheMetadata
      const cacheKey = file.replace('.json', '')
      const extractedPath = path.join(cacheDir, cacheKey)

      // Verify extracted path exists
      if (!await deps.pathExists(extractedPath)) {
        continue
      }

      repos.push({
        owner: metadata.owner,
        repo: metadata.repo,
        branch: metadata.branch,
        extractedPath,
        cachedAt: metadata.cachedAt,
      })
    } catch {
      // Skip invalid entries
    }
  }

  return repos
}

export {
  getCacheDir,
  getCachedRepo,
  saveToCache,
  clearCacheEntry,
  clearAllCache,
  getCacheStats,
  listCachedRepos,
  type CacheMetadata,
  type CacheEntry,
}
