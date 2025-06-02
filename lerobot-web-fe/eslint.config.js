import globals from 'globals'
import react from 'eslint-plugin-react'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'
import prettier from 'eslint-plugin-prettier'

export default tseslint.config(
  {
    ignores: ['dist', 'node_modules'],
  },
  {
    files: ['**/*.ts', '**/*.tsx'],
    languageOptions: {
      ecmaVersion: 2021,
      sourceType: 'module',
      globals: globals.browser,
    },
    plugins: {
      react,
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
      prettier,
    },
    settings: {
      react: {
        version: 'detect',
      },
      'import/resolver': {
        typescript: {},
      },
    },
    rules: {
      'no-console': ['error', { allow: ['warn', 'error'] }],
      'no-unused-vars': ['error', { args: 'after-used' }],
      'eol-last': ['error', 'always'],
      'prefer-template': 'error',
      'prefer-arrow-callback': 'error',
      'max-len': ['error', { code: 140, ignorePattern: '^import .*' }],
      'valid-typeof': ['error', { requireStringLiterals: false }],
      'func-style': ['error', 'declaration', { allowArrowFunctions: true }],
      'function-paren-newline': 'off',
      'space-before-function-paren': 'off',
      indent: 'off',
      '@typescript-eslint/no-extraneous-class': [
        'error',
        { allowEmpty: true, allowStaticOnly: true },
      ],
      '@typescript-eslint/no-misused-promises': [
        'error',
        { checksVoidReturn: false },
      ],
      '@typescript-eslint/no-non-null-assertion': 'off',
      'import/no-cycle': ['error', { maxDepth: 2 }],
      'import/no-default-export': 'error',
      'react/jsx-indent': ['error', 2],
      'react/jsx-no-target-blank': 'error',
      'react/jsx-curly-spacing': ['error', { when: 'never', children: true }],
      'react/jsx-pascal-case': 'error',
      'react/jsx-uses-vars': 'error',
      ...reactHooks.configs.recommended.rules,
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',
      'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
      'prettier/prettier': 'error',
    },
  }
)
