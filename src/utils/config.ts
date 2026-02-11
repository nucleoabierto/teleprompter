import os from 'os'
import path from 'path'

import fs from 'fs-extra'

import logger from './logger.js'

export interface TeleprompterConfig {
  /** Default cache directory */
  cacheDir?: string
  /** Default branch for GitHub repositories */
  defaultBranch?: string
  /** Timeout for network requests (in milliseconds) */
  networkTimeout?: number
  /** Whether to use cache by default */
  useCache?: boolean
  /** Default verbose mode */
  verbose?: boolean
  /** GitHub API token for private repositories */
  githubToken?: string
}

export interface ConfigManager {
  load: () => Promise<TeleprompterConfig>
  save: (config: TeleprompterConfig) => Promise<void>
  getConfigPath: () => string
}

const defaultConfig: TeleprompterConfig = {
  cacheDir: path.join(os.homedir(), '.teleprompter', 'cache'),
  defaultBranch: 'main',
  networkTimeout: 30000,
  useCache: true,
  verbose: false,
}

/**
 * Get the configuration file path
 */
function getConfigPath(): string {
  return path.join(os.homedir(), '.teleprompter', 'config.json')
}

/**
 * Load configuration from file
 */
async function loadConfig(): Promise<TeleprompterConfig> {
  try {
    const configPath = getConfigPath()

    if (!await fs.pathExists(configPath)) {
      logger.debug('Config file not found, using defaults')
      return defaultConfig
    }

    const configData = await fs.readJson(configPath)
    const config = { ...defaultConfig, ...configData }

    logger.debug('Configuration loaded successfully')
    return config
  } catch (error) {
    logger.warning(`Error loading config: ${error instanceof Error ? error.message : 'Unknown error'}`)
    logger.info('Using default configuration')
    return defaultConfig
  }
}

/**
 * Save configuration to file
 */
async function saveConfig(config: TeleprompterConfig): Promise<void> {
  try {
    const configPath = getConfigPath()
    await fs.ensureDir(path.dirname(configPath))

    const configToSave = { ...defaultConfig, ...config }
    await fs.writeJson(configPath, configToSave, { spaces: 2 })

    logger.success('Configuration saved successfully')
  } catch (error) {
    logger.error(`Error saving config: ${error instanceof Error ? error.message : 'Unknown error'}`)
    throw error
  }
}

export const configManager: ConfigManager = {
  load: loadConfig,
  save: saveConfig,
  getConfigPath,
}

export default configManager
