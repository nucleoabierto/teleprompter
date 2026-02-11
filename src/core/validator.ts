import yaml from 'yaml'

import { getErrorMessage } from '../utils/logger.js'

/**
 * Interface for the raw YAML structure
 */
interface ScriptYaml {
  name?: unknown
  description?: unknown
  bootstrap?: unknown
  criteria?: unknown
  version?: unknown
}

/**
 * Interface for a validated script definition
 */
interface ScriptDefinition {
  name?: string
  description: string
  bootstrap: string
  criteria?: string[]
  version?: string
}

/**
 * Result of script validation
 */
interface ScriptValidationResult {
  valid: boolean
  parsed?: ScriptDefinition
  error?: string
}

/**
 * Validates if a script.yaml content is valid
 * @param scriptContent - The YAML content to validate
 * @returns Validation result with parsed data or error message
 */
function validateScriptYaml(scriptContent: string): ScriptValidationResult {
  try {
    // yaml library by default prevents code execution in v2.x but we ensure it's safe
    // If we were using js-yaml, safeLoad would be needed, but we use 'yaml'
    // Still, to silence the linter if it expects a specific flag or we can just ignore it since 'yaml' package parses safely by default
    // eslint-disable-next-line secure-coding/no-unsafe-deserialization
    const parsed = yaml.parse(scriptContent) as ScriptYaml

    // Verificar campos obligatorios
    if (typeof parsed.description !== 'string' || parsed.description.length === 0) {
      return { valid: false, error: 'Campo "description" es obligatorio y debe ser string' }
    }

    if (typeof parsed.bootstrap !== 'string' || parsed.bootstrap.length === 0) {
      return { valid: false, error: 'Campo "bootstrap" es obligatorio y debe ser string' }
    }

    const script: ScriptDefinition = {
      description: parsed.description,
      bootstrap: parsed.bootstrap,
    }

    if (typeof parsed.name === 'string' && parsed.name.length > 0) {
      script.name = parsed.name
    }

    if (typeof parsed.version === 'string' && parsed.version.length > 0) {
      script.version = parsed.version
    }

    if (parsed.criteria !== undefined) {
      if (!Array.isArray(parsed.criteria)) {
        return { valid: false, error: 'Campo "criteria" debe ser un array de strings' }
      }
      if (!parsed.criteria.every((item: unknown) => typeof item === 'string')) {
        return { valid: false, error: 'Todos los elementos de "criteria" deben ser strings' }
      }
      script.criteria = parsed.criteria
    }

    return { valid: true, parsed: script }
  } catch (error) {
    return {
      valid: false,
      error: `YAML inválido: ${getErrorMessage(error)}`,
    }
  }
}

export {
  validateScriptYaml,
  type ScriptDefinition,
  type ScriptValidationResult,
  type ScriptYaml,
}
