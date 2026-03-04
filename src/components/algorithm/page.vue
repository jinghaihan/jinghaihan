<script setup lang="ts">
import type { AlgorithmProgress, TopicGroup } from '@/types'
import { useLocalStorage } from '@vueuse/core'
import { computed, ref } from 'vue'
import { ALGORITHM_KNOWLEDGE, ALGORITHM_RELATIONS } from '@/constants/algorithm'
import ChecklistPanel from './checklist-panel.vue'
import KnowledgeGraph from './knowledge-graph.vue'

const PROGRESS_STORAGE_KEY = 'algorithm-checklist-progress-v1'
const UNGROUPED_ID = '__ungrouped__'
const UNGROUPED_TITLE = '其他专题'

const progress = useLocalStorage<AlgorithmProgress>(PROGRESS_STORAGE_KEY, {}, {
  mergeDefaults: true,
})
const searchKeyword = ref('')

progress.value = normalizeProgress(progress.value)

const topicGroups = computed<TopicGroup[]>(() => {
  const grouped = ALGORITHM_KNOWLEDGE.groups
    .map(group => ({
      id: group.id,
      title: group.title,
      topics: ALGORITHM_KNOWLEDGE.topics.filter(topic => topic.groupId === group.id),
    }))
    .filter(group => group.topics.length > 0)

  const ungroupedTopics = ALGORITHM_KNOWLEDGE.topics.filter(topic => !topic.groupId)
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

function clearGroupProgress(groupId: string): void {
  const group = topicGroups.value.find(item => item.id === groupId)
  if (!group)
    return

  const next: AlgorithmProgress = { ...progress.value }
  for (const topic of group.topics) {
    for (const problemId of topic.problemIds)
      delete next[problemId]
  }
  progress.value = next
}

function selectGroupProgress(groupId: string): void {
  const group = topicGroups.value.find(item => item.id === groupId)
  if (!group)
    return

  const next: AlgorithmProgress = { ...progress.value }
  for (const topic of group.topics) {
    for (const problemId of topic.problemIds)
      next[problemId] = true
  }
  progress.value = next
}

function clearTopicProgress(topicId: string): void {
  const topic = ALGORITHM_KNOWLEDGE.topics.find(item => item.id === topicId)
  if (!topic)
    return

  const next: AlgorithmProgress = { ...progress.value }
  for (const problemId of topic.problemIds)
    delete next[problemId]
  progress.value = next
}

function selectTopicProgress(topicId: string): void {
  const topic = ALGORITHM_KNOWLEDGE.topics.find(item => item.id === topicId)
  if (!topic)
    return

  const next: AlgorithmProgress = { ...progress.value }
  for (const problemId of topic.problemIds)
    next[problemId] = true
  progress.value = next
}

function clearAllProgress(): void {
  progress.value = {}
}

function selectAllProgress(): void {
  const next: AlgorithmProgress = { ...progress.value }
  for (const group of topicGroups.value) {
    for (const topic of group.topics) {
      for (const problemId of topic.problemIds)
        next[problemId] = true
    }
  }
  progress.value = next
}

function updateSearchKeyword(value: string): void {
  searchKeyword.value = value
}

function selectGraphNode(label: string): void {
  searchKeyword.value = label.trim()
}

function normalizeProgress(value: unknown): AlgorithmProgress {
  if (!value || typeof value !== 'object')
    return {}

  const normalized: AlgorithmProgress = {}
  for (const [problemId, done] of Object.entries(value as Record<string, unknown>)) {
    if (done === true)
      normalized[problemId] = true
  }
  return normalized
}
</script>

<template>
  <div class="px-3 pb-3 size-full min-h-0 lg:px-5 sm:px-4 lg:pb-3 sm:pb-4">
    <div class="gap-3 grid grid-rows-[minmax(0,1.35fr)_minmax(0,0.65fr)] h-full min-h-0 lg:gap-4 lg:grid-cols-[minmax(0,0.82fr)_minmax(0,1.18fr)] lg:grid-rows-1">
      <section class="min-h-0">
        <ChecklistPanel
          :groups="topicGroups"
          :topics="ALGORITHM_KNOWLEDGE.topics"
          :problems="ALGORITHM_KNOWLEDGE.problems"
          :progress="progress"
          :search-keyword="searchKeyword"
          @update:search-keyword="updateSearchKeyword"
          @select-group="selectGroupProgress"
          @select-topic="selectTopicProgress"
          @select-all="selectAllProgress"
          @clear-group="clearGroupProgress"
          @clear-topic="clearTopicProgress"
          @clear-all="clearAllProgress"
          @toggle-problem="toggleProblem"
        />
      </section>

      <section class="min-h-0">
        <KnowledgeGraph
          :groups="topicGroups"
          :topics="ALGORITHM_KNOWLEDGE.topics"
          :problems="ALGORITHM_KNOWLEDGE.problems"
          :relations="ALGORITHM_RELATIONS"
          @node-select="selectGraphNode"
        />
      </section>
    </div>
  </div>
</template>
