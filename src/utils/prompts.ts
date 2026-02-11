import readline from 'readline'

import logger from './logger.js'

import type { DetectedConfig } from '../core/processor.js'

export interface PromptDeps {
  createInterface: typeof readline.createInterface
}

const defaultDeps: PromptDeps = {
  createInterface: readline.createInterface.bind(readline),
}

/**
 * Pide al usuario que confirme la instalación.
 */
export async function confirmInstallation(
  configs: DetectedConfig[],
  _targetDir: string,
  deps: PromptDeps = defaultDeps
): Promise<boolean> {
  const rl = deps.createInterface({
    input: process.stdin,
    output: process.stdout,
  })

  return new Promise<boolean>((resolve) => {
    rl.question(`¿Instalar ${configs.length} configuración(es)? [Y/n]: `, (answer) => {
      rl.close()

      const normalized = answer.trim().toLowerCase()
      resolve(normalized === '' || normalized === 'y' || normalized === 'yes')
    })
  })
}

/**
 * Pide al usuario que seleccione una configuración interactiva.
 */
export async function selectConfig(
  configs: DetectedConfig[],
  deps: PromptDeps = defaultDeps
): Promise<DetectedConfig> {
  if (configs.length === 0) {
    throw new Error('No hay configuraciones válidas disponibles')
  }

  logger.info('')
  logger.info('Configuraciones disponibles:')
  configs.forEach((config, index) => {
    logger.info(`${index + 1}. ${config.name} - ${config.script.description}`)
  })

  const rl = deps.createInterface({
    input: process.stdin,
    output: process.stdout,
  })

  return new Promise<DetectedConfig>((resolve, reject) => {
    rl.question('\nSelecciona el número de la configuración: ', (answer) => {
      rl.close()

      const index = parseInt(answer, 10) - 1
      if (index >= 0 && index < configs.length) {
        resolve(configs[index])
      } else {
        reject(new Error('Selección inválida'))
      }
    })
  })
}
