import { resolve } from 'node:path'
import process from 'node:process'
import Mdx from '@astrojs/mdx'
import Vue from '@astrojs/vue'
import Unocss from '@unocss/astro'
import ExpressiveCode from 'astro-expressive-code'
import { defineConfig } from 'astro/config'
import ExternalLinks from 'rehype-external-links'
import Slug from 'rehype-slug'
import { DOMAIN } from './src/constants/site'

export default defineConfig({
  site: DOMAIN,
  integrations: [
    ExpressiveCode(),
    Mdx({
      extendMarkdownConfig: true,
    }),
    Vue(),
    Unocss(),
  ],
  markdown: {
    rehypePlugins: [
      Slug,
      [
        ExternalLinks,
        {
          target: '_blank',
          rel: ['noopener'],
        },
      ],
    ],
  },
  vite: {
    resolve: {
      alias: {
        '@': resolve(process.cwd(), './src'),
      },
    },
    optimizeDeps: {
      exclude: ['@resvg/resvg-js'],
    },
  },
})
