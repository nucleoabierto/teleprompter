/* eslint-disable @typescript-eslint/no-floating-promises */
import assert from 'node:assert'
import { describe, test } from 'node:test'

import { getErrorMessage } from '../../src/utils/logger.js'

describe('Logger', () => {
  describe('getErrorMessage', () => {
    test('extracts message from Error instance', () => {
      const error = new Error('Test error message')
      const result = getErrorMessage(error)
      assert.strictEqual(result, 'Test error message')
    })

    test('returns string error directly', () => {
      const result = getErrorMessage('String error')
      assert.strictEqual(result, 'String error')
    })

    test('returns unknown error for non-error types', () => {
      const result = getErrorMessage(123)
      assert.strictEqual(result, 'Unknown error occurred')
    })

    test('returns unknown error for undefined', () => {
      const result = getErrorMessage(undefined)
      assert.strictEqual(result, 'Unknown error occurred')
    })

    test('returns unknown error for objects', () => {
      // eslint-disable-next-line secure-coding/no-hardcoded-credentials
      const result = getErrorMessage({ message: 'test' })
      assert.strictEqual(result, 'Unknown error occurred')
    })
  })
})
