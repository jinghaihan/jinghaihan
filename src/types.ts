import type { App } from 'vue'
import type { Router } from 'vue-router'

export type UserModule = (ctx: { app: App, router: Router }) => void

export interface ProjectCategory {
  name: string
  projects: Project[]
}

export interface Project {
  name: string
  description: string
  pinned?: boolean
}

export interface Frontmatter {
  title?: string
  subtitle?: string
  display?: string
  image?: string
  date?: string
  duration?: string
  lang?: 'zh-CN' | 'en-US'
  layout?: 'default' | 'compact'
}

export interface TimelineEvent {
  date: string
  title: string
  description: string
}
