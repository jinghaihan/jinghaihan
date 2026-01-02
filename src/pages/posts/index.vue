<script setup lang="ts">
import { useHead } from '@unhead/vue'
import { formatDate } from '@/utils'

useHead({
  title: 'Posts - octohash',
})

const router = useRouter()

const posts = computed(() => {
  const flatten = router.getRoutes()
    .filter(i => i.path !== '/posts' && i.path.startsWith('/posts'))
    .map(i => ({
      path: i.path,
      title: i.meta.frontmatter?.display ?? i.meta.frontmatter?.title,
      date: i.meta.frontmatter?.date,
      duration: i.meta.frontmatter?.duration,
      lang: i.meta.frontmatter?.lang,
    }))
    .sort((a, b) => new Date(b.date || '').getTime() - new Date(a.date || '').getTime())

  const grouped = flatten.reduce((acc, post) => {
    const year = post.date ? new Date(post.date).getFullYear().toString() : 'Unknown'
    if (!acc[year]) {
      acc[year] = []
    }
    acc[year].push(post)
    return acc
  }, {} as Record<string, typeof flatten>)

  return Object.entries(grouped)
    .map(([year, posts]) => ({
      year,
      posts: posts.sort((a, b) => new Date(b.date || '').getTime() - new Date(a.date || '').getTime()),
    }))
    .sort((a, b) => {
      if (a.year === 'Unknown')
        return 1
      if (b.year === 'Unknown')
        return -1
      return Number.parseInt(b.year) - Number.parseInt(a.year)
    })
})
</script>

<template>
  <div class="prose">
    <h1>Blog</h1>
    <div v-for="group in posts" :key="group.year" mb-8>
      <h2 text-xl font-semibold mb-4 op75>
        {{ group.year }}
      </h2>
      <div v-for="post in group.posts" :key="post.path" mb-3 gap-4 grid items-baseline class="grid-cols-[100px_1fr]">
        <div text-lg text-left op60>
          {{ formatDate(post.date) }}
        </div>
        <div>
          <router-link
            :to="post.path"
            text-lg font-semibold op75 cursor-pointer transition-opacity duration-200 hover:op100
            class="group no-underline"
          >
            {{ post.title || 'Untitled' }}
            <span v-if="post.duration" text-sm op50 group-hover:op75>
              · {{ post.duration }}
            </span>
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>
