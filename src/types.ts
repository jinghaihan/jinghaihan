export interface ProjectCategory {
  name: string
  projects: Project[]
}

export interface Project {
  name: string
  description: string
  pinned?: boolean
}

export interface TimelineEvent {
  date: string
  title: string
  description: string
}
