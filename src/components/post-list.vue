<script setup lang="ts">
import { formatDate } from '@/utils'

defineProps<{
  posts: {
    year: string
    posts: {
      path: string
      title?: string
      date?: string
      duration?: string
      lang?: string
    }[]
  }[]
}>()
</script>

<template>
  <div v-for="group in posts" :key="group.year" class="prose" mb-8>
    <h2 text-xl font-semibold mb-4 op75>
      {{ group.year }}
    </h2>
    <div
      v-for="post in group.posts"
      :key="post.path"
      mb-3 flex flex-col gap-2 items-baseline lg:flex-row lg:gap-4
    >
      <div text-base text-left op60 lg:text-lg>
        {{ formatDate(post.date) }}
      </div>
      <div>
        <a
          :href="post.path"
          text-lg font-semibold op75 cursor-pointer transition-opacity duration-200 hover:op100
          class="group no-underline"
        >
          {{ post.title || 'Untitled' }}
          <span v-if="post.duration" text-sm op50 group-hover:op75>
            · {{ post.duration }}
          </span>
        </a>
      </div>
    </div>
  </div>
</template>
