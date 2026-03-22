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
