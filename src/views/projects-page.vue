<script setup lang="ts">
import type { Project } from '@/types'
import { computed, onMounted, ref } from 'vue'
import ProjectCard from '@/components/project-card.vue'
import Spinner from '@/components/spinner.vue'
import { loadGithubData, sortProjectsByStargazers } from '@/utils'

const snapshot = ref<Awaited<ReturnType<typeof loadGithubData>> | null>(null)
const projectCategoriesLoading = ref(true)
const projectCategories = computed(() => snapshot.value?.projectCategories ?? [])

const pinnedProjects = computed(() => {
  const data = projectCategories.value.flatMap((category) => {
    return category.projects
      .filter((project: Project) => project.pinned)
      .map((project: Project) => ({
        ...project,
      }))
  })
  return sortProjectsByStargazers(data, snapshot.value?.stats ?? null)
})

onMounted(async () => {
  snapshot.value = await loadGithubData()
  projectCategoriesLoading.value = false
})
</script>

<template>
  <div class="mx-auto max-w-7xl">
    <div class="mb-8 flex flex-col items-center">
      <h1 class="text-4xl mb-1">
        Projects
      </h1>
      <p class="text-lg text-muted-foreground/75 italic">
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
          class="i-tabler:brand-github group-hover:i-tabler:brand-github-filled"
        />
        GitHub
      </a>
      <a
        href="/projects/contributions"
        class="group btn-amber inline-block"
      >
        <i
          class="i-tabler:git-pull-request-draft group-hover:i-tabler:git-pull-request"
        />
        Contributions
      </a>
    </div>

    <div v-if="pinnedProjects.length > 0" class="mb-12">
      <h2 class="text-2xl font-bold mb-6">
        Pinned
      </h2>
      <div class="gap-4 grid grid-cols-1 lg:grid-cols-2">
        <ProjectCard
          v-for="project in pinnedProjects"
          :key="`pinned-${project.name}`"
          :name="project.name"
          :description="project.description"
        />
      </div>
    </div>

    <div class="space-y-12">
      <div
        v-for="category in projectCategories"
        :key="category.name"
      >
        <div class="mb-6 flex items-center space-x-3">
          <h2 class="text-2xl font-bold">
            {{ category.name }}
          </h2>
        </div>

        <div class="gap-6 grid grid-cols-1 lg:grid-cols-2">
          <ProjectCard
            v-for="project in category.projects"
            :key="project.name"
            :name="project.name"
            :description="project.description"
          />
        </div>
      </div>
    </div>

    <Spinner v-if="projectCategoriesLoading" />
  </div>
</template>
