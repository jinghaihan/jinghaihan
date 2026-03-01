import { resolve } from 'node:path'
import process from 'node:process'
import mdx from '@astrojs/mdx'
import vue from '@astrojs/vue'
import Unocss from '@unocss/astro'
import { defineConfig } from 'astro/config'
import rehypeAutolinkHeadings from 'rehype-autolink-headings'
import rehypeExternalLinks from 'rehype-external-links'
import rehypeSlug from 'rehype-slug'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import { DOMAIN } from './scripts/shared'

export default defineConfig({
  site: DOMAIN,
  integrations: [
    mdx({ extendMarkdownConfig: true }),
    vue({ appEntrypoint: '/src/modules/vue-app.ts' }),
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
    plugins: [
      AutoImport({
        imports: [
          'vue',
          '@vueuse/core',
          'pinia',
        ],
        dirs: [
          'src/composables',
          'src/stores',
        ],
        vueTemplate: true,
        dts: 'src/typings/auto-imports.d.ts',
      }) as any,
      Components({
        include: [/\.vue$/, /\.vue\?vue/],
        extensions: ['vue'],
        dts: 'src/typings/components.d.ts',
      }) as any,
    ],
    optimizeDeps: {
      exclude: ['@resvg/resvg-js'],
    },
  },
})
