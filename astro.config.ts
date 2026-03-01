import { resolve } from 'node:path'
import process from 'node:process'
import vue from '@astrojs/vue'
import MarkdownItShiki from '@shikijs/markdown-it'
import Unocss from '@unocss/astro'
import Vue from '@vitejs/plugin-vue'
import { defineConfig } from 'astro/config'
import Anchor from 'markdown-it-anchor'
import GitHubAlerts from 'markdown-it-github-alerts'
import LinkAttributes from 'markdown-it-link-attributes'
import MarkdownItMagicLink from 'markdown-it-magic-link'
import Toc from 'markdown-it-table-of-contents'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import Markdown from 'unplugin-vue-markdown/vite'
import { DOMAIN } from './scripts/shared'
import { resolvePostSlug } from './scripts/slug'

export default defineConfig({
  site: DOMAIN,
  integrations: [
    vue({ appEntrypoint: '/src/modules/vue-app.ts' }),
    Unocss(),
  ],
  vite: {
    resolve: {
      alias: {
        '@': resolve(process.cwd(), './src'),
      },
    },
    plugins: [
      Vue({
        include: [/\.mdv$/],
        template: {
          transformAssetUrls: {
            includeAbsolute: false,
          },
        },
      }) as any,
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
        include: [/\.vue$/, /\.vue\?vue/, /\.mdv$/],
        extensions: ['vue', 'mdv'],
        dts: 'src/typings/components.d.ts',
      }) as any,
      Markdown({
        include: [/\.mdv$/],
        wrapperClasses: 'prose',
        wrapperComponent: 'Prose',
        headEnabled: false,
        exportFrontmatter: false,
        exposeFrontmatter: false,
        exposeExcerpt: false,
        markdownItOptions: {
          quotes: '""\'\'',
        },
        async markdownItSetup(md) {
          md.use(await MarkdownItShiki({
            themes: {
              dark: 'kanagawa-dragon',
              light: 'kanagawa-lotus',
            },
          }))

          md.use(Anchor, {
            permalink: Anchor.permalink.linkInsideHeader({
              symbol: '#',
              renderAttrs: () => ({ 'aria-hidden': 'true' }),
            }),
          })

          md.use(Toc, {
            includeLevel: [1, 2, 3, 4],
          })

          md.use(LinkAttributes, {
            matcher: (link: string) => /^https?:\/\//.test(link),
            attrs: {
              target: '_blank',
              rel: 'noopener',
            },
          })

          md.use(MarkdownItMagicLink, {})
          md.use(GitHubAlerts)
        },
        frontmatterPreprocess: (frontmatter, options, id, defaults) => {
          const postSlug = resolvePostSlug(id)
          if (postSlug) {
            const customImage = typeof frontmatter.image === 'string'
              ? frontmatter.image.trim()
              : ''

            frontmatter.image = customImage
              ? (customImage.startsWith('http')
                  ? customImage
                  : `${DOMAIN}${customImage.startsWith('/') ? '' : '/'}${customImage}`)
              : `${DOMAIN}/og/posts/${postSlug}.png`
          }

          const head = defaults(frontmatter, options)
          return { head, frontmatter }
        },
      }) as any,
    ],
    optimizeDeps: {
      exclude: ['@resvg/resvg-js'],
    },
  },
})
