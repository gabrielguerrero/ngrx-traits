/// <reference types="vitest" />
import analog from '@analogjs/platform';
import { globSync } from 'glob';
import { defineConfig } from 'vite';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  return {
    root: __dirname,
    cacheDir: `node_modules/.vite`,

    build: {
      outDir: 'dist/client',
      reportCompressedSize: true,
      target: ['es2020'],
    },
    server: {
      fs: {
        allow: ['.'],
      },
    },
    plugins: [
      analog({
        content: {
          highlighter: 'prism',
        },
        ssr: true,
        prerender: {
          routes: async () => [
            '/',
            ...globSync('src/app/pages/**/*.md', { cwd: __dirname }).map(
              (file) =>
                '/' + file.replace('src/app/pages/', '').replace('.md', ''),
            ),
          ],
        },
      }),
    ],
    test: {
      globals: true,
      environment: 'jsdom',
      setupFiles: ['src/test-setup.ts'],
      include: ['**/*.spec.ts'],
      reporters: ['default'],
    },
    define: {
      'import.meta.vitest': mode !== 'production',
    },

    optimizeDeps: {
      include: ['@ng-icons/core'],
    },
    // Analog emits the SSR bundle to dist/ssr and runs it from there to
    // prerender. Anything left external is resolved by Node from that
    // location rather than by Vite, so it depends on the node_modules layout
    // around it - which is exactly how the docs build broke once before.
    // Bundling the packages used during SSR keeps prerendering self-contained
    // and independent of how pnpm happens to lay things out.
    ssr: {
      noExternal: [
        '@angular/material',
        '@docsearch/js',
        '@ng-icons/bootstrap-icons',
        '@ng-icons/core',
        'front-matter',
        'marked',
        'marked-gfm-heading-id',
        'marked-highlight',
        'marked-mangle',
        'prismjs',
      ],
    },
  };
});
