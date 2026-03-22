import { installConfiguration } from '../core/orchestrator.js'
import logger, { getErrorMessage } from '../utils/logger.js'

import type { OrchestratorOptions } from '../core/orchestrator.js'

export interface RunDeps {
  installConfiguration: typeof installConfiguration
  exit: (code: number) => void
}

const defaultDeps: RunDeps = {
  installConfiguration,
  exit: process.exit.bind(process),
}

/**
 * Comando principal: copia configuración básica o desde GitHub
 */
async function runCommand(
  repo: string | undefined,
  options: OrchestratorOptions,
  deps: RunDeps = defaultDeps
): Promise<void> {
  try {
    await deps.installConfiguration(repo, options)
  } catch (error) {
    logger.error(getErrorMessage(error))
    deps.exit(1)
  }
}

export default runCommand
