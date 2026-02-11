/**
 * Internationalization (i18n) module
 * Currently supports Spanish (es) as primary language
 * Structure ready for future multi-language support
 */

type Language = 'es'

interface Translations {
  errors: {
    configNotFound: string
    configExists: string
    invalidRepo: string
    downloadFailed: string
    noConfigs: string
    yamlValidation: string
  }
  info: {
    downloading: string
    copying: string
    noTeleprompterDir: string
  }
  success: {
    configCopied: string
    copiedTo: string
  }
  warning: {
    overwriting: string
    configIgnored: string
  }
  prompts: {
    selectConfig: string
  }
}

const translations: Record<Language, Translations> = {
  es: {
    errors: {
      configNotFound: 'No se encontró la configuración',
      configExists: 'La configuración ya existe en {path}. Use --force para sobrescribir.',
      invalidRepo: 'Formato de repositorio inválido. Use: owner/repo',
      downloadFailed: 'Error al descargar repositorio',
      noConfigs: 'No hay configuraciones instaladas',
      yamlValidation: 'Campo "{field}" es obligatorio y debe ser string',
    },
    info: {
      downloading: 'Descargando {repo}...',
      copying: 'Copiando configuración...',
      noTeleprompterDir: 'No existe el directorio .teleprompter en {dir}',
    },
    success: {
      configCopied: 'Configuración copiada',
      copiedTo: 'Configuración copiada en: {path}',
    },
    warning: {
      overwriting: 'Sobrescribiendo configuración existente en {path}',
      configIgnored: 'Configuración "{name}" ignorada: {reason}',
    },
    prompts: {
      selectConfig: 'Selecciona una configuración para instalar:',
    },
  },
}

let currentLanguage: Language = 'es'

/**
 * Sets the current language for i18n
 */
function setLanguage(lang: Language): void {
  currentLanguage = lang
}

/**
 * Gets a translation string with optional parameter substitution
 */
function t(
  section: 'errors' | 'info' | 'success' | 'warning' | 'prompts',
  key: string,
  params?: Record<string, string>
): string {
  const sectionData = translations[currentLanguage][section]
  const translation = (sectionData as Record<string, string>)[key]

  if (typeof translation !== 'string') {
    return `[missing: ${section}.${key}]`
  }

  if (params) {
    return Object.entries(params).reduce(
      (str, [param, value]) => str.replace(`{${param}}`, value),
      translation
    )
  }

  return translation
}

export { setLanguage, t, type Language, type Translations }
