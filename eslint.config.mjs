import react from 'eslint-plugin-react'

export default [{
  files: ['src/**/*.{js,jsx}'],
  languageOptions: {
    parserOptions: { ecmaFeatures: { jsx: true } },
    globals: { document: 'readonly', window: 'readonly', fetch: 'readonly', FormData: 'readonly' },
  },
  plugins: { react },
  rules: {
    'no-undef': 'error',
    'no-unused-vars': 'error',
    'react/jsx-uses-react': 'error',
    'react/jsx-uses-vars': 'error',
    'react/jsx-no-undef': 'error',
  },
}]
