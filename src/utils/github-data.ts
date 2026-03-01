import type { GitHubStats, Repository } from 'gh-statskit'
import type { Project, ProjectCategory } from '@/types'
import { GIST_PROJECTS_URL, GIST_STATS_URL } from '@/constants/profile'

export interface GithubDataSnapshot {
  stats: GitHubStats | null
  projectCategories: ProjectCategory[] | null
}

let cachedSnapshot: GithubDataSnapshot | null = null
let pendingRequest: Promise<GithubDataSnapshot> | null = null

function parseJson<T>(raw: string | null): T | null {
  if (!raw)
    return null

  try {
    return JSON.parse(raw) as T
  }
  catch {
    return null
  }
}

function buildRepositoryStargazers(stats: GitHubStats | null) {
  if (!stats)
    return null

  return stats.repositories.data.reduce<Record<string, number>>((acc, repository: Repository) => {
    acc[repository.name] = repository.stargazers
    return acc
  }, {})
}

function sortProjectsByRepositoryStars(projects: Project[], stats: GitHubStats | null) {
  const repositoryStargazers = buildRepositoryStargazers(stats)
  if (!repositoryStargazers)
    return projects

  return projects.slice().sort((a, b) => {
    return (repositoryStargazers[b.name] ?? 0) - (repositoryStargazers[a.name] ?? 0)
  })
}

function normalizeProjectCategories(categories: ProjectCategory[] | null, stats: GitHubStats | null) {
  if (!categories)
    return null

  return categories.map(category => ({
    ...category,
    projects: sortProjectsByRepositoryStars(category.projects, stats),
  }))
}

async function fetchText(url: string) {
  try {
    const response = await fetch(url)
    if (!response.ok)
      return null

    return await response.text()
  }
  catch {
    return null
  }
}

async function requestGithubData(): Promise<GithubDataSnapshot> {
  const [statsRaw, categoriesRaw] = await Promise.all([
    fetchText(GIST_STATS_URL),
    fetchText(GIST_PROJECTS_URL),
  ])

  const stats = parseJson<GitHubStats>(statsRaw)
  const projectCategories = normalizeProjectCategories(
    parseJson<ProjectCategory[]>(categoriesRaw),
    stats,
  )

  return {
    stats,
    projectCategories,
  }
}

export async function loadGithubData(): Promise<GithubDataSnapshot> {
  if (cachedSnapshot)
    return cachedSnapshot

  if (!pendingRequest) {
    pendingRequest = requestGithubData()
      .then((snapshot) => {
        cachedSnapshot = snapshot
        return snapshot
      })
      .finally(() => {
        pendingRequest = null
      })
  }

  return pendingRequest
}

export function sortProjectsByStargazers(projects: Project[], stats: GitHubStats | null) {
  return sortProjectsByRepositoryStars(projects, stats)
}
