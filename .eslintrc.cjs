/* eslint-env node */
module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 2022,
    sourceType: 'module',
    project: './tsconfig.json',
  },
  plugins: ['@typescript-eslint'],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'prettier',
  ],
  env: {
    node: true,
    es2022: true,
    jest: true,
  },
  ignorePatterns: ['dist', 'node_modules', '.serverless', '.esbuild', 'coverage'],
  rules: {
    '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/no-explicit-any': 'warn',
    '@typescript-eslint/consistent-type-imports': 'error',
    'no-console': ['warn', { allow: ['warn', 'error'] }],
  },
  overrides: [
    {
      // Regla de dependencia hexagonal: el dominio no conoce application ni infrastructure.
      files: ['src/domain/**/*.ts'],
      rules: {
        'no-restricted-imports': ['error', { patterns: [
          { group: ['@application', '@application/*', '@infrastructure/*', '**/application/**', '**/infrastructure/**'], message: 'domain no puede depender de application ni infrastructure.' },
          { group: ['express', 'knex', 'zod', 'serverless-http', 'mysql2'], message: 'domain no puede depender de librerías de infraestructura.' },
        ] }],
      },
    },
    {
      // application solo conoce domain (y sus propios puertos); nunca adaptadores ni librerías técnicas.
      files: ['src/application/**/*.ts'],
      rules: {
        'no-restricted-imports': ['error', { patterns: [
          { group: ['@infrastructure/*', '**/infrastructure/**'], message: 'application no puede depender de infrastructure (usar puertos).' },
          { group: ['express', 'knex', 'zod', 'serverless-http', 'mysql2'], message: 'application no puede depender de librerías de infraestructura.' },
        ] }],
      },
    },
  ],
};
