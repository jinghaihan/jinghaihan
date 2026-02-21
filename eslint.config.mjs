import { defineConfig } from '@octohash/eslint-config'

export default defineConfig({
  unocss: true,
  formatters: true,
  ignores: [
    './src/pages/posts/concepts/javascript-core-concepts.md',
    './src/pages/posts/concepts/javascript-handwriting-concepts.md',
    './src/pages/posts/concepts/typescript-core-concepts.md',
  ],
})
