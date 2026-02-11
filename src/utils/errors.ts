/**
 * Error codes for Teleprompter CLI
 * Each error has a unique code, message, and actionable suggestions
 */

export class TeleprompterError extends Error {
  code: string
  suggestions: string[]

  constructor(code: string, message: string, suggestions: string[] = []) {
    super(message)
    this.name = 'TeleprompterError'
    this.code = code
    this.suggestions = suggestions
  }

  toString(): string {
    const suggestions = this.suggestions.length > 0
      ? `\n\nSugerencias:\n${this.suggestions.map((s) => `  • ${s}`).join('\n')}`
      : ''

    return `[${this.code}] ${this.message}${suggestions}`
  }
}

// Repository errors (E1xxx)
export const RepoNotFoundError = (owner: string, repo: string, branch: string) =>
  new TeleprompterError(
    'E1001',
    `Repositorio no encontrado: ${owner}/${repo} (rama: ${branch})`,
    [
      'Verifica que el repositorio exista y sea público',
      `Confirma que la rama '${branch}' exista en el repositorio`,
      'Para repositorios privados, asegúrate de tener acceso',
    ]
  )

export const NetworkError = (url: string) =>
  new TeleprompterError(
    'E1002',
    `Error de red al acceder a: ${url}`,
    [
      'Verifica tu conexión a internet',
      'Si estás detrás de un proxy, configura las variables HTTP_PROXY/HTTPS_PROXY',
      'Intenta nuevamente en unos momentos',
    ]
  )

export const InvalidRepoFormatError = (input: string) =>
  new TeleprompterError(
    'E1003',
    `Formato de repositorio inválido: "${input}"`,
    [
      'Usa el formato: owner/repo (ejemplo: nucleoabierto/teleprompter)',
      'No incluyas la URL completa, solo owner/repo',
      'No incluyas la extensión .git',
    ]
  )

// Configuration errors (E2xxx)
export const NoConfigsFoundError = (source: string) =>
  new TeleprompterError(
    'E2001',
    `No se encontraron configuraciones válidas en: ${source}`,
    [
      'Verifica que exista un archivo script.yaml válido',
      'Asegúrate de que el archivo tenga los campos "description" y "bootstrap"',
      'Usa "teleprompter list" para ver configuraciones disponibles',
    ]
  )

export const ConfigAlreadyExistsError = (path: string) =>
  new TeleprompterError(
    'E2002',
    `La configuración ya existe en: ${path}`,
    [
      'Usa --force para sobrescribir la configuración existente',
      'Usa "teleprompter list" para ver configuraciones instaladas',
      'Elimina manualmente la carpeta si ya no la necesitas',
    ]
  )

export const InvalidScriptYamlError = (path: string, reason: string) =>
  new TeleprompterError(
    'E2003',
    `Archivo script.yaml inválido en ${path}: ${reason}`,
    [
      'Verifica que el YAML esté bien formado',
      'Asegúrate de que tenga los campos obligatorios: description, bootstrap',
      'Revisa que el campo criteria (si existe) sea un array de strings',
    ]
  )

export const ConfigFilterNoMatchError = (filter: string) =>
  new TeleprompterError(
    'E2004',
    `No se encontraron configuraciones que coincidan con: "${filter}"`,
    [
      'Verifica el nombre de la configuración',
      'Usa --select para ver todas las configuraciones disponibles',
      'Prueba con una búsqueda más general',
    ]
  )

// Cache errors (E3xxx)
export const CacheError = (operation: string) =>
  new TeleprompterError(
    'E3001',
    `Error en operación de caché: ${operation}`,
    [
      'Usa --no-cache para omitir el caché temporalmente',
      'Verifica los permisos del directorio de caché',
      'El caché se recuperará automáticamente en la próxima ejecución',
    ]
  )

// File system errors (E4xxx)
export const PermissionDeniedError = (path: string) =>
  new TeleprompterError(
    'E4001',
    `Permiso denegado al acceder a: ${path}`,
    [
      'Verifica que tengas permisos de escritura en el directorio',
      'En sistemas Unix, usa chmod para ajustar permisos',
      'Considera usar sudo solo si es absolutamente necesario',
    ]
  )

export const DirectoryNotFoundError = (path: string) =>
  new TeleprompterError(
    'E4002',
    `Directorio no encontrado: ${path}`,
    [
      'Verifica que la ruta sea correcta',
      'Crea el directorio manualmente si no existe',
      'Usa --dir para especificar un directorio diferente',
    ]
  )

// Generic errors
export const UnknownError = (details: string) =>
  new TeleprompterError(
    'E9999',
    `Error desconocido: ${details}`,
    [
      'Reporta este error en: https://github.com/nucleoabierto/teleprompter/issues',
      'Incluye el código de error y los pasos para reproducirlo',
      'Ejecuta con --verbose para más detalles técnicos',
    ]
  )
