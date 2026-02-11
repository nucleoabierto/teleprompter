import assert from 'node:assert'
import { describe, test, mock } from 'node:test'
import os from 'os'
import path from 'path'

import fs from 'fs-extra'

import { detectConfigs } from '../../src/core/detector.js'

/* eslint-disable @typescript-eslint/no-floating-promises */

describe('Detector', () => {
  let tempDir: string

  test.before(async () => {
    tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'teleprompter-test-'))
  })

  test.after(async () => {
    await fs.remove(tempDir)
  })

  describe('detectConfigs', () => {
    test('debe detectar configuración directa', async () => {
      const configPath = path.join(tempDir, 'direct-config')
      await fs.ensureDir(configPath)
      await fs.writeFile(
        path.join(configPath, 'script.yaml'),
        'name: Direct Config\ndescription: Configuración directa\nbootstrap: Instrucciones\n'
      )

      const configs = await detectConfigs(configPath)
      assert.strictEqual(configs.length, 1)
      assert.strictEqual(configs[0].name, 'Direct Config')
      assert.strictEqual(configs[0].slug, 'direct-config')
      assert.strictEqual(configs[0].script.description, 'Configuración directa')
    })

    test('debe detectar múltiples configuraciones en subcarpetas', async () => {
      const sourcePath = path.join(tempDir, 'multiple-configs')

      // Crear configuración A
      await fs.ensureDir(path.join(sourcePath, 'config-a'))
      await fs.writeFile(
        path.join(sourcePath, 'config-a', 'script.yaml'),
        'name: Config A\ndescription: Primera configuración\nbootstrap: Instrucciones A\n'
      )

      // Crear configuración B
      await fs.ensureDir(path.join(sourcePath, 'config-b'))
      await fs.writeFile(
        path.join(sourcePath, 'config-b', 'script.yaml'),
        'name: Config B\ndescription: Segunda configuración\nbootstrap: Instrucciones B\n'
      )

      const configs = await detectConfigs(sourcePath)
      assert.strictEqual(configs.length, 2)
      assert.ok(configs.some((c: any) => c.name === 'Config A'))
      assert.ok(configs.some((c: any) => c.name === 'Config B'))
    })

    test('debe ignorar configuraciones inválidas', async () => {
      const sourcePath = path.join(tempDir, 'mixed-configs')

      // Crear configuración válida
      await fs.ensureDir(path.join(sourcePath, 'valid-config'))
      await fs.writeFile(
        path.join(sourcePath, 'valid-config', 'script.yaml'),
        'name: Valid Config\ndescription: Configuración válida\nbootstrap: Instrucciones\n'
      )

      // Crear configuración inválida
      await fs.ensureDir(path.join(sourcePath, 'invalid-config'))
      await fs.writeFile(
        path.join(sourcePath, 'invalid-config', 'script.yaml'),
        'description: Sin bootstrap\n'
      )

      const configs = await detectConfigs(sourcePath)
      assert.strictEqual(configs.length, 1)
      assert.strictEqual(configs[0].name, 'Valid Config')
    })

    test('debe usar nombre de carpeta como fallback', async () => {
      const configPath = path.join(tempDir, 'folder-named')
      await fs.ensureDir(configPath)
      await fs.writeFile(
        path.join(configPath, 'script.yaml'),
        'description: Sin nombre explícito\nbootstrap: Instrucciones\n'
      )

      const configs = await detectConfigs(configPath)
      assert.strictEqual(configs.length, 1)
      assert.strictEqual(configs[0].name, 'folder-named')
      assert.strictEqual(configs[0].slug, 'folder-named')
    })

    test('debe manejar directorio sin configuraciones', async () => {
      const emptyPath = path.join(tempDir, 'empty-dir')
      await fs.ensureDir(emptyPath)

      const configs = await detectConfigs(emptyPath)
      assert.strictEqual(configs.length, 0)
    })

    test('debe ignorar script directo si es inválido o no tiene parsed', async () => {
      const mockDeps = {
        pathExists: mock.fn(async () => true),
        readFile: mock.fn(async () => 'invalid: yaml: : :'),
        readdir: mock.fn(async () => []),
      }

      const result = await detectConfigs('/fake/path/invalid', mockDeps)

      assert.strictEqual(result.length, 0)
    })

    test('debe usar basename si name no está en script.yaml de subcarpeta', async () => {
      const mockDeps = {
        pathExists: mock.fn(async (path: string) => {
          // Return true only for subdirectory script.yaml, not for direct path
          return path.includes('my-subconfig')
        }),
        readFile: mock.fn(async () => 'description: valid\nbootstrap: test'),
        readdir: mock.fn(async () => [
          { name: 'my-subconfig', isDirectory: () => true } as fs.Dirent,
        ]),
      }

      const result = await detectConfigs('/fake/path', mockDeps)

      assert.strictEqual(result.length, 1)
      assert.strictEqual(result[0]?.name, 'my-subconfig')
    })

    test('debe propagar errores correctamente', async () => {
      const mockDeps = {
        pathExists: mock.fn(async () => { throw new Error('System error') }),
        readFile: mock.fn(async () => ''),
        readdir: mock.fn(async () => []),
      }

      await assert.rejects(
        async () => await detectConfigs('/fake/path', mockDeps),
        /System error/
      )
    })
  })
})
