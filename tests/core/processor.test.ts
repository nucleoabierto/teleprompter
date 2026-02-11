import assert from 'node:assert'
import { describe, test } from 'node:test'
import os from 'os'
import path from 'path'

import fs from 'fs-extra'

import { copyConfig, detectConfigs, validateScriptYaml } from '../../src/core/processor.js'

/* eslint-disable @typescript-eslint/no-floating-promises, @typescript-eslint/no-non-null-assertion */

describe('Processor', () => {
  let tempDir: string

  // Setup y teardown
  test.before(async () => {
    tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'teleprompter-test-'))
  })

  test.after(async () => {
    await fs.remove(tempDir)
  })

  describe('validateScriptYaml', () => {
    test('debe validar script.yaml válido mínimo', () => {
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

    test('debe validar script.yaml completo', () => {
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

    test('debe rechazar sin description', () => {
      const invalidYaml = `
bootstrap: Instrucciones
`
      const result = validateScriptYaml(invalidYaml)
      assert.strictEqual(result.valid, false)
      const errorMessage = result.error ?? ''
      assert.ok(errorMessage.includes('Campo "description" es obligatorio'))
    })

    test('debe rechazar sin bootstrap', () => {
      const invalidYaml = `
description: Configuración
`
      const result = validateScriptYaml(invalidYaml)
      assert.strictEqual(result.valid, false)
      const errorMessage = result.error ?? ''
      assert.ok(errorMessage.includes('Campo "bootstrap" es obligatorio'))
    })

    test('debe rechazar con types incorrectos', () => {
      const invalidYaml = `
description: 123
bootstrap: true
`
      const result = validateScriptYaml(invalidYaml)
      assert.strictEqual(result.valid, false)
      const errorMessage = result.error ?? ''
      assert.ok(errorMessage.includes('Campo "description" es obligatorio y debe ser string'))
    })

    test('debe rechazar criteria que no es array', () => {
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

    test('debe rechazar criteria con elementos no string', () => {
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

    test('debe rechazar YAML inválido', () => {
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
  })

  describe('detectConfigs', () => {
    test('debe detectar configuración directa', async () => {
      const configDir = path.join(tempDir, 'direct-config')
      await fs.ensureDir(configDir)
      await fs.writeFile(
        path.join(configDir, 'script.yaml'),
        `
description: Configuración directa
bootstrap: Instrucciones
`
      )

      const configs = await detectConfigs(configDir)
      assert.strictEqual(configs.length, 1)
      assert.strictEqual(configs[0].name, 'direct-config')
      assert.strictEqual(configs[0].folderName, 'direct-config')
      assert.strictEqual(configs[0].slug, 'direct-config')
      assert.strictEqual(configs[0].path, configDir)
    })

    test('debe detectar múltiples configuraciones en subcarpetas', async () => {
      const configsDir = path.join(tempDir, 'configs')
      await fs.ensureDir(configsDir)

      // Config 1
      const config1Dir = path.join(configsDir, 'config1')
      await fs.ensureDir(config1Dir)
      await fs.writeFile(
        path.join(config1Dir, 'script.yaml'),
        `
name: First Config
description: Primera configuración
bootstrap: Instrucciones 1
`
      )

      // Config 2
      const config2Dir = path.join(configsDir, 'config2')
      await fs.ensureDir(config2Dir)
      await fs.writeFile(
        path.join(config2Dir, 'script.yaml'),
        `
name: Second Config
description: Segunda configuración
bootstrap: Instrucciones 2
criteria:
  - criterio 1
  - criterio 2
`
      )

      // Carpeta inválida (sin script.yaml)
      await fs.ensureDir(path.join(configsDir, 'invalid'))

      const configs = await detectConfigs(configsDir)
      assert.strictEqual(configs.length, 2)

      assert.strictEqual(configs[0].name, 'First Config')
      assert.strictEqual(configs[0].slug, 'first-config')

      assert.strictEqual(configs[1].name, 'Second Config')
      assert.strictEqual(configs[1].slug, 'second-config')
      assert.deepStrictEqual(configs[1].script.criteria, ['criterio 1', 'criterio 2'])
    })

    test('debe ignorar configuraciones inválidas', async () => {
      const configsDir = path.join(tempDir, 'configs-invalid')
      await fs.ensureDir(configsDir)

      // Config inválida (sin description)
      const invalidDir = path.join(configsDir, 'invalid')
      await fs.ensureDir(invalidDir)
      await fs.writeFile(
        path.join(invalidDir, 'script.yaml'),
        `
bootstrap: Solo bootstrap
`
      )

      const configs = await detectConfigs(configsDir)
      assert.strictEqual(configs.length, 0)
    })

    test('debe usar nombre de carpeta como fallback', async () => {
      const configDir = path.join(tempDir, 'fallback-config')
      await fs.ensureDir(configDir)
      await fs.writeFile(
        path.join(configDir, 'script.yaml'),
        `
description: Config sin nombre
bootstrap: Instrucciones
`
      )

      const configs = await detectConfigs(configDir)
      assert.strictEqual(configs.length, 1)
      assert.strictEqual(configs[0].name, 'fallback-config')
      assert.strictEqual(configs[0].slug, 'fallback-config')
    })
  })

  describe('copyConfig', () => {
    test('debe copiar configuración correctamente', async () => {
      const sourceDir = path.join(tempDir, 'source')
      const targetDir = path.join(tempDir, 'target', 'copied')

      await fs.ensureDir(sourceDir)
      await fs.writeFile(path.join(sourceDir, 'script.yaml'), 'description: Test\nbootstrap: Test')
      await fs.ensureDir(path.join(sourceDir, 'templates'))
      await fs.writeFile(path.join(sourceDir, 'templates', 'test.md'), '# Test')
      await fs.ensureDir(path.join(sourceDir, 'scaffolding'))
      await fs.writeFile(path.join(sourceDir, 'scaffolding', 'test.md'), '# Test')

      await copyConfig(sourceDir, targetDir)

      assert.ok(await fs.pathExists(targetDir))
      assert.ok(await fs.pathExists(path.join(targetDir, 'script.yaml')))
      assert.ok(await fs.pathExists(path.join(targetDir, 'templates', 'test.md')))
      assert.ok(await fs.pathExists(path.join(targetDir, 'scaffolding', 'test.md')))

      const content = await fs.readFile(path.join(targetDir, 'script.yaml'), 'utf8')
      assert.ok(content.includes('description: Test'))
    })

    test('debe lanzar error si ya existe sin force', async () => {
      const sourceDir = path.join(tempDir, 'source2')
      const targetDir = path.join(tempDir, 'target2', 'copied')

      await fs.ensureDir(sourceDir)
      await fs.writeFile(path.join(sourceDir, 'script.yaml'), 'description: Test\nbootstrap: Test')
      await fs.ensureDir(targetDir)
      await fs.writeFile(path.join(targetDir, 'existing.txt'), 'exists')

      await assert.rejects(
        async () => { await copyConfig(sourceDir, targetDir, false) },
        /La configuración ya existe/
      )
    })

    test('debe sobrescribir con force=true', async () => {
      const sourceDir = path.join(tempDir, 'source3')
      const targetDir = path.join(tempDir, 'target3', 'copied')

      await fs.ensureDir(sourceDir)
      await fs.writeFile(path.join(sourceDir, 'script.yaml'), 'description: New\nbootstrap: New')
      await fs.ensureDir(targetDir)
      await fs.writeFile(path.join(targetDir, 'old.txt'), 'old')

      await copyConfig(sourceDir, targetDir, true)

      assert.ok(await fs.pathExists(path.join(targetDir, 'script.yaml')))
      assert.ok(!await fs.pathExists(path.join(targetDir, 'old.txt')))
    })
  })
})
