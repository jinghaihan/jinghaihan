<script setup lang="ts">
import { useHead } from '@unhead/vue'

useHead({
  title: 'Contributions - octohash',
})

const store = useGitHubStatsStore()
const user = computed(() => store.stats ? store.stats.user : null)
const userUrl = computed(() => user.value ? `https://github.com/${user.value.username}` : '')
const username = computed(() => user.value ? user.value.username : 'octohash')
const pullRequests = computed(() => store.stats ? store.stats.pullRequest.data : [])
</script>

<template>
  <div>
    <div flex flex-col items-center>
      <a v-if="userUrl" mb-2 :href="userUrl" target="_blank">
        <img
          rounded-full size-18 shadow
          :src="user?.avatar"
          :alt="user?.name"
        >
      </a>
      <h1 text-2xl lg:text-3xl>
        octohash is <span class="animate-pulse">Contributing...</span>
      </h1>
      <p text-sm opacity-50 italic lg:text-lg>
        <a href="https://github.com/jinghaihan" target="_blank">
          @{{ username }}'s recent pull requests on GitHub.
        </a>
      </p>
    </div>
    <div class="my-8 flex flex-col gap-6 sm:gap-10">
      <PullRequest v-for="pr of pullRequests" :key="pr.url" :data="pr" />
    </div>
    <Spinner v-if="store.statsLoading" />
    <Back />
  </div>
</template>
