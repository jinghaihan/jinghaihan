<script setup lang="ts">
import type { Project, ProjectCategory } from '@/types'

const store = useGitHubStatsStore()

const pinnedProjects = computed(() => {
  const data = store.projectCategories?.flatMap((category: ProjectCategory) => {
    return category.projects
      .filter((project: Project) => project.pinned)
      .map((project: Project) => ({
        ...project,
      }))
  })
  if (!data)
    return null
  return store.sortProjectsByStargazers(data)
})
</script>

<template>
  <div mx-auto max-w-7xl>
    <div class="mb-8 flex flex-col items-center">
      <h1 text-4xl mb-1>
        Projects
      </h1>
      <p text-lg opacity-50 italic>
        Projects that I created or maintaining.
      </p>
    </div>

    <div class="my-8 flex gap-3 items-center justify-center">
      <a
        href="https://github.com/jinghaihan"
        target="_blank"
        class="group btn-blue"
      >
        <i
          i-tabler:brand-github
          group-hover:i-tabler:brand-github-filled
        />
        GitHub
      </a>
      <a
        href="/projects/contributions"
        class="group btn-amber inline-block"
      >
        <i
          i-tabler:git-pull-request-draft
          group-hover:i-tabler:git-pull-request
        />
        Contributions
      </a>
    </div>

    <div v-if="pinnedProjects && pinnedProjects.length > 0" mb-12>
      <h2 text-2xl font-bold mb-6>
        Pinned
      </h2>
      <div gap-4 grid grid-cols-1 lg:grid-cols-2>
        <ProjectCard
          v-for="project in pinnedProjects"
          :key="`pinned-${project.name}`"
          :name="project.name"
          :description="project.description"
        />
      </div>
    </div>

    <div space-y-12>
      <div
        v-for="category in store.projectCategories"
        :key="category.name"
      >
        <div mb-6 flex items-center space-x-3>
          <h2 text-2xl font-bold>
            {{ category.name }}
          </h2>
        </div>

        <div gap-6 grid grid-cols-1 lg:grid-cols-2>
          <ProjectCard
            v-for="project in category.projects"
            :key="project.name"
            :name="project.name"
            :description="project.description"
          />
        </div>
      </div>
    </div>

    <Spinner v-if="store.projectCategoriesLoading" />
  </div>
</template>
