// eslint-disable-next-line import-x/no-extraneous-dependencies
import all from '@nucleoabierto/eslint-config-cardinal/all'

export default [
  ...all,
  {
    ignores: [
      'dist/**',
      'node_modules/**',
      'coverage/**',
      'c8-coverage/**',
      '.cache/**',
      'tmp/**',
      'temp/**',
      '**/.eslintcache',
    ],
  },
  {
    files: ['tests/**/*.ts'],
    rules: {
      'import-x/no-unresolved': 'off',
      'import-x/extensions': 'off',
    },
  },
]
