import { loadInstalledConfigs } from './shared.js'
import logger, { getErrorMessage } from '../utils/logger.js'

import type { SharedDeps } from './shared.js'
import type { DetectedConfig } from '../core/detector.js'

interface Options {
  dir?: string
}

export interface BootstrapDeps {
  loadInstalledConfigs: (dir?: string, deps?: SharedDeps) => Promise<DetectedConfig[]>
  exit: (code: number) => void
}

const defaultDeps: BootstrapDeps = {
  loadInstalledConfigs,
  exit: process.exit.bind(process),
}

/**
 * Comando bootstrap: muestra instrucciones de uso
 */
async function bootstrapCommand(
  options: Options,
  deps: BootstrapDeps = defaultDeps
): Promise<void> {
  try {
    const configs = await deps.loadInstalledConfigs(options.dir)

    if (configs.length === 0) {
      logger.info('No hay configuraciones instaladas.')
      logger.info('Ejecuta `teleprompter` primero para instalar una configuración.')
      return
    }

    logger.info('Instrucciones de uso para cada configuración:')
    logger.info('')

    configs.forEach((config) => {
      logger.info(`${config.name} (${config.folderName}):`)
      logger.plain(config.script.bootstrap)
      logger.plain('')
    })
  } catch (error) {
    logger.error(getErrorMessage(error))
    deps.exit(1)
  }
}

export default bootstrapCommand
