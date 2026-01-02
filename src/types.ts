import type { App } from 'vue'
import type { Router } from 'vue-router'

export type UserModule = (ctx: { app: App, router: Router }) => void

export interface ProjectCategory {
  name: string
  icon: string
  projects: Project[]
}

export interface Project {
  name: string
  description: string
  icon?: string
  pinned?: boolean
}

export interface Contribution {
  user: User
  prs: PullRequest[]
}

export interface User {
  name: string
  username: string
  avatar: string
}

export interface PullRequest {
  repo: string
  title: string
  url: string
  created_at: string
  state: 'open' | 'closed' | 'merged' | 'draft'
  number: number
  type: 'User' | 'Organization'
  stars: number
}

export interface Frontmatter {
  title?: string
  subtitle?: string
  display?: string
  date?: string
  duration?: string
  lang?: 'zh-CN' | 'en-US'
}

export interface TimelineEvent {
  date: string
  title: string
  description: string
}
