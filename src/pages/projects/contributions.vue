<script setup lang="ts">
import type { Contribution } from '@/types'
import { useHead } from '@unhead/vue'
import { useFetch } from '@vueuse/core'
import { CONTRIBUTIONS_GIST_URL } from '@/constants/contributions'

useHead({
  title: 'Contributions - octohash',
})

const { data } = useFetch<string>(CONTRIBUTIONS_GIST_URL)

const contributions = computed((): Contribution | null => {
  try {
    return JSON.parse(data.value!)
  }
  catch {
    return null
  }
})

const user = computed(() => contributions.value ? contributions.value.user : null)
const userUrl = computed(() => user.value ? `https://github.com/${user.value.username}` : '')
const username = computed(() => user.value ? user.value.username : 'octohash')

const pullRequests = computed(() => contributions.value ? contributions.value.prs : [])
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
    <Back />
  </div>
</template>
