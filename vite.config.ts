import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import process from 'node:process'
import MarkdownItShiki from '@shikijs/markdown-it'
import Vue from '@vitejs/plugin-vue'
import matter from 'gray-matter'
import Anchor from 'markdown-it-anchor'
import GitHubAlerts from 'markdown-it-github-alerts'
import LinkAttributes from 'markdown-it-link-attributes'
import MarkdownItMagicLink from 'markdown-it-magic-link'
import Toc from 'markdown-it-table-of-contents'
import Unocss from 'unocss/vite'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import Markdown from 'unplugin-vue-markdown/vite'
import { VueRouterAutoImports } from 'unplugin-vue-router'
import VueRouter from 'unplugin-vue-router/vite'
import { defineConfig } from 'vite'
import { DOMAIN } from './scripts/shared'
import { resolvePostSlug } from './scripts/slug'

export default defineConfig({
  resolve: {
    alias: {
      '@': resolve(process.cwd(), './src'),
    },
  },
  plugins: [
    Unocss(),
    VueRouter({
      extensions: ['.vue', '.md'],
      dts: 'src/typings/typed-router.d.ts',
      extendRoute(route) {
        const path = route.components.get('default')
        if (!path)
          return

        if (path.endsWith('.md')) {
          const { data } = matter(readFileSync(path, 'utf-8'))
          route.addToMeta({
            frontmatter: data,
          })
        }
      },
    }),
    Vue({
      include: [/\.vue$/, /\.md$/],
    }),
    AutoImport({
      imports: [
        'vue',
        '@vueuse/core',
        VueRouterAutoImports,
      ],
      dirs: [
        'src/composables',
        'src/stores',
        'src/utils',
      ],
      vueTemplate: true,
      dts: 'src/typings/auto-imports.d.ts',
    }),
    Components({
      include: [/\.vue$/, /\.vue\?vue/, /\.md$/],
      extensions: ['vue', 'md'],
      dts: 'src/typings/components.d.ts',
    }),
    Markdown({
      wrapperClasses: 'prose',
      wrapperComponent: 'Prose',
      headEnabled: true,
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
      frontmatterPreprocess: (frontmatter, options, _id, defaults) => {
        const postSlug = resolvePostSlug(_id)
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
    }),
  ],
})
