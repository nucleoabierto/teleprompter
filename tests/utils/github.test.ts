import assert from 'node:assert'
import { test, describe } from 'node:test'

import { validateRepoFormat, getTarballUrl, parseRepo } from '../../src/utils/github.js'

/* eslint-disable @typescript-eslint/no-floating-promises */

describe('GitHub Utils', () => {
  describe('validateRepoFormat', () => {
    test('accepts valid owner/repo format', () => {
      assert.strictEqual(validateRepoFormat('owner/repo'), true)
      assert.strictEqual(validateRepoFormat('user/project-name'), true)
      assert.strictEqual(validateRepoFormat('org/repo_123'), true)
      assert.strictEqual(validateRepoFormat('my-org/my_repo'), true)
    })

    test('rejects empty string', () => {
      assert.strictEqual(validateRepoFormat(''), false)
    })

    test('rejects missing owner (single component)', () => {
      assert.strictEqual(validateRepoFormat('owner'), false)
    })

    test('rejects missing repo (trailing slash)', () => {
      assert.strictEqual(validateRepoFormat('owner/'), false)
    })

    test('rejects missing owner (leading slash)', () => {
      assert.strictEqual(validateRepoFormat('/repo'), false)
    })

    test('rejects more than two components', () => {
      assert.strictEqual(validateRepoFormat('owner/repo/extra'), false)
      assert.strictEqual(validateRepoFormat('a/b/c/d'), false)
    })

    test('rejects non-string values', () => {
      assert.strictEqual(validateRepoFormat(undefined), false)
      assert.strictEqual(validateRepoFormat(123), false)
      assert.strictEqual(validateRepoFormat({}), false)
      assert.strictEqual(validateRepoFormat([]), false)
    })
  })

  describe('getTarballUrl', () => {
    test('constructs URL with default main branch', () => {
      const url = getTarballUrl('owner', 'repo')
      assert.strictEqual(url, 'https://github.com/owner/repo/archive/refs/heads/main.tar.gz')
    })

    test('constructs URL with custom branch', () => {
      const url = getTarballUrl('owner', 'repo', 'develop')
      assert.strictEqual(url, 'https://github.com/owner/repo/archive/refs/heads/develop.tar.gz')
    })

    test('constructs URL with feature branch containing hyphens', () => {
      const url = getTarballUrl('owner', 'repo', 'feature/new-thing')
      assert.strictEqual(url, 'https://github.com/owner/repo/archive/refs/heads/feature/new-thing.tar.gz')
    })

    test('handles names with hyphens and underscores', () => {
      const url = getTarballUrl('user-name', 'repo_name')
      assert.strictEqual(url, 'https://github.com/user-name/repo_name/archive/refs/heads/main.tar.gz')
    })

    test('handles numeric owner and repo names', () => {
      const url = getTarballUrl('123', '456')
      assert.strictEqual(url, 'https://github.com/123/456/archive/refs/heads/main.tar.gz')
    })
  })

  describe('parseRepo', () => {
    test('parses valid owner/repo into components', () => {
      const result = parseRepo('owner/repo')
      assert.deepStrictEqual(result, { owner: 'owner', repo: 'repo' })
    })

    test('parses format with hyphens correctly', () => {
      const result = parseRepo('my-org/my-repo')
      assert.deepStrictEqual(result, { owner: 'my-org', repo: 'my-repo' })
    })

    test('parses format with underscores correctly', () => {
      const result = parseRepo('my_org/my_repo')
      assert.deepStrictEqual(result, { owner: 'my_org', repo: 'my_repo' })
    })

    test('throws error for single component', () => {
      assert.throws(() => parseRepo('owner'), {
        message: 'Formato de repositorio inválido. Use: owner/repo',
      })
    })

    test('throws error for more than two components', () => {
      assert.throws(() => parseRepo('owner/repo/extra'), {
        message: 'Formato de repositorio inválido. Use: owner/repo',
      })
    })

    test('throws error for empty string', () => {
      assert.throws(() => parseRepo(''), {
        message: 'Formato de repositorio inválido. Use: owner/repo',
      })
    })

    test('throws error for whitespace-only string', () => {
      assert.throws(() => parseRepo('   '), {
        message: 'Formato de repositorio inválido. Use: owner/repo',
      })
    })
  })
})
