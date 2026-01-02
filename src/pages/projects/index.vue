<script setup lang="ts">
import type { Project, ProjectCategory } from '@/types'
import { useHead } from '@unhead/vue'
import { OSS_PROJECTS } from '@/constants'

useHead({
  title: 'Projects - octohash',
})

const pinnedProjects = OSS_PROJECTS.flatMap((category: ProjectCategory) =>
  category.projects
    .filter((project: Project) => project.pinned)
    .map((project: Project) => ({
      ...project,
      icon: project.icon || category.icon,
    })),
)

const allProjects = OSS_PROJECTS
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
        <div
          i-tabler:brand-github
          group-hover:i-tabler:brand-github-filled
        />
        GitHub
      </a>
      <RouterLink
        to="/projects/contributions"
        class="group btn-amber inline-block"
      >
        <div
          i-tabler:git-pull-request-draft
          group-hover:i-tabler:git-pull-request
        />
        Contributions
      </RouterLink>
    </div>

    <div v-if="pinnedProjects.length > 0" mb-12>
      <h2 text-2xl font-bold mb-6>
        Pinned
      </h2>
      <div gap-4 grid grid-cols-1 lg:grid-cols-2>
        <ProjectCard
          v-for="project in pinnedProjects"
          :key="`pinned-${project.name}`"
          :name="project.name"
          :description="project.description"
          :icon="project.icon || ''"
        />
      </div>
    </div>

    <div space-y-12>
      <div
        v-for="category in allProjects"
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
            :icon="project.icon || category.icon"
          />
        </div>
      </div>
    </div>
  </div>
</template>
