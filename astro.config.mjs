// @ts-check

import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';

// https://astro.build/config
export default defineConfig({
  site: 'https://rodina-rp.github.io',
  base: '/web',
  devToolbar: {
    enabled: false
  },
  build: {
    assetsPrefix: '/web/'
  },
  integrations: [tailwind(), mdx(), sitemap()],
});