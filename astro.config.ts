import { resolve } from 'node:path'
import process from 'node:process'
import mdx from '@astrojs/mdx'
import vue from '@astrojs/vue'
import Unocss from '@unocss/astro'
import { defineConfig } from 'astro/config'
import rehypeAutolinkHeadings from 'rehype-autolink-headings'
import rehypeExternalLinks from 'rehype-external-links'
import rehypeSlug from 'rehype-slug'
import { DOMAIN } from './scripts/shared'

export default defineConfig({
  site: DOMAIN,
  integrations: [
    mdx({ extendMarkdownConfig: true }),
    vue(),
    Unocss(),
  ],
  markdown: {
    shikiConfig: {
      themes: {
        dark: 'kanagawa-dragon',
        light: 'kanagawa-lotus',
      },
    },
    rehypePlugins: [
      rehypeSlug,
      [
        rehypeAutolinkHeadings,
        {
          behavior: 'prepend',
          content: {
            type: 'text',
            value: '#',
          },
          properties: {
            className: ['header-anchor'],
            ariaHidden: 'true',
          },
        },
      ],
      [
        rehypeExternalLinks,
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
