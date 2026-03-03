<script setup lang="ts">
import type { AlgorithmProgress, Difficulty, Problem, Topic, TopicGroup } from '@/types'
import { computed, ref } from 'vue'
import { getAlgorithmDifficultyColor } from '@/constants/algorithm'
import Checkbox from './checkbox.vue'
import Collapse from './collapse.vue'
import CompletionStat from './completion-stat.vue'
import DifficultyFilter from './difficulty-filter.vue'
import InputSearch from './input-search.vue'
import ProblemSeq from './problem-seq.vue'

interface Props {
  groups: TopicGroup[]
  problems: Record<string, Problem>
  progress: AlgorithmProgress
  searchKeyword: string
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'toggleProblem': [problemId: string, checked: boolean]
  'clearGroup': [groupId: string]
  'clearTopic': [topicId: string]
  'clearAll': []
  'update:searchKeyword': [value: string]
}>()

const ALL_DIFFICULTIES: Difficulty[] = ['easy', 'medium', 'hard']

const collapsedGroupIds = ref<Set<string>>(new Set())
const collapsedTopicIds = ref<Set<string>>(new Set())
const selectedDifficulties = ref<Difficulty[]>([...ALL_DIFFICULTIES])

const searchKeywordModel = computed({
  get: () => props.searchKeyword,
  set: (value: string) => emit('update:searchKeyword', value),
})

const normalizedSearchKeyword = computed(() => searchKeywordModel.value.trim().toLowerCase())
const selectedDifficultySet = computed(() => new Set(selectedDifficulties.value))

function matchProblem(problemId: string, keyword: string): boolean {
  const problem = getProblem(problemId)
  if (!problem)
    return problemId.toLowerCase().includes(keyword)

  const problemNumber = (problem.number || problem.id).toLowerCase()
  return problem.title.toLowerCase().includes(keyword)
    || problemNumber.includes(keyword)
    || problem.id.toLowerCase().includes(keyword)
}

function matchProblemDifficulty(problemId: string): boolean {
  const difficulty = getProblem(problemId)?.difficulty
  if (!difficulty)
    return true
  return selectedDifficultySet.value.has(difficulty)
}

const filteredGroups = computed<TopicGroup[]>(() => {
  const keyword = normalizedSearchKeyword.value
  const hasKeyword = Boolean(keyword)

  const groups: TopicGroup[] = []
  for (const group of props.groups) {
    const groupMatched = hasKeyword && group.title.toLowerCase().includes(keyword)

    const matchedTopics: Topic[] = []
    for (const topic of group.topics) {
      const topicMatched = hasKeyword && topic.title.toLowerCase().includes(keyword)
      const matchedProblemIds = topic.problemIds.filter((problemId) => {
        if (!matchProblemDifficulty(problemId))
          return false
        if (!hasKeyword || groupMatched || topicMatched)
          return true
        return matchProblem(problemId, keyword)
      })
      if (matchedProblemIds.length > 0)
        matchedTopics.push({ ...topic, problemIds: matchedProblemIds })
    }

    if (matchedTopics.length > 0)
      groups.push({ ...group, topics: matchedTopics })
  }

  return groups
})

function isGroupOpen(groupId: string): boolean {
  if (normalizedSearchKeyword.value)
    return true
  return !collapsedGroupIds.value.has(groupId)
}

function setGroupOpen(groupId: string, open: boolean): void {
  const next = new Set(collapsedGroupIds.value)
  if (open)
    next.delete(groupId)
  else
    next.add(groupId)
  collapsedGroupIds.value = next
}

function isTopicOpen(topicId: string): boolean {
  if (normalizedSearchKeyword.value)
    return true
  return !collapsedTopicIds.value.has(topicId)
}

function setTopicOpen(topicId: string, open: boolean): void {
  const next = new Set(collapsedTopicIds.value)
  if (open)
    next.delete(topicId)
  else
    next.add(topicId)
  collapsedTopicIds.value = next
}

function getProblem(problemId: string): Problem | undefined {
  return props.problems[problemId]
}

function isProblemDone(problemId: string): boolean {
  return Boolean(props.progress[problemId])
}

function onProblemChange(problemId: string, checked: boolean): void {
  emit('toggleProblem', problemId, checked)
}

function onClearGroup(groupId: string): void {
  emit('clearGroup', groupId)
}

function onClearTopic(topicId: string): void {
  emit('clearTopic', topicId)
}

function onClearAll(): void {
  emit('clearAll')
}

const unresolvedProblemIds = computed(() => {
  const ids: string[] = []
  const seen = new Set<string>()

  for (const group of props.groups) {
    for (const topic of group.topics) {
      for (const problemId of topic.problemIds) {
        if (seen.has(problemId))
          continue
        seen.add(problemId)

        if (!isProblemDone(problemId))
          ids.push(problemId)
      }
    }
  }

  return ids
})

const canRandomOpen = computed(() => unresolvedProblemIds.value.length > 0)

function openRandomProblem(): void {
  const candidates = unresolvedProblemIds.value
  if (candidates.length === 0)
    return

  const randomIndex = Math.floor(Math.random() * candidates.length)
  window.open(problemUrl(candidates[randomIndex]), '_blank', 'noopener,noreferrer')
}

