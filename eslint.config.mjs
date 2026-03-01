import { defineConfig } from '@octohash/eslint-config'

export default defineConfig({
  unocss: true,
  formatters: true,
  ignores: [
    './src/markdown/posts/concepts/javascript-core-concepts.mdx',
    './src/markdown/posts/concepts/javascript-handwriting-concepts.mdx',
    './src/markdown/posts/concepts/typescript-core-concepts.mdx',
  ],
})
