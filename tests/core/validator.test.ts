import assert from 'node:assert'
import { describe, test } from 'node:test'

import {
  validateScriptYaml,
} from '../../src/core/validator.js'

/* eslint-disable @typescript-eslint/no-floating-promises, @typescript-eslint/no-non-null-assertion */

describe('Validator', () => {
  describe('validateScriptYaml', () => {
    test('validates minimal valid script.yaml', () => {
      const validYaml = `
description: Configuración de prueba
bootstrap: |
  Instrucciones de uso
`
      const result = validateScriptYaml(validYaml)
      assert.strictEqual(result.valid, true)
      assert.strictEqual(result.parsed!.description, 'Configuración de prueba')
      assert.strictEqual(result.parsed!.bootstrap, 'Instrucciones de uso\n')
    })

    test('validates complete script.yaml with all fields', () => {
      const validYaml = `
name: Test Config
description: Configuración completa de prueba
bootstrap: |
  Instrucciones detalladas
  Paso 1: Hacer algo
  Paso 2: Hacer otra cosa
criteria:
  - usar cuando se requiere prueba
  - no usar con proyectos Python
`
      const result = validateScriptYaml(validYaml)
      assert.strictEqual(result.valid, true)
      assert.strictEqual(result.parsed!.name, 'Test Config')
      assert.strictEqual(result.parsed!.description, 'Configuración completa de prueba')
      assert.strictEqual(result.parsed!.bootstrap.includes('Instrucciones detalladas'), true)
      assert.deepStrictEqual(result.parsed!.criteria, [
        'usar cuando se requiere prueba',
        'no usar con proyectos Python',
      ])
    })

    test('rejects yaml without description field', () => {
      const invalidYaml = `
bootstrap: Instrucciones
`
      const result = validateScriptYaml(invalidYaml)
      assert.strictEqual(result.valid, false)
      const errorMessage = result.error ?? ''
      assert.ok(errorMessage.includes('Campo "description" es obligatorio'))
    })

    test('rejects yaml without bootstrap field', () => {
      const invalidYaml = `
description: Configuración
`
      const result = validateScriptYaml(invalidYaml)
      assert.strictEqual(result.valid, false)
      const errorMessage = result.error ?? ''
      assert.ok(errorMessage.includes('Campo "bootstrap" es obligatorio'))
    })

    test('rejects yaml with non-string description type', () => {
      const invalidYaml = `
description: 123
bootstrap: true
`
      const result = validateScriptYaml(invalidYaml)
      assert.strictEqual(result.valid, false)
      const errorMessage = result.error ?? ''
      assert.ok(errorMessage.includes('Campo "description" es obligatorio y debe ser string'))
    })

    test('rejects yaml with non-string bootstrap type', () => {
      const invalidYaml = `
description: Configuración
bootstrap: 123
`
      const result = validateScriptYaml(invalidYaml)
      assert.strictEqual(result.valid, false)
      const errorMessage = result.error ?? ''
      assert.ok(errorMessage.includes('Campo "bootstrap" es obligatorio y debe ser string'))
    })

    test('rejects criteria when not an array', () => {
      const invalidYaml = `
description: Configuración
bootstrap: Instrucciones
criteria: no es array
`
      const result = validateScriptYaml(invalidYaml)
      assert.strictEqual(result.valid, false)
      const errorMessage = result.error ?? ''
      assert.ok(errorMessage.includes('Campo "criteria" debe ser un array de strings'))
    })

    test('rejects criteria containing non-string elements', () => {
      const invalidYaml = `
description: Configuración
bootstrap: Instrucciones
criteria:
  - válido
  - 123
  - también válido
`
      const result = validateScriptYaml(invalidYaml)
      assert.strictEqual(result.valid, false)
      const errorMessage = result.error ?? ''
      assert.ok(errorMessage.includes('Todos los elementos de "criteria" deben ser strings'))
    })

    test('rejects criteria containing null elements', () => {
      const invalidYaml = `
description: Configuración
bootstrap: Instrucciones
criteria:
  - válido
  - null
`
      const result = validateScriptYaml(invalidYaml)
      assert.strictEqual(result.valid, false)
      const errorMessage = result.error ?? ''
      assert.ok(errorMessage.includes('Todos los elementos de "criteria" deben ser strings'))
    })

    test('rejects invalid YAML syntax', () => {
      const invalidYaml = `
description: Configuración
bootstrap: Instrucciones
  indentación inválida: no es YAML válido
`
      const result = validateScriptYaml(invalidYaml)
      assert.strictEqual(result.valid, false)
      const errorMessage = result.error ?? ''
      assert.ok(errorMessage.includes('YAML inválido'))
    })

    test('rejects empty string description', () => {
      const invalidYaml = `
description: ""
bootstrap: Instrucciones
`
      const result = validateScriptYaml(invalidYaml)
      assert.strictEqual(result.valid, false)
      assert.ok(result.error!.includes('description'))
    })

    test('rejects empty string bootstrap', () => {
      const invalidYaml = `
description: Configuración
bootstrap: ""
`
      const result = validateScriptYaml(invalidYaml)
      assert.strictEqual(result.valid, false)
      assert.ok(result.error!.includes('bootstrap'))
    })

    test('accepts empty criteria array', () => {
      const validYaml = `
description: Configuración
bootstrap: Instrucciones
criteria: []
`
      const result = validateScriptYaml(validYaml)
      assert.strictEqual(result.valid, true)
      assert.deepStrictEqual(result.parsed!.criteria, [])
    })

    test('accepts script without optional name field', () => {
      const validYaml = `
description: Configuración sin nombre
bootstrap: Instrucciones
`
      const result = validateScriptYaml(validYaml)
      assert.strictEqual(result.valid, true)
      assert.strictEqual(result.parsed!.name, undefined)
    })

    test('accepts script without optional criteria field', () => {
      const validYaml = `
description: Configuración sin criterios
bootstrap: Instrucciones
`
      const result = validateScriptYaml(validYaml)
      assert.strictEqual(result.valid, true)
      assert.strictEqual(result.parsed!.criteria, undefined)
    })

    test('accepts script with version field', () => {
      const validYaml = `
name: Test Config
description: Configuración con versión
bootstrap: Instrucciones
version: "1.2.3"
`
      const result = validateScriptYaml(validYaml)
      assert.strictEqual(result.valid, true)
      assert.strictEqual(result.parsed!.version, '1.2.3')
    })

    test('accepts script without optional version field', () => {
      const validYaml = `
description: Configuración sin versión
bootstrap: Instrucciones
`
      const result = validateScriptYaml(validYaml)
      assert.strictEqual(result.valid, true)
      assert.strictEqual(result.parsed!.version, undefined)
    })

    test('rejects empty yaml content', () => {
      const result = validateScriptYaml('')
      assert.strictEqual(result.valid, false)
      assert.ok(result.error!.includes('YAML inválido'))
    })

    test('rejects yaml with only whitespace', () => {
      const result = validateScriptYaml('   \n   ')
      assert.strictEqual(result.valid, false)
      assert.ok(result.error!.includes('YAML inválido'))
    })
  })
})
