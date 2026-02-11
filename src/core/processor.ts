// Barrel file for backward compatibility
// Re-exports from specialized modules

// Re-export from validator
export {
  validateScriptYaml,
  type ScriptDefinition,
  type ScriptValidationResult,
  type ScriptYaml,
} from './validator.js'

// Re-export from detector
export {
  detectConfigs,
  type DetectedConfig,
} from './detector.js'

// Re-export from installer
export {
  copyConfig,
} from './installer.js'
