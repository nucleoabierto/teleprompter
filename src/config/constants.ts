import path from 'path'
import { fileURLToPath } from 'url'

/**
 * Genera un slug a partir de un nombre.
 * Algoritmo: (1) pasar a minúsculas; (2) reemplazar cada secuencia de
 * caracteres no alfanuméricos por un único guion; (3) eliminar guiones al inicio y al final.
 *
 * @param name - Nombre a convertir
 * @returns Slug generado
 */
function generateSlug(name: string): string {
  if (name.length === 0) return ''

  return name
    .toLowerCase()
    .replace(/[^\da-z]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

/**
 * Obtiene la ruta absoluta a la configuración básica
 */
function getBasicConfigPath(): string {
  const baseDir = path.dirname(fileURLToPath(import.meta.url))
  return path.resolve(baseDir, '../../configs/basic-configuration')
}

/**
 * Obtiene la ruta absoluta al directorio de configuraciones
 */
function getConfigsPath(): string {
  const baseDir = path.dirname(fileURLToPath(import.meta.url))
  return path.resolve(baseDir, '../../configs')
}

/**
 * Nombre de la carpeta donde se guardan las configuraciones
 */
const TELEPROMPTER_DIR = '.teleprompter'

/**
 * Nombre del slug para la configuración básica
 */
const BASIC_CONFIG_SLUG = generateSlug('basic-configuration')

export {
  generateSlug,
  getBasicConfigPath,
  getConfigsPath,
  TELEPROMPTER_DIR,
  BASIC_CONFIG_SLUG,
}