function topicDoneCount(topic: Topic): number {
  return topic.problemIds.reduce((count, problemId) => count + Number(isProblemDone(problemId)), 0)
}

function groupDoneCount(group: TopicGroup): number {
  return group.topics.reduce((count, topic) => count + topicDoneCount(topic), 0)
}

function groupTotalCount(group: TopicGroup): number {
  return group.topics.reduce((count, topic) => count + topic.problemIds.length, 0)
}

const overallDoneCount = computed(() => filteredGroups.value.reduce((count, group) => count + groupDoneCount(group), 0))
const overallTotalCount = computed(() => filteredGroups.value.reduce((count, group) => count + groupTotalCount(group), 0))

function problemLabel(problemId: string): string {
  const problem = getProblem(problemId)
  if (!problem)
    return problemId
  return problem.title
}

function problemNumber(problemId: string): string {
  const problem = getProblem(problemId)
  if (!problem)
    return problemId
  return problem.number || problem.id
}

function problemUrl(problemId: string): string {
  const problem = getProblem(problemId)
  if (!problem)
    return `https://leetcode.cn/problemset/all/?search=${encodeURIComponent(problemId)}`
  return `https://leetcode.cn/problems/${problem.slug}/description/`
}

function problemDifficultyColor(problemId: string): string {
  return getAlgorithmDifficultyColor(getProblem(problemId)?.difficulty)
}
</script>

<template>
  <section class="text-foreground/80 flex flex-col h-full min-h-0">
    <div class="px-3 py-2.5">
      <div class="flex flex-wrap gap-2.5 items-center">
        <InputSearch
          v-model="searchKeywordModel"
          placeholder="搜索分组 / 专题 / 题号 / 题名"
          class="flex-1 min-w-0"
        />
        <DifficultyFilter v-model="selectedDifficulties" />
        <span aria-hidden="true" class="bg-border/40 shrink-0 h-4 w-px" />
        <button
          type="button"
          class="text-sm text-foreground/65 px-2 rounded-md inline-flex gap-1.5 h-8 min-w-8 transition-colors duration-150 items-center hover:text-foreground disabled:op45 disabled:cursor-not-allowed"
          :disabled="!canRandomOpen"
          @click="openRandomProblem"
        >
          <i class="i-ri:shuffle-line" />
          <span class="leading-none font-medium">随机一题</span>
        </button>
        <span aria-hidden="true" class="bg-border/40 shrink-0 h-4 w-px" />
        <CompletionStat
          :done="overallDoneCount"
          :total="overallTotalCount"
          clear-label="清空所有已完成"
          class="text-sm text-foreground/65 ml-auto"
          @clear="onClearAll"
        />
      </div>
    </div>

    <div class="flex-1 min-h-0 overflow-y-auto divide-border/25 divide-y">
      <article
        v-for="group in filteredGroups"
        :key="group.id"
        class="py-1"
      >
        <Collapse
          :open="isGroupOpen(group.id)"
          @update:open="(open) => setGroupOpen(group.id, open)"
        >
          <template #title>
            <span class="text-sm font-semibold truncate">{{ group.title }}</span>
          </template>
          <template #meta>
            <CompletionStat
              :done="groupDoneCount(group)"
              :total="groupTotalCount(group)"
              compact
              clear-label="清空该分组已完成"
              clear-title="清空该分组已完成"
              @clear="onClearGroup(group.id)"
            />
          </template>

          <div class="space-y-1.5 -mt-0.5">
            <Collapse
              v-for="topic in group.topics"
              :key="topic.id"
              :dense="true"
              :open="isTopicOpen(topic.id)"
              @update:open="(open) => setTopicOpen(topic.id, open)"
            >
              <template #title>
                <span class="text-sm text-foreground/80 font-medium">{{ topic.title }}</span>
              </template>
              <template #meta>
                <CompletionStat
                  :done="topicDoneCount(topic)"
                  :total="topic.problemIds.length"
                  compact
                  clear-label="清空该专题已完成"
                  clear-title="清空该专题已完成"
                  @clear="onClearTopic(topic.id)"
                />
              </template>

              <ul class="mt-1.5 space-y-2">
                <li
                  v-for="problemId in topic.problemIds"
                  :key="problemId"
                  class="text-sm flex gap-3 items-center"
                >
                  <Checkbox
                    :id="`problem-${problemId}`"
                    :model-value="isProblemDone(problemId)"
                    @update:model-value="(checked) => onProblemChange(problemId, checked)"
                  />
                  <ProblemSeq :value="problemNumber(problemId)" />
                  <span
                    class="rounded-full shrink-0 h-1.5 w-1.5"
                    :style="{ backgroundColor: problemDifficultyColor(problemId) }"
                  />
                  <a
                    :href="problemUrl(problemId)"
                    target="_blank"
                    rel="noreferrer"
                    class="text-foreground/75 flex-1 min-w-0 truncate transition-colors duration-150 hover:text-foreground hover:underline hover:decoration-foreground/55 hover:underline-offset-3"
                  >
                    {{ problemLabel(problemId) }}
                  </a>
                </li>
              </ul>
            </Collapse>
          </div>
        </Collapse>
      </article>

      <div v-if="filteredGroups.length === 0" class="text-sm text-muted-foreground p-6">
        没有匹配到对应分组或专题
      </div>
    </div>
  </section>
</template>
