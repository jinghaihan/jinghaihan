<script setup lang="ts">
import { formatNumber } from '@/utils'
import RankChart from './rank-chart.vue'

const store = useGitHubStatsStore()

const stargazers = computed((): number => store.stats?.repositories.totalStargazers ?? 0)
const commits = computed((): number => store.stats?.commits ?? 0)
const prs = computed((): number => store.stats?.pullRequest.totalCount ?? 0)
const issues = computed((): number => store.stats?.issues.totalCount ?? 0)
const contributed = computed((): number => store.stats?.repositoriesContributedTo ?? 0)

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

const ranksLevel = computed((): string => store.stats?.rank.level ?? 'C')
const percentile = computed((): number => store.stats?.rank.percentile ?? 0)
</script>

<template>
  <div class="prose" flex gap-6 lg:gap-12>
    <section flex flex-col gap-1>
      <a
        v-for="stat in basicStats"
        :key="stat.name"
        flex gap-2 cursor-pointer items-center
        target="_blank"
        rel="noopener"
        :href="stat.href"
      >
        <i :class="[stat.icon]" mb-0.5 />
        <span op-75 w-28>
          {{ stat.name }}:
        </span>
        <span>{{ stat.value }}</span>
      </a>
    </section>

    <section>
      <RankChart v-if="percentile" :rank="ranksLevel" :percentile="percentile" />
      <Spinner v-else />
    </section>
  </div>
</template>
