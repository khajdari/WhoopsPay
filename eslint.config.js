import js from '@eslint/js';
import security from 'eslint-plugin-security';
import sonarjs from 'eslint-plugin-sonarjs';
import microsoftSdl from '@microsoft/eslint-plugin-sdl';
import typescript from '@typescript-eslint/eslint-plugin';
import typescriptParser from '@typescript-eslint/parser';

export default [
  js.configs.recommended,
  {
    languageOptions: {
      globals: {
        require: 'readonly',
        module: 'readonly',
        exports: 'readonly',
        __dirname: 'readonly',
        __filename: 'readonly',
        process: 'readonly',
        console: 'readonly',
        Buffer: 'readonly',
        global: 'readonly',
        setImmediate: 'readonly',
      },
    },
    plugins: {
      security,
      sonarjs,
      '@microsoft/sdl': microsoftSdl
    },
    rules: {
      // Security Critical Rules
      'security/detect-eval-with-expression': 'error',
      'security/detect-child-process': 'error', 
      'security/detect-object-injection': 'warn',
      'security/detect-non-literal-fs-filename': 'warn',
      'security/detect-buffer-noassert': 'error',
      'security/detect-disable-mustache-escape': 'error',
      
      // Code Quality Security
      'sonarjs/cognitive-complexity': ['error', 20],
      'sonarjs/no-identical-expressions': 'error',
      'sonarjs/no-duplicate-string': ['error', { threshold: 3 }],
      'sonarjs/no-small-switch': 'warn',
      
      // Enterprise Security (SDL)
      '@microsoft/sdl/no-inner-html': 'error',
      '@microsoft/sdl/no-angular-bypass-sanitizer': 'error',
      '@microsoft/sdl/no-msapp-exec-unsafe': 'error'
    }
  },
  {
    files: ['**/*.ts', '**/*.tsx'],
    languageOptions: {
      parser: typescriptParser,
      parserOptions: {
        project: './tsconfig.json',
        ecmaVersion: 'latest',
        sourceType: 'module'
      }
    },
    plugins: {
      '@typescript-eslint': typescript
    },
    rules: {
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-unsafe-assignment': 'error',
      '@typescript-eslint/no-unsafe-call': 'error',
      '@typescript-eslint/no-unsafe-member-access': 'error'
    }
  }
];