import type { UserModule } from './types'
import { ViteSSG } from 'vite-ssg'
import { routes } from 'vue-router/auto-routes'
import App from './App.vue'
import '@unocss/reset/tailwind.css'
import 'uno.css'
import '@/assets/main.css'
import '@/assets/prose.css'
import '@/assets/markdown.css'
import '@/assets/global.css'
import '@/assets/print.css'
import '@/assets/compact.css'
import 'markdown-it-github-alerts/styles/github-colors-light.css'
import 'markdown-it-github-alerts/styles/github-colors-dark-class.css'
import 'markdown-it-github-alerts/styles/github-base.css'

export const createApp = ViteSSG(
  App,
  {
    routes,
    scrollBehavior: () => ({ top: 0, behavior: 'smooth' }),
  },
  ({ router, app }) => {
    Object.values(import.meta.glob<{ install: UserModule }>('./modules/*.ts', { eager: true }))
      .forEach(i => i.install?.({ app, router }))
  },
)
