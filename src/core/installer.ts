import path from 'path'

import fs from 'fs-extra'

import logger, { getErrorMessage } from '../utils/logger.js'

export interface InstallerDeps {
  pathExists: (path: string) => Promise<boolean>
  remove: (path: string) => Promise<void>
  ensureDir: (path: string) => Promise<void>
  copy: (src: string, dest: string) => Promise<void>
}

const defaultDeps: InstallerDeps = {
  pathExists: fs.pathExists.bind(fs),
  remove: fs.remove.bind(fs),
  ensureDir: fs.ensureDir.bind(fs),
  copy: fs.copy.bind(fs),
}

/**
 * Copies a configuration to the target path
 * @param sourcePath - Source configuration path
 * @param targetPath - Target path where configuration should be copied
 * @param force - Whether to overwrite existing configuration (default: false)
 * @param deps - Dependencias inyectables para testing
 * @returns Promise<void>
 */
async function copyConfig(
  sourcePath: string,
  targetPath: string,
  force = false,
  deps: InstallerDeps = defaultDeps
): Promise<void> {
  try {
    // Verificar si ya existe
    if (await deps.pathExists(targetPath)) {
      if (!force) {
        throw new Error(`La configuración ya existe en ${targetPath}. Use --force para sobrescribir.`)
      }
      logger.warning(`Sobrescribiendo configuración existente en ${targetPath}`)
      await deps.remove(targetPath)
    }

    // Crear directorio padre si no existe
    await deps.ensureDir(path.dirname(targetPath))

    // Copiar la configuración
    logger.info('Copiando configuración...')
    await deps.copy(sourcePath, targetPath)

    logger.success(`Configuración copiada en: ${targetPath}`)
  } catch (error) {
    logger.error(`Error al copiar configuración: ${getErrorMessage(error)}`)
    throw error
  }
}

export { copyConfig }
