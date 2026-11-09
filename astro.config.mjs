// @ts-check
import { defineConfig } from 'astro/config';
import netlify from '@astrojs/netlify';
import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  site: 'https://paroisse.stlouisfrancais.org',
  adapter: netlify(),
  integrations: [sitemap()]
});