import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';
import { writeFile } from 'node:fs/promises';
import { UNDER_CONSTRUCTION } from './src/config';

export default defineConfig({
  site: 'https://nathanrumsey.dev',
  integrations: [
    react(),
    mdx(),
    sitemap(),
    {
      name: 'under-construction',
      hooks: {
        'astro:build:done': async ({ dir }) => {
          if (UNDER_CONSTRUCTION) {
            await writeFile(new URL('_redirects', dir), '/* /under-construction 200\n');
          }
        },
      },
    },
  ],
  vite: {
    plugins: [tailwindcss()],
  },
});
