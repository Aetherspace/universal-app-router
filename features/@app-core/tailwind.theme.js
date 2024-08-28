const colors = require('tailwindcss/colors')

/** @type {import('tailwindcss').Config['theme']} */
const universalTheme = {
    // -i- Extend default tailwind theme here
    // -i- Reference this theme in the tailwind.config.js files in apps/expo, apps/next, features/app-core and other package or feature folders
    extend: {
        colors: {
            primary: colors.gray[900],
            primaryLight: colors.white,
            error: colors.red[500],
        },
        borderColor: (theme) => ({
            error: theme('colors.error'),
            primary: theme('colors.primary'),
            primaryLight: theme('colors.primaryLight'),
        }),
        backgroundColor: (theme) => ({
            error: theme('colors.error'),
            primary: theme('colors.primary'),
            primaryLight: theme('colors.primaryLight'),
        }),
        textColor: (theme) => ({
            error: theme('colors.error'),
            primary: theme('colors.primary'),
            primaryLight: theme('colors.primaryLight'),
        }),
    }
}

/* --- Exports --------------------------------------------------------------------------------- */

module.exports = { universalTheme }
