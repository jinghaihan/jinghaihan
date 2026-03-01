<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { formatNumber, loadGithubData } from '@/utils'
import RankChart from './rank-chart.vue'
import Spinner from './spinner.vue'

const snapshot = ref<Awaited<ReturnType<typeof loadGithubData>> | null>(null)
const loading = ref(true)

const stats = computed(() => snapshot.value?.stats ?? null)
const stargazers = computed((): number => stats.value?.repositories.totalStargazers ?? 0)
const commits = computed((): number => stats.value?.commits ?? 0)
const prs = computed((): number => stats.value?.pullRequest.totalCount ?? 0)
const issues = computed((): number => stats.value?.issues.totalCount ?? 0)
const contributed = computed((): number => stats.value?.repositoriesContributedTo ?? 0)

const basicStats = computed(() => {
  return [
    {
      icon: 'i-ri:star-line',
      name: 'Total Stars',
      value: formatNumber(stargazers.value, 1),
    },
    {
      icon: 'i-ri:history-line',
      name: 'Total Commits',
      value: formatNumber(commits.value, 1),
    },
    {
      icon: 'i-ri:git-pull-request-line',
      name: 'Total PRs',
      value: formatNumber(prs.value, 1),
      href: '/projects/contributions',
    },
    {
      icon: 'i-ri:error-warning-line',
      name: 'Total Issues',
      value: formatNumber(issues.value, 1),
    },
    {
      icon: 'i-ri:git-repository-line',
      name: 'Contributed to',
      value: formatNumber(contributed.value, 1),
    },
  ]
})

const ranksLevel = computed((): string => stats.value?.rank.level ?? 'C')
const percentile = computed((): number => stats.value?.rank.percentile ?? 0)

onMounted(async () => {
  snapshot.value = await loadGithubData()
  loading.value = false
})
</script>

<template>
  <div class="flex flex-col gap-4 sm:flex-row lg:gap-12 sm:gap-6">
    <section class="flex flex-col gap-1 min-w-0">
      <a
        v-for="stat in basicStats"
        :key="stat.name"
        class="flex gap-2 min-w-0 cursor-pointer items-center"
        target="_blank"
        rel="noopener"
        :href="stat.href"
      >
        <i class="mb-0.5" :class="[stat.icon]" />
        <span class="text-foreground/85 min-w-36 whitespace-nowrap">
          {{ stat.name }}:
        </span>
        <span class="whitespace-nowrap">{{ stat.value }}</span>
      </a>
    </section>

    <section class="self-start">
      <RankChart v-if="percentile" :rank="ranksLevel" :percentile="percentile" />
      <Spinner v-else-if="loading" />
      <Spinner v-else />
    </section>
  </div>
</template>
