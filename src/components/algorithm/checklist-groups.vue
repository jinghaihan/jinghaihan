<script setup lang="ts">
import type { AlgorithmProblemTag, AlgorithmProgress, Problem, Topic, TopicGroup } from '@/types'
import { ref } from 'vue'
import Checkbox from '@/components/ui/checkbox.vue'
import Collapse from '@/components/ui/collapse.vue'
import { ALGORITHM_PROBLEM_TAG_LABELS, ALGORITHM_PROBLEM_TAG_ORDER, getAlgorithmDifficultyColor } from '@/constants/algorithm'
import CompletionStat from './completion-stat.vue'
import ProblemSeq from './problem-seq.vue'

interface Props {
  groups: TopicGroup[]
  problems: Record<string, Problem>
  progress: AlgorithmProgress
  forceOpen: boolean
  isProblemDone: (problemId: string) => boolean
  topicDoneCount: (topic: Topic) => number
  groupDoneCount: (group: TopicGroup) => number
  groupTotalCount: (group: TopicGroup) => number
}

const props = defineProps<Props>()

const emit = defineEmits<{
  toggleProblem: [problemId: string, checked: boolean]
  selectGroup: [groupId: string]
  clearGroup: [groupId: string]
  selectTopic: [topicId: string]
  clearTopic: [topicId: string]
}>()

const ALGORITHM_PROBLEM_TAG_ICONS: Record<AlgorithmProblemTag, string> = {
  hot100: 'i-ri:fire-fill text-red-500/90',
  interview150: 'i-ri:trophy-fill text-amber-500/90',
}

const collapsedGroupIds = ref<Set<string>>(new Set())
const collapsedTopicIds = ref<Set<string>>(new Set())

function isGroupOpen(groupId: string): boolean {
  if (props.forceOpen)
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
  if (props.forceOpen)
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

function onProblemChange(problemId: string, checked: boolean): void {
  emit('toggleProblem', problemId, checked)
}

function onSelectGroup(groupId: string): void {
  emit('selectGroup', groupId)
}

function onClearGroup(groupId: string): void {
  emit('clearGroup', groupId)
}

function onSelectTopic(topicId: string): void {
  emit('selectTopic', topicId)
}

function onClearTopic(topicId: string): void {
  emit('clearTopic', topicId)
}

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

function problemTags(problemId: string): AlgorithmProblemTag[] {
  const tags = getProblem(problemId)?.tags ?? []
  return ALGORITHM_PROBLEM_TAG_ORDER.filter(tag => tags.includes(tag))
}
</script>

<template>
  <div class="flex-1 min-h-0 overflow-y-auto divide-border/25 divide-y">
    <article
      v-for="group in props.groups"
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
            :done="props.groupDoneCount(group)"
            :total="props.groupTotalCount(group)"
            compact
            select-label="标记该分组全部完成"
            select-title="标记该分组全部完成"
            clear-label="清空该分组已完成"
            clear-title="清空该分组已完成"
            @select="onSelectGroup(group.id)"
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
                :done="props.topicDoneCount(topic)"
                :total="topic.problemIds.length"
                compact
                select-label="标记该专题全部完成"
                select-title="标记该专题全部完成"
                clear-label="清空该专题已完成"
                clear-title="清空该专题已完成"
                @select="onSelectTopic(topic.id)"
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
                  :model-value="props.isProblemDone(problemId)"
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
                  class="text-foreground/75 flex-1 min-w-0 transition-colors duration-150 hover:text-foreground hover:underline hover:decoration-foreground/55 hover:underline-offset-3"
                >
                  <span class="flex gap-1.5 min-w-0 items-center">
                    <span class="block truncate">{{ problemLabel(problemId) }}</span>
                    <span v-if="problemTags(problemId).length > 0" class="flex shrink-0 gap-1 items-center">
                      <i
                        v-for="tag in problemTags(problemId)"
                        :key="`${problemId}-${tag}`"
                        class="size-3.5"
                        :class="ALGORITHM_PROBLEM_TAG_ICONS[tag]"
                        :title="ALGORITHM_PROBLEM_TAG_LABELS[tag]"
                        :aria-label="ALGORITHM_PROBLEM_TAG_LABELS[tag]"
                      />
                    </span>
                  </span>
                </a>
              </li>
            </ul>
          </Collapse>
        </div>
      </Collapse>
    </article>

    <div v-if="props.groups.length === 0" class="text-sm text-muted-foreground p-6">
      没有匹配到对应分组或专题
    </div>
  </div>
</template>
