import { loadInstalledConfigs } from './shared.js'
import { detectConfigs } from '../core/detector.js'
import downloadRepo from '../core/downloader.js'
import { listCachedRepos } from '../utils/cache.js'
import { parseRepo } from '../utils/github.js'
import logger, { getErrorMessage } from '../utils/logger.js'

import type { SharedDeps } from './shared.js'
import type { DetectedConfig } from '../core/detector.js'

interface Options {
  dir?: string
  criteria?: boolean
  cached?: boolean
  branch?: string
  cache?: boolean
}

export interface ListDeps {
  loadInstalledConfigs: (dir?: string, deps?: SharedDeps) => Promise<DetectedConfig[]>
  listCachedRepos: typeof listCachedRepos
  downloadRepo: typeof downloadRepo
  detectConfigs: typeof detectConfigs
  parseRepo: typeof parseRepo
  exit: (code: number) => void
}

const defaultDeps: ListDeps = {
  loadInstalledConfigs,
  listCachedRepos,
  downloadRepo,
  detectConfigs,
  parseRepo,
  exit: process.exit.bind(process),
}

/**
 * Format install instruction for a config
 */
function formatInstallInstruction(
  sourceType: 'local' | 'cached' | 'remote',
  repoString?: string,
  configName?: string
): string {
  if (sourceType === 'local') {
    return 'Ya instalada en este proyecto'
  }

  if (sourceType === 'cached' && repoString) {
    return `Usa: npx teleprompter ${repoString} --config "${configName}"`
  }

  if (sourceType === 'remote' && repoString) {
    return `Usa: npx teleprompter ${repoString} --config "${configName}"`
  }

  return ''
}

/**
 * Display configurations with install instructions
 */
function displayConfigs(
  configs: DetectedConfig[],
  sourceType: 'local' | 'cached' | 'remote',
  repoString?: string,
  options?: { criteria?: boolean }
): void {
  if (configs.length === 0) {
    logger.info('No se encontraron configuraciones.')
    return
  }

  configs.forEach((config) => {
    logger.info(`${config.name} (${config.folderName})`)
    logger.plain(`  ${config.script.description}`)

    const installInstruction = formatInstallInstruction(sourceType, repoString, config.name)
    if (installInstruction) {
      logger.plain(`  → ${installInstruction}`)
    }

    const criteriaList = config.script.criteria ?? []
    if (options?.criteria === true && criteriaList.length > 0) {
      logger.plain('  Criterios:')
      criteriaList.forEach((criterion: string) => {
        logger.plain(`    - ${criterion}`)
      })
    }
    logger.plain('')
  })
}

/**
 * List configurations from local project
 */
async function listLocalConfigs(
  dir: string | undefined,
  options: Options,
  deps: ListDeps
): Promise<void> {
  const configs = await deps.loadInstalledConfigs(dir)

  if (configs.length === 0) {
    logger.info('No hay configuraciones instaladas.')
    logger.info('Ejecuta `teleprompter` primero para instalar una configuración.')
    return
  }

  logger.info('Configuraciones instaladas:')
  logger.info('')

  displayConfigs(configs, 'local', undefined, options)
}

/**
 * List configurations from cache
 */
async function listCachedConfigs(
  options: Options,
  deps: ListDeps
): Promise<void> {
  const cachedRepos = await deps.listCachedRepos()

  if (cachedRepos.length === 0) {
    logger.info('No hay repositorios en caché.')
    logger.info('Ejecuta `teleprompter owner/repo` para descargar configuraciones.')
    return
  }

  let totalConfigs = 0

  for (const repo of cachedRepos) {
    const repoString = `${repo.owner}/${repo.repo}`
    logger.info(`Repositorio: ${repoString} (${repo.branch})`)
    logger.info(`Cacheado: ${new Date(repo.cachedAt).toLocaleString()}`)
    logger.info('')

    const configs = await deps.detectConfigs(repo.extractedPath)

    if (configs.length === 0) {
      logger.info('  (Sin configuraciones válidas)')
      logger.plain('')
      continue
    }

    totalConfigs += configs.length
    displayConfigs(configs, 'cached', repoString, options)
  }

  logger.info(`Total: ${totalConfigs} configuración(es) en ${cachedRepos.length} repositorio(s) cacheado(s)`)
}

/**
 * List configurations from remote repository
 */
async function listRemoteConfigs(
  repoString: string,
  options: Options,
  deps: ListDeps
): Promise<void> {
  try {
    const { owner, repo } = deps.parseRepo(repoString)

    // Check cache first if enabled
    if (options.cache !== false) {
      const cached = await deps.listCachedRepos()
      const existingCache = cached.find(
        (r) => r.owner === owner && r.repo === repo && r.branch === (options.branch ?? 'main')
      )

      if (existingCache) {
        logger.info(`Usando repositorio en caché: ${repoString}`)
        const configs = await deps.detectConfigs(existingCache.extractedPath)
        displayConfigs(configs, 'remote', repoString, options)
        return
      }
    }

    // Download if not in cache or cache disabled
    const extractedPath = await deps.downloadRepo(owner, repo, options.branch, options.cache)
    const configs = await deps.detectConfigs(extractedPath)

    if (configs.length === 0) {
      logger.error('No se encontraron configuraciones válidas en el repositorio.')
      logger.info('Asegúrate de que el repositorio contenga carpetas con archivos script.yaml válidos.')
      deps.exit(1)
      return
    }

    displayConfigs(configs, 'remote', repoString, options)
  } catch (error) {
    logger.error(`Error al listar configuraciones remotas: ${getErrorMessage(error)}`)
    deps.exit(1)
  }
}

/**
 * Comando list: muestra configuraciones disponibles
 */
async function listCommand(
  repoString: string | undefined,
  options: Options,
  deps: ListDeps = defaultDeps
): Promise<void> {
  try {
    // Mode: list from cache
    if (options.cached) {
      await listCachedConfigs(options, deps)
      return
    }

    // Mode: list from remote repository
    if (repoString) {
      await listRemoteConfigs(repoString, options, deps)
      return
    }

    // Mode: list local installed configs (default)
    await listLocalConfigs(options.dir, options, deps)
  } catch (error) {
    logger.error(getErrorMessage(error))
    deps.exit(1)
  }
}

export default listCommand
