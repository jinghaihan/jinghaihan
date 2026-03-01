<script setup lang="ts">
import type { AlgorithmProgress, Problem, Topic, TopicGroup } from '@/types'
import { computed, ref } from 'vue'
import Checkbox from './checkbox.vue'
import Collapse from './collapse.vue'
import CompletionStat from './completion-stat.vue'
import ProblemSeq from './problem-seq.vue'

interface Props {
  groups: TopicGroup[]
  problems: Record<string, Problem>
  progress: AlgorithmProgress
}

const props = defineProps<Props>()

const emit = defineEmits<{
  toggleProblem: [problemId: string, checked: boolean]
}>()

const searchKeyword = ref('')
const collapsedGroupIds = ref<Set<string>>(new Set())
const collapsedTopicIds = ref<Set<string>>(new Set())

const normalizedSearchKeyword = computed(() => searchKeyword.value.trim().toLowerCase())

const filteredGroups = computed<TopicGroup[]>(() => {
  const keyword = normalizedSearchKeyword.value
  if (!keyword)
    return props.groups

  const groups: TopicGroup[] = []
  for (const group of props.groups) {
    const groupMatched = group.title.toLowerCase().includes(keyword)
    if (groupMatched) {
      groups.push(group)
      continue
    }

    const matchedTopics = group.topics.filter(topic => topic.title.toLowerCase().includes(keyword))
    if (matchedTopics.length > 0)
      groups.push({ ...group, topics: matchedTopics })
  }

  return groups
})

function isGroupOpen(groupId: string): boolean {
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

function topicDoneCount(topic: Topic): number {
  return topic.problemIds.reduce((count, problemId) => count + Number(isProblemDone(problemId)), 0)
}

function groupDoneCount(group: TopicGroup): number {
  return group.topics.reduce((count, topic) => count + topicDoneCount(topic), 0)
}

function groupTotalCount(group: TopicGroup): number {
  return group.topics.reduce((count, topic) => count + topic.problemIds.length, 0)
}

const overallDoneCount = computed(() => props.groups.reduce((count, group) => count + groupDoneCount(group), 0))
const overallTotalCount = computed(() => props.groups.reduce((count, group) => count + groupTotalCount(group), 0))

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
</script>

<template>
  <section class="text-foreground/80 flex flex-col h-full min-h-0">
    <div class="px-3 py-2.5">
      <div class="flex flex-wrap gap-2.5 items-center">
        <div class="flex-1 max-w-72 min-w-48 relative">
          <i class="i-ri:search-line text-muted-foreground left-2 top-1/2 absolute -translate-y-1/2" />
          <input
            v-model="searchKeyword"
            type="text"
            placeholder="搜索分组或专题"
            class="text-sm py-1.5 pl-8 pr-2 outline-none border border-border/30 rounded-md bg-transparent w-full transition-colors duration-200 placeholder:text-foreground/40 focus:border-border/55"
          >
        </div>
        <CompletionStat
          :done="overallDoneCount"
          :total="overallTotalCount"
          class="text-sm text-foreground/65 ml-auto"
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
