import assert from 'node:assert'
import { test, describe } from 'node:test'

import { generateSlug, getBasicConfigPath, getConfigsPath, TELEPROMPTER_DIR, BASIC_CONFIG_SLUG } from '../../src/config/constants.js'

/* eslint-disable @typescript-eslint/no-floating-promises */

describe('Constants', () => {
  describe('generateSlug', () => {
    test('generates slug for simple lowercase names', () => {
      assert.strictEqual(generateSlug('simple'), 'simple')
    })

    test('converts uppercase to lowercase', () => {
      assert.strictEqual(generateSlug('Simple'), 'simple')
      assert.strictEqual(generateSlug('SIMPLE'), 'simple')
    })

    test('replaces spaces with hyphens', () => {
      assert.strictEqual(generateSlug('My Config'), 'my-config')
    })

    test('replaces underscores with hyphens', () => {
      assert.strictEqual(generateSlug('basic_config'), 'basic-config')
    })

    test('replaces dots with hyphens', () => {
      assert.strictEqual(generateSlug('Config 2.0'), 'config-2-0')
    })

    test('replaces special characters with hyphens', () => {
      assert.strictEqual(generateSlug('test@config#123'), 'test-config-123')
    })

    test('collapses consecutive hyphens into single hyphen', () => {
      assert.strictEqual(generateSlug('config---name'), 'config-name')
      assert.strictEqual(generateSlug('config___name'), 'config-name')
      assert.strictEqual(generateSlug('config   name'), 'config-name')
      assert.strictEqual(generateSlug('config@#$%name'), 'config-name')
    })

    test('trims leading hyphens', () => {
      assert.strictEqual(generateSlug('-config'), 'config')
      assert.strictEqual(generateSlug('---config'), 'config')
    })

    test('trims trailing hyphens', () => {
      assert.strictEqual(generateSlug('config-'), 'config')
      assert.strictEqual(generateSlug('config---'), 'config')
    })

    test('trims both leading and trailing hyphens', () => {
      assert.strictEqual(generateSlug('-config-'), 'config')
      assert.strictEqual(generateSlug('---config---'), 'config')
    })

    test('returns empty string for empty input', () => {
      assert.strictEqual(generateSlug(''), '')
    })

    test('returns empty string when all characters become hyphens', () => {
      assert.strictEqual(generateSlug('---'), '')
      assert.strictEqual(generateSlug('   '), '')
      assert.strictEqual(generateSlug('!@#$%'), '')
    })

    test('preserves numeric characters', () => {
      assert.strictEqual(generateSlug('123'), '123')
      assert.strictEqual(generateSlug('Config123'), 'config123')
      assert.strictEqual(generateSlug('123Config'), '123config')
    })

    test('handles single character names', () => {
      assert.strictEqual(generateSlug('a'), 'a')
      assert.strictEqual(generateSlug('1'), '1')
    })

    test('handles complex mixed cases', () => {
      assert.strictEqual(generateSlug('Config_123_Test'), 'config-123-test')
    })

    test('handles unicode and accented characters', () => {
      assert.strictEqual(generateSlug('Configuración'), 'configuraci-n')
      assert.strictEqual(generateSlug('Müller'), 'm-ller')
    })
  })

  describe('Constantes', () => {
    test('TELEPROMPTER_DIR debe ser correcto', () => {
      assert.strictEqual(TELEPROMPTER_DIR, '.teleprompter')
    })

    test('BASIC_CONFIG_SLUG debe ser correcto', () => {
      assert.strictEqual(BASIC_CONFIG_SLUG, 'basic-configuration')
    })
  })

  describe('Path functions (integración)', () => {
    test('getBasicConfigPath debe apuntar a una configuración válida con script.yaml', async () => {
      const path = getBasicConfigPath()
      const fs = await import('node:fs/promises')

      const scriptPath = `${path}/script.yaml`
      const stats = await fs.stat(scriptPath).catch(() => undefined)
      assert.ok(stats?.isFile(), 'El path debe contener un script.yaml válido')
    })

    test('getConfigsPath debe apuntar a directorio con configuraciones válidas', async () => {
      const path = getConfigsPath()
      const fs = await import('node:fs/promises')

      const entries = await fs.readdir(path, { withFileTypes: true })
      const configDirs = entries.filter(e => e.isDirectory())

      assert.ok(configDirs.length >= 2, 'Debe haber al menos 2 configuraciones disponibles')

      // Verificar que cada subdirectorio tenga script.yaml válido
      for (const dir of configDirs) {
        const scriptPath = `${path}/${dir.name}/script.yaml`
        const stats = await fs.stat(scriptPath).catch(() => undefined)
        assert.ok(stats?.isFile(), `${dir.name} debe tener script.yaml`)
      }
    })
  })
})
