<script setup lang="ts">
import type { PullRequest } from 'gh-statskit'
import { useTimeAgo } from '@vueuse/core'

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
  open: 'text-green-500/85 dark:text-green-400/85',
  draft: 'text-neutral-500/85 dark:text-neutral-400/85',
  merged: 'text-purple-500/85 dark:text-purple-400/85',
  closed: 'text-red-500/85 dark:text-red-400/85',
}
</script>

<template>
  <div
    class="text-foreground/85 flex gap-2 cursor-pointer transition-colors duration-200 hover:text-foreground lg:gap-4"
  >
    <a
      :href="`https://github.com/${data.repo}`"
      target="_blank"
      rel="noopener"
      class="border border-border shrink-0 size-10 shadow-sm overflow-hidden sm:size-12"
      :class="[data.type === 'Organization' ? 'rounded-lg' : 'rounded-full']"
    >
      <img class="size-full" :src="`https://github.com/${data.repo.split('/')[0]}.png`" :alt="data.repo">
    </a>

    <div class="flex flex-1 min-w-0">
      <div class="flex flex-1 flex-col gap-1 min-w-0">
        <a
          :href="data.url"
          target="_blank"
          rel="noopener"
          class="flex gap-1 items-center hover:underline"
        >
          <i
            class="shrink-0 size-4"
            :class="[stateIcons[data.state], stateColors[data.state]]"
          />
          <span class="text-normal text-foreground/85 truncate">
            {{ data.title }}
          </span>
        </a>

        <div class="flex gap-2 items-center">
          <a
            :href="`https://github.com/${data.repo}`"
            target="_blank"
            rel="noopener"
            class="font-normal.5 text-sm text-muted-foreground/75 inline-flex gap-1 truncate hover:text-foreground/85"
          >
            <span>{{ data.repo.split('/')[0] }}</span>
            <span>/</span>
            <span class="truncate">{{ data.repo.split('/')[1] }}</span>
          </a>
          <a
            :href="`https://github.com/${data.repo}`"
            target="_blank"
            rel="noopener"
            class="text-sm text-muted-foreground/75 mt-0.5 inline-flex gap-0.5 items-center hover:text-foreground/85"
          >
            <i class="i-lucide:star shrink-0 size-3" />
            <span class="text-xs">{{ formatStars(data.stars) }}</span>
          </a>
        </div>
      </div>

      <div class="ml-2 text-right flex shrink-0 flex-col gap-1 lg:ml-4">
        <a
          :href="data.url"
          target="_blank"
          rel="noopener"
          class="text-sm text-muted-foreground/75 leading-6 font-normal h-6 hover:text-foreground/85"
        >
          #{{ data.number }}
        </a>
        <time
          :datetime="data.created_at"
          class="text-sm text-muted-foreground/75 font-normal"
        >
          {{ useTimeAgo(new Date(data.created_at)) }}
        </time>
      </div>
    </div>
  </div>
</template>
