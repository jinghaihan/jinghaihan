<script setup lang="ts">
import type { AlgorithmProgress, TopicGroup } from '@/types'
import { computed, onMounted, ref, watch } from 'vue'
import { ALGORITHM_RELATIONS, ALGORITHM_ROADMAP } from '@/constants/algorithm'
import ChecklistPanel from './checklist-panel.vue'
import KnowledgeGraph from './knowledge-graph.vue'

const PROGRESS_STORAGE_KEY = 'algorithm-checklist-progress-v1'
const UNGROUPED_ID = '__ungrouped__'
const UNGROUPED_TITLE = '独立专题'

const progress = ref<AlgorithmProgress>({})

const topicGroups = computed<TopicGroup[]>(() => {
  const grouped = ALGORITHM_ROADMAP.groups
    .map(group => ({
      id: group.id,
      title: group.title,
      topics: ALGORITHM_ROADMAP.topics.filter(topic => topic.groupId === group.id),
    }))
    .filter(group => group.topics.length > 0)

  const ungroupedTopics = ALGORITHM_ROADMAP.topics.filter(topic => !topic.groupId)
  if (ungroupedTopics.length > 0) {
    grouped.push({
      id: UNGROUPED_ID,
      title: UNGROUPED_TITLE,
      topics: ungroupedTopics,
    })
  }

  return grouped
})

function toggleProblem(problemId: string, checked: boolean): void {
  const next: AlgorithmProgress = { ...progress.value }
  if (checked)
    next[problemId] = true
  else
    delete next[problemId]
  progress.value = next
}

function restoreProgress(): void {
  const value = localStorage.getItem(PROGRESS_STORAGE_KEY)
  if (!value)
    return

  try {
    const parsed = JSON.parse(value)
    if (parsed && typeof parsed === 'object') {
      const normalized: AlgorithmProgress = {}
      for (const [problemId, done] of Object.entries(parsed as Record<string, unknown>)) {
        if (done)
          normalized[problemId] = true
      }
      progress.value = normalized
    }
  }
  catch {
    progress.value = {}
  }
}

onMounted(() => {
  restoreProgress()
})

watch(progress, (value) => {
  localStorage.setItem(PROGRESS_STORAGE_KEY, JSON.stringify(value))
}, { deep: true })
</script>

<template>
  <div class="p-3 size-full min-h-0 lg:p-5 sm:p-4">
    <div class="gap-3 grid h-full min-h-0 lg:gap-4 lg:grid-cols-[minmax(0,0.82fr)_minmax(0,1.18fr)]">
      <section class="min-h-0">
        <ChecklistPanel
          :groups="topicGroups"
          :problems="ALGORITHM_ROADMAP.problems"
          :progress="progress"
          @toggle-problem="toggleProblem"
        />
      </section>

      <section class="min-h-0">
        <KnowledgeGraph
          :groups="topicGroups"
          :topics="ALGORITHM_ROADMAP.topics"
          :relations="ALGORITHM_RELATIONS"
        />
      </section>
    </div>
  </div>
</template>
