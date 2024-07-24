const { universalTheme } = require('./tailwind.theme')

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    '../../apps/**/*.tsx',
    '../../features/**/*.tsx',
    '../../packages/**/*.tsx',
  ],
  plugins: [],
  theme: {
    ...universalTheme,
  },
}
