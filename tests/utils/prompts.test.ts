import assert from 'node:assert'
import { test, describe, mock } from 'node:test'

import logger from '../../src/utils/logger.js'
import { selectConfig, confirmInstallation } from '../../src/utils/prompts.js'

import type { DetectedConfig } from '../../src/core/processor.js'

// Mock interface para readline
interface MockReadlineInterface {
  question: (query: string, cb: (answer: string) => void) => void
  close: () => void
}

describe('Prompts', () => {
  const mockConfig: DetectedConfig = {
    name: 'Test Config',
    slug: 'test-config',
    path: '/mock/path',
    folderName: 'test-config',
    script: { description: 'Test description', bootstrap: 'echo "Test"' },
  }

  test.beforeEach(() => {
    mock.method(logger, 'info', () => { /* empty */ })
    mock.method(logger, 'success', () => { /* empty */ })
    mock.method(logger, 'warning', () => { /* empty */ })
    mock.method(logger, 'error', () => { /* empty */ })
    mock.method(logger, 'plain', () => { /* empty */ })
  })

  test.afterEach(() => {
    mock.restoreAll()
  })

  describe('confirmInstallation', () => {
    test('debe retornar true para respuesta vacía (default Y)', async () => {
      const createInterfaceMock = mock.fn(() => ({
        // eslint-disable-next-line n/no-callback-literal
        question: (_query: string, cb: (answer: string) => void) => { cb('') },
        close: mock.fn(),
      } as any))

      const result = await confirmInstallation([mockConfig], '/target', { createInterface: createInterfaceMock })

      assert.strictEqual(result, true)
    })

    test('debe retornar true para respuesta "y"', async () => {
      const createInterfaceMock = mock.fn(() => ({
        // eslint-disable-next-line n/no-callback-literal
        question: (_query: string, cb: (answer: string) => void) => { cb('y') },
        close: mock.fn(),
      } as any))

      const result = await confirmInstallation([mockConfig], '/target', { createInterface: createInterfaceMock })

      assert.strictEqual(result, true)
    })

    test('debe retornar true para respuesta "yes"', async () => {
      const createInterfaceMock = mock.fn(() => ({
        // eslint-disable-next-line n/no-callback-literal
        question: (_query: string, cb: (answer: string) => void) => { cb('yes') },
        close: mock.fn(),
      } as any))

      const result = await confirmInstallation([mockConfig], '/target', { createInterface: createInterfaceMock })

      assert.strictEqual(result, true)
    })

    test('debe retornar false para respuesta "n"', async () => {
      const createInterfaceMock = mock.fn(() => ({
        // eslint-disable-next-line n/no-callback-literal
        question: (_query: string, cb: (answer: string) => void) => { cb('n') },
        close: mock.fn(),
      } as any))

      const result = await confirmInstallation([mockConfig], '/target', { createInterface: createInterfaceMock })

      assert.strictEqual(result, false)
    })

    test('debe manejar múltiples configuraciones en mensaje', async () => {
      const createInterfaceMock = mock.fn(() => ({
        // eslint-disable-next-line n/no-callback-literal
        question: (_query: string, cb: (answer: string) => void) => { cb('Y') },
        close: mock.fn(),
      } as any))

      const configs = [mockConfig, { ...mockConfig, name: 'Config 2', slug: 'config-2', folderName: 'config-2' }]

      await confirmInstallation(configs, '/target', { createInterface: createInterfaceMock })

      assert.strictEqual(createInterfaceMock.mock.callCount(), 1)
    })
  })

  describe('selectConfig', () => {
    test('debe fallar con configuraciones vacías', async () => {
      await assert.rejects(
        async () => await selectConfig([]),
        /No hay configuraciones válidas disponibles/
      )
    })

    test('debe seleccionar configuración válida', async () => {
      const createInterfaceMock = mock.fn(() => ({
        // eslint-disable-next-line n/no-callback-literal
        question: (query: string, cb: (answer: string) => void) => { cb('1') },
        close: mock.fn(),
      } as any))

      const result = await selectConfig([mockConfig], { createInterface: createInterfaceMock })

      assert.strictEqual(result, mockConfig)
      assert.strictEqual(createInterfaceMock.mock.callCount(), 1)
    })

    test('debe fallar con selección fuera de rango (muy alta)', async () => {
      const createInterfaceMock = mock.fn(() => ({
        // eslint-disable-next-line n/no-callback-literal
        question: (query: string, cb: (answer: string) => void) => { cb('2') },
        close: mock.fn(),
      } as any))

      await assert.rejects(
        async () => await selectConfig([mockConfig], { createInterface: createInterfaceMock }),
        /Selección inválida/
      )
    })

    test('debe fallar con selección inválida (no numérica)', async () => {
      const createInterfaceMock = mock.fn(() => ({
        // eslint-disable-next-line n/no-callback-literal
        question: (query: string, cb: (answer: string) => void) => { cb('abc') },
        close: mock.fn(),
      } as any))

      await assert.rejects(
        async () => await selectConfig([mockConfig], { createInterface: createInterfaceMock }),
        /Selección inválida/
      )
    })
  })
})
