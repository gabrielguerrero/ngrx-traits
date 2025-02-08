const { createGlobPatternsForDependencies } = require('@nx/angular/tailwind');
const { join } = require('node:path');

/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'selector',
  content: [
    join(__dirname, '**/!(*.stories|*.spec).{ts,html}'),
    ...createGlobPatternsForDependencies(__dirname),
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['InterVariable', 'sans-serif'],
      },
      colors: {
        primary: '#AA1BB6',
        accent: '#6325ac',
      },
      typography: (theme) => ({
        zinc: {
          css: {
            '--tw-prose-headings': theme('colors.zinc.950'),
            '--tw-prose-body': theme('colors.zinc.600'),
            maxWidth: 'none',
            h1: {
              fontSize: theme('fontSize.2xl'),
              fontWeight: theme('fontWeight.semibold'),
              marginBottom: theme('margin.2'),
            },
            h2: {
              fontSize: theme('fontSize.lg'),
              fontWeight: theme('fontWeight.semibold'),
              marginBottom: theme('margin.2'),
            },
            h3: {
              fontSize: theme('fontSize.base'),
              fontWeight: theme('fontWeight.semibold'),
              marginBottom: theme('margin.2'),
            },
          },
        },
      }),
    },
  },
  plugins: [require('@tailwindcss/typography')],
};
