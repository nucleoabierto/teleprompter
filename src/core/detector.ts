import path from 'path'

import fs from 'fs-extra'

import { validateScriptYaml, type ScriptDefinition } from './validator.js'
import { generateSlug } from '../config/constants.js'
import logger, { getErrorMessage } from '../utils/logger.js'

/**
 * Detected configuration result
 */
export interface DetectedConfig {
  name: string
  folderName: string
  slug: string
  path: string
  script: ScriptDefinition
}

export interface DetectorDeps {
  pathExists: (path: string) => Promise<boolean>
  readFile: (path: string, encoding: 'utf8') => Promise<string>
  readdir: (path: string, options: { withFileTypes: true }) => Promise<fs.Dirent[]>
}

const defaultDeps: DetectorDeps = {
  pathExists: fs.pathExists.bind(fs),
  readFile: fs.readFile.bind(fs),
  readdir: fs.readdir.bind(fs),
}

/**
 * Detects valid configurations in a given path
 * @param sourcePath - Path to search for configurations
 * @param deps - Dependencias inyectables para testing (default: defaultDeps)
 * @returns Promise<DetectedConfig[]> - Array of detected valid configurations
 */
async function detectConfigs(sourcePath: string, deps: DetectorDeps = defaultDeps): Promise<DetectedConfig[]> {
  try {
    const directScriptPath = path.join(sourcePath, 'script.yaml')

    // Caso 1: la ruta es directamente una configuración
    if (await deps.pathExists(directScriptPath)) {
      const scriptContent = await deps.readFile(directScriptPath, 'utf8')
      const validation = validateScriptYaml(scriptContent)

      if (validation.valid && validation.parsed !== undefined) {
        const script = validation.parsed
        const name = script.name ?? path.basename(sourcePath)
        return [{
          name,
          folderName: path.basename(sourcePath),
          slug: generateSlug(name),
          path: sourcePath,
          script,
        }]
      }
      // Si no es válida, continúa a buscar subcarpetas
    }

    // Caso 2: buscar subcarpetas con script.yaml
    const entries = await deps.readdir(sourcePath, { withFileTypes: true })

    const configs = await Promise.all(
      entries
        .filter((entry) => entry.isDirectory())
        .map(async (entry) => {
          const configPath = path.join(sourcePath, entry.name)
          const entryScriptPath = path.join(configPath, 'script.yaml')

          if (!await deps.pathExists(entryScriptPath)) {
            return undefined
          }

          const scriptContent = await deps.readFile(entryScriptPath, 'utf8')
          const validation = validateScriptYaml(scriptContent)

          if (!validation.valid || validation.parsed === undefined) {
            logger.warning(`Configuración "${entry.name}" ignorada: ${validation.error}`)
            return undefined
          }

          const script = validation.parsed
          const name = script.name ?? entry.name

          return {
            name,
            folderName: entry.name,
            slug: generateSlug(name),
            path: configPath,
            script,
          }
        })
    )

    return configs.filter((config): config is DetectedConfig => config !== undefined)
  } catch (error) {
    logger.error(`Error al detectar configuraciones: ${getErrorMessage(error)}`)
    throw error
  }
}

export { detectConfigs }
