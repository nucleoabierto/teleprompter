import assert from 'node:assert'
import { describe, test } from 'node:test'

import { t, setLanguage } from '../../src/utils/i18n.js'

/* eslint-disable @typescript-eslint/no-floating-promises */

describe('I18n', () => {
  describe('t function', () => {
    test('returns translation for error keys', () => {
      const result = t('errors', 'configNotFound')
      assert.strictEqual(result, 'No se encontró la configuración')
    })

    test('returns translation for info keys', () => {
      const result = t('info', 'copying')
      assert.strictEqual(result, 'Copiando configuración...')
    })

    test('returns translation for success keys', () => {
      const result = t('success', 'configCopied')
      assert.strictEqual(result, 'Configuración copiada')
    })

    test('returns translation for warning keys', () => {
      const result = t('warning', 'overwriting')
      assert.ok(result.includes('Sobrescribiendo'))
    })

    test('returns translation for prompt keys', () => {
      const result = t('prompts', 'selectConfig')
      assert.ok(result.includes('Selecciona'))
    })

    test('substitutes single parameter in translation', () => {
      const result = t('errors', 'configExists', { path: '/test/path' })
      assert.ok(result.includes('/test/path'))
    })

    test('substitutes multiple parameters in translation', () => {
      const result = t('info', 'downloading', { repo: 'owner/repo' })
      assert.ok(result.includes('owner/repo'))
    })

    test('throws error for nonexistent category', () => {
      // @ts-expect-error - Testing invalid category
      assert.throws(() => t('nonexistent', 'key'))
    })

    test('returns missing key message for nonexistent key', () => {
      const result = t('errors', 'nonexistentKey')
      assert.ok(result.includes('missing'))
      assert.ok(result.includes('nonexistentKey'))
    })

    test('handles empty parameters object', () => {
      const result = t('errors', 'configNotFound', {})
      assert.strictEqual(result, 'No se encontró la configuración')
    })
  })

  describe('setLanguage', () => {
    test('does not throw when setting current language', () => {
      assert.doesNotThrow(() => setLanguage('es'))
    })

    test('maintains functionality after setLanguage call', () => {
      setLanguage('es')
      const result = t('errors', 'configNotFound')
      assert.strictEqual(result, 'No se encontró la configuración')
    })
  })
})
