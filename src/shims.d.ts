import type { Frontmatter } from './types'
import 'vue-router'

declare global {
  interface Window {}
}

declare module 'vue-router' {
  interface RouteMeta {
    frontmatter?: Frontmatter
  }
}
