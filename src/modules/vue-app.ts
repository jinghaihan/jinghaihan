import type { App } from 'vue'
import { createPinia } from 'pinia'

export default function setupVueApp(app: App) {
  app.use(createPinia())
}
