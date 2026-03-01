export interface Project {
  name: string
  description: string
  url?: string
  pinned?: boolean
}

export interface ProjectCategory {
  name: string
  projects: Project[]
}
