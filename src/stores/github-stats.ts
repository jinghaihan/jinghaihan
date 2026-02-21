import type { GitHubStats, Repository } from 'gh-statskit'
import type { Project, ProjectCategory } from '@/types'
import { useFetch } from '@vueuse/core'
import { defineStore } from 'pinia'
import { GIST_PROJECTS_URL, GIST_STATS_URL } from '@/constants'

export const useGitHubStatsStore = defineStore('github-stats', () => {
  const { data, isFetching: statsLoading } = useFetch<string>(GIST_STATS_URL)
  const { data: categories, isFetching: projectCategoriesLoading } = useFetch<string>(GIST_PROJECTS_URL)

  const stats = computed((): GitHubStats | null => {
    if (!data.value)
      return null

    try {
      return JSON.parse(data.value)
    }
    catch {
      return null
    }
  })

  const repositoryStargazers = computed((): Record<string, number> | null => {
    if (!stats.value)
      return null

    return stats.value.repositories.data.reduce((acc: Record<string, number>, repo: Repository) => {
      acc[repo.name] = repo.stargazers
      return acc
    }, {})
  })

  function sortProjectsByStargazers(projects: Project[]): Project[] {
    if (!repositoryStargazers.value)
      return projects
    return projects.sort(
      (a: Project, b: Project) => repositoryStargazers.value![b.name] - repositoryStargazers.value![a.name],
    )
  }

  const projectCategories = computed((): ProjectCategory[] | null => {
    if (!categories.value)
      return null

    try {
      const data = JSON.parse(categories.value)
      if (!repositoryStargazers.value)
        return data

      return data.map((category: ProjectCategory) => {
        return {
          ...category,
          projects: sortProjectsByStargazers(category.projects),
        }
      })
    }
    catch (error) {
      console.error(error)
      return null
    }
  })

  return {
    stats,
    statsLoading,
    projectCategories,
    projectCategoriesLoading,
    sortProjectsByStargazers,
  }
})
