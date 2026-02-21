<script setup lang="ts">
import type { RouteRecordNormalized } from 'vue-router'
import { useHead } from '@unhead/vue'

useHead({
  title: 'Posts - octohash',
})

function postsFilter(i: RouteRecordNormalized) {
  if (i.path.startsWith('/posts/concepts'))
    return false
  return true
}
</script>

<template>
  <div>
    <div class="mb-8 flex flex-col items-center">
      <h1 text-4xl mb-1>
        Blog
      </h1>
      <p text-lg opacity-50 italic>
        Gotta write something, I guess.
      </p>
    </div>

    <div class="my-8 flex gap-3 items-center justify-center">
      <a
        href="/feed.xml"
        target="_blank"
        class="group btn-lime"
      >
        <i
          i-tabler:file-rss
          group-hover:i-tabler:file-rss-filled
        />
        RSS Feed
      </a>
    </div>

    <PostList :filter="postsFilter" />
  </div>
</template>
