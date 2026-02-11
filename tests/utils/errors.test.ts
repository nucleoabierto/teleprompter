/* eslint-disable @typescript-eslint/no-floating-promises */
import assert from 'node:assert'
import { test, describe } from 'node:test'

import {
  TeleprompterError,
  RepoNotFoundError,
  NetworkError,
  InvalidRepoFormatError,
  NoConfigsFoundError,
  ConfigAlreadyExistsError,
  InvalidScriptYamlError,
  ConfigFilterNoMatchError,
  CacheError,
  PermissionDeniedError,
  DirectoryNotFoundError,
  UnknownError,
} from '../../src/utils/errors.js'

describe('Errors', () => {
  describe('TeleprompterError', () => {
    test('debe crear error con código y mensaje', () => {
      const error = new TeleprompterError('E0001', 'Test error', ['Suggestion 1'])

      assert.strictEqual(error.code, 'E0001')
      assert.strictEqual(error.message, 'Test error')
      assert.strictEqual(error.suggestions.length, 1)
      assert.strictEqual(error.suggestions[0], 'Suggestion 1')
      assert.strictEqual(error.name, 'TeleprompterError')
    })

    test('debe convertir a string con formato correcto', () => {
      const error = new TeleprompterError('E0001', 'Test error', ['Suggestion 1'])
      const str = error.toString()

      assert.ok(str.includes('[E0001]'))
      assert.ok(str.includes('Test error'))
      assert.ok(str.includes('Sugerencias:'))
      assert.ok(str.includes('Suggestion 1'))
    })

    test('debe manejar error sin sugerencias', () => {
      const error = new TeleprompterError('E0001', 'Test error')
      const str = error.toString()

      assert.ok(str.includes('[E0001]'))
      assert.ok(!str.includes('Sugerencias:'))
    })
  })

  describe('RepoNotFoundError', () => {
    test('debe crear error con datos del repositorio', () => {
      const error = RepoNotFoundError('nucleoabierto', 'teleprompter', 'main')

      assert.strictEqual(error.code, 'E1001')
      assert.ok(error.message.includes('nucleoabierto/teleprompter'))
      assert.ok(error.message.includes('main'))
      assert.ok(error.suggestions.length > 0)
    })
  })

  describe('NetworkError', () => {
    test('debe crear error con URL', () => {
      const error = NetworkError('https://github.com/test')

      assert.strictEqual(error.code, 'E1002')
      assert.ok(error.message.includes('https://github.com/test'))
    })
  })

  describe('InvalidRepoFormatError', () => {
    test('debe crear error con input inválido', () => {
      const error = InvalidRepoFormatError('invalid-format')

      assert.strictEqual(error.code, 'E1003')
      assert.ok(error.message.includes('invalid-format'))
    })
  })

  describe('NoConfigsFoundError', () => {
    test('debe crear error con source', () => {
      const error = NoConfigsFoundError('/some/path')

      assert.strictEqual(error.code, 'E2001')
      assert.ok(error.message.includes('/some/path'))
    })
  })

  describe('ConfigAlreadyExistsError', () => {
    test('debe crear error con path', () => {
      const error = ConfigAlreadyExistsError('/existing/path')

      assert.strictEqual(error.code, 'E2002')
      assert.ok(error.message.includes('/existing/path'))
      assert.ok(error.suggestions.some(s => s.includes('--force')))
    })
  })

  describe('InvalidScriptYamlError', () => {
    test('debe crear error con path y razón', () => {
      const error = InvalidScriptYamlError('/path/script.yaml', 'Missing field')

      assert.strictEqual(error.code, 'E2003')
      assert.ok(error.message.includes('/path/script.yaml'))
      assert.ok(error.message.includes('Missing field'))
    })
  })

  describe('ConfigFilterNoMatchError', () => {
    test('debe crear error con filtro', () => {
      const error = ConfigFilterNoMatchError('my-filter')

      assert.strictEqual(error.code, 'E2004')
      assert.ok(error.message.includes('my-filter'))
    })
  })

  describe('CacheError', () => {
    test('debe crear error con operación', () => {
      const error = CacheError('read')

      assert.strictEqual(error.code, 'E3001')
      assert.ok(error.message.includes('read'))
    })
  })

  describe('PermissionDeniedError', () => {
    test('debe crear error con path', () => {
      const error = PermissionDeniedError('/protected/path')

      assert.strictEqual(error.code, 'E4001')
      assert.ok(error.message.includes('/protected/path'))
    })
  })

  describe('DirectoryNotFoundError', () => {
    test('debe crear error con path', () => {
      const error = DirectoryNotFoundError('/missing/dir')

      assert.strictEqual(error.code, 'E4002')
      assert.ok(error.message.includes('/missing/dir'))
    })
  })

  describe('UnknownError', () => {
    test('debe crear error con detalles', () => {
      const error = UnknownError('Something went wrong')

      assert.strictEqual(error.code, 'E9999')
      assert.ok(error.message.includes('Something went wrong'))
    })
  })
})
