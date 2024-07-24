const { universalTheme } = require('@app/core/tailwind.theme')

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    '../../apps/**/*.tsx',
    '../../features/**/*.tsx',
    '../../packages/**/*.tsx',
  ],
  plugins: [require('nativewind/tailwind/css')],
  important: 'html',
  theme: {
    ...universalTheme,
  },
}
