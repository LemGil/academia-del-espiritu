import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{js,jsx}'],
    extends: [
      js.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      globals: globals.browser,
      parserOptions: { ecmaFeatures: { jsx: true } },
    },
    rules: {
      // Desactivada: marca el patrón idiomático de carga de datos al montar
      // (useEffect -> fetch -> setState), usado en toda la app sin problemas.
      // Regla nueva y demasiado agresiva de eslint-plugin-react-hooks v7.
      'react-hooks/set-state-in-effect': 'off',
    },
  },
])
