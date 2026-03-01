<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import PullRequest from '@/components/pull-request.vue'
import Spinner from '@/components/spinner.vue'
import { loadGithubData } from '@/utils'

const snapshot = ref<Awaited<ReturnType<typeof loadGithubData>> | null>(null)
const statsLoading = ref(true)

const user = computed(() => snapshot.value?.stats ? snapshot.value.stats.user : null)
const userUrl = computed(() => user.value ? `https://github.com/${user.value.username}` : '')
const username = computed(() => user.value ? user.value.username : 'octohash')
const pullRequests = computed(() => snapshot.value?.stats ? snapshot.value.stats.pullRequest.data : [])

onMounted(async () => {
  snapshot.value = await loadGithubData()
  statsLoading.value = false
})
</script>

<template>
  <div>
    <div class="flex flex-col items-center">
      <a v-if="userUrl" class="mb-2" :href="userUrl" target="_blank">
        <img
          class="rounded-full size-18 shadow"
          :src="user?.avatar"
          :alt="user?.name"
        >
      </a>
      <h1 class="text-2xl lg:text-3xl">
        octohash is <span class="animate-pulse">Contributing...</span>
      </h1>
      <p class="text-sm text-muted-foreground/75 italic lg:text-lg">
        <a href="https://github.com/jinghaihan" target="_blank">
          @{{ username }}'s recent pull requests on GitHub.
        </a>
      </p>
    </div>
    <div class="my-8 flex flex-col gap-6 sm:gap-10">
      <PullRequest v-for="pr of pullRequests" :key="pr.url" :data="pr" />
    </div>
    <Spinner v-if="statsLoading" />
    <div>
      <span class="text-muted-foreground/75 font-mono">> </span>
      <a href="/projects/contributions" class="text-muted-foreground/75 font-mono hover:text-foreground/85">
        cd..
      </a>
    </div>
  </div>
</template>
