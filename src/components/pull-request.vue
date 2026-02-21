<script setup lang="ts">
import type { PullRequest } from 'gh-statskit'

defineProps<{
  data: PullRequest
}>()

function formatStars(stars: number) {
  return new Intl.NumberFormat('en-US', {
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(stars)
}

const stateIcons: Record<PullRequest['state'], string> = {
  open: 'i-lucide-git-pull-request-arrow',
  draft: 'i-lucide-git-pull-request-draft',
  merged: 'i-lucide-git-merge',
  closed: 'i-lucide-git-pull-request-closed',
}

const stateColors: Record<PullRequest['state'], string> = {
  open: 'text-green-500 op75 dark:text-green-400',
  draft: 'text-neutral-500 op75 dark:text-neutral-400',
  merged: 'text-purple-500 op75 dark:text-purple-400',
  closed: 'text-red-500 op75 dark:text-red-400',
}
</script>

<template>
  <div
    op75 flex gap-2 cursor-pointer transition-opacity duration-200 hover:op100 lg:gap-4
  >
    <a
      :href="`https://github.com/${data.repo}`"
      target="_blank"
      rel="noopener"
      border border-neutral-200 shrink-0 size-10 shadow-sm overflow-hidden dark:border-neutral-800 sm:size-12
      :class="[data.type === 'Organization' ? 'rounded-lg' : 'rounded-full']"
    >
      <img :src="`https://github.com/${data.repo.split('/')[0]}.png`" :alt="data.repo" size-full>
    </a>

    <div flex flex-1 min-w-0>
      <div flex flex-1 flex-col gap-1 min-w-0>
        <a
          :href="data.url"
          target="_blank"
          rel="noopener"
          flex gap-1 items-center hover:underline
        >
          <i
            shrink-0 size-4
            :class="[stateIcons[data.state], stateColors[data.state]]"
          />
          <span text-normal op75 truncate>
            {{ data.title }}
          </span>
        </a>

        <div flex gap-2 items-center>
          <a
            :href="`https://github.com/${data.repo}`"
            target="_blank"
            rel="noopener"
            font-normal.5 text-sm op50 inline-flex gap-1 truncate hover:op75
          >
            <span>{{ data.repo.split('/')[0] }}</span>
            <span>/</span>
            <span truncate>{{ data.repo.split('/')[1] }}</span>
          </a>
          <a
            :href="`https://github.com/${data.repo}`"
            target="_blank"
            rel="noopener"
            text-sm mt-0.5 op50 inline-flex gap-0.5 items-center hover:op75
          >
            <i i-lucide:star shrink-0 size-3 />
            <span text-xs>{{ formatStars(data.stars) }}</span>
          </a>
        </div>
      </div>

      <div ml-2 text-right flex shrink-0 flex-col gap-1 lg:ml-4>
        <a
          :href="data.url"
          target="_blank"
          rel="noopener"
          text-sm leading-6 font-normal op50 h-6 hover:op75
        >
          #{{ data.number }}
        </a>
        <time
          :datetime="data.created_at"
          text-sm font-normal op50
        >
          {{ useTimeAgo(new Date(data.created_at)) }}
        </time>
      </div>
    </div>
  </div>
</template>
