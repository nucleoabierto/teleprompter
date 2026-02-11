import { installConfiguration } from '../core/orchestrator.js'
import logger, { getErrorMessage } from '../utils/logger.js'

interface Options {
  dir?: string
  force?: boolean
  branch?: string
}

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
  options: Options,
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
