// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// GH_PAGES=1 — сборка демо-версии для GitHub Pages (сайт в подпапке /park-auto/)
const ghPages = process.env.GH_PAGES === '1';

// TODO: заменить на боевой домен «Парк Авто» — от него строятся canonical и sitemap.xml
export default defineConfig({
  site: ghPages ? 'https://winigov.github.io' : 'https://park-auto.example',
  base: ghPages ? '/park-auto' : '/',
  trailingSlash: 'always',
  integrations: [sitemap()],
});
