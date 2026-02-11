import path from 'path'

import fs from 'fs-extra'

import downloadRepo from './downloader.js'
import { copyConfig, detectConfigs } from './processor.js'
import { TELEPROMPTER_DIR, getConfigsPath } from '../config/constants.js'
import { parseRepo } from '../utils/github.js'
import logger from '../utils/logger.js'
import { selectConfig, confirmInstallation } from '../utils/prompts.js'

import type { DetectedConfig } from './processor.js'

export interface OrchestratorOptions {
  dir?: string
  force?: boolean
  branch?: string
  cache?: boolean
  select?: boolean
  config?: string
}

export interface OrchestratorDeps {
  remove: (path: string) => Promise<void>
  detectConfigs: (sourcePath: string) => Promise<DetectedConfig[]>
  copyConfig: (sourcePath: string, targetPath: string, force?: boolean) => Promise<void>
  downloadRepo: (owner: string, repo: string, branch?: string, useCache?: boolean) => Promise<string>
  selectConfig: (configs: DetectedConfig[]) => Promise<DetectedConfig>
  confirmInstallation: (configs: DetectedConfig[], targetDir: string) => Promise<boolean>
}

const { remove } = fs

const defaultDeps: OrchestratorDeps = {
  remove: remove.bind(fs),
  detectConfigs,
  copyConfig,
  downloadRepo,
  selectConfig,
  confirmInstallation,
}

/**
 * Filter configs by name if --config option is provided
 */
function filterConfigs(configs: DetectedConfig[], configName?: string): DetectedConfig[] {
  if (!configName) return configs

  return configs.filter(
    (c) => c.name.toLowerCase().includes(configName.toLowerCase()) ||
      c.folderName.toLowerCase().includes(configName.toLowerCase())
  )
}

/**
 * Show preview of configs to be installed
 */
function showPreview(configs: DetectedConfig[], targetDir: string): void {
  logger.info('')
  logger.info('Configuraciones a instalar:')
  logger.info('')

  configs.forEach((config) => {
    const targetPath = path.join(targetDir, TELEPROMPTER_DIR, config.slug)
    logger.info(`  • ${config.name}`)
    logger.plain(`    ${config.script.description}`)
    logger.plain(`    → ${targetPath}`)
    logger.plain('')
  })
}

/**
 * Install multiple configurations
 */
async function installConfigs(
  configs: DetectedConfig[],
  teleprompterDir: string,
  force: boolean,
  deps: OrchestratorDeps
): Promise<void> {
  for (const config of configs) {
    const targetPath = path.join(teleprompterDir, config.slug)
    await deps.copyConfig(config.path, targetPath, force)
    logger.success(`Instalado: ${config.name}`)
  }
}

/**
 * Orquesta el flujo principal de instalación de configuraciones.
 */
export async function installConfiguration(
  repo: string | undefined,
  options: OrchestratorOptions,
  deps: OrchestratorDeps = defaultDeps
): Promise<void> {
  const targetDir = options.dir ?? process.cwd()
  const teleprompterDir = path.join(targetDir, TELEPROMPTER_DIR)

  let sourcePath: string
  let configs: DetectedConfig[]

  const repoString = typeof repo === 'string' && repo.length > 0 ? repo : undefined
  if (repoString) {
    // Descargar desde GitHub
    const { owner, repo: repoName } = parseRepo(repoString)
    const branch = options.branch ?? 'main'
    const useCache = options.cache ?? true
    sourcePath = await deps.downloadRepo(owner, repoName, branch, useCache)
    configs = await deps.detectConfigs(sourcePath)

    if (configs.length === 0) {
      throw new Error('No se encontraron configuraciones válidas en el repositorio')
    }
  } else {
    // Usar configuraciones locales
    sourcePath = getConfigsPath()
    configs = await deps.detectConfigs(sourcePath)

    if (configs.length === 0) {
      throw new Error('No se encontraron configuraciones locales')
    }
  }

  // Filter configs if --config option provided
  configs = filterConfigs(configs, options.config)

  if (configs.length === 0) {
    throw new Error(`No se encontraron configuraciones que coincidan con "${options.config}"`)
  }

  // Mode: Select (interactive selection)
  if (options.select && configs.length > 1) {
    const selected = await deps.selectConfig(configs)
    configs = [selected]
  }

  // Show preview
  showPreview(configs, targetDir)

  // Confirm installation unless --force is used
  const shouldInstall = options.force ?? await deps.confirmInstallation(configs, targetDir)

  if (!shouldInstall) {
    logger.info('Instalación cancelada')
    return
  }

  // Install configurations
  await installConfigs(configs, teleprompterDir, options.force ?? false, deps)

  // Show bootstrap instructions for installed configs
  if (configs.length === 1) {
    logger.plain(`\n${configs[0].script.bootstrap}`)
  } else {
    logger.info('')
    logger.info('Instrucciones de uso:')
    configs.forEach((config) => {
      logger.info(`\n${config.name}:`)
      logger.plain(config.script.bootstrap)
    })
  }

  // Limpiar directorio temporal (solo para repos descargados)
  if (repoString) {
    await deps.remove(sourcePath)
  }

  logger.success(`\n¡${configs.length} configuración(es) instalada(s) correctamente!`)
}
