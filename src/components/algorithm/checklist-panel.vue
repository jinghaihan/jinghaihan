<script setup lang="ts">
import type { AlgorithmProgress, Difficulty, Problem, Topic, TopicGroup } from '@/types'
import { computed, ref, toRef } from 'vue'
import { useChecklistFiltering } from '@/composables/use-algorithm-filter'
import { useChecklistProgressStats } from '@/composables/use-algorithm-progress-stats'
import ChecklistGroups from './checklist-groups.vue'
import ChecklistToolbar from './checklist-toolbar.vue'

interface Props {
  groups: TopicGroup[]
  topics: Topic[]
  problems: Record<string, Problem>
  progress: AlgorithmProgress
  searchKeyword: string
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'toggleProblem': [problemId: string, checked: boolean]
  'selectGroup': [groupId: string]
  'selectTopic': [topicId: string]
  'selectAll': []
  'clearGroup': [groupId: string]
  'clearTopic': [topicId: string]
  'clearAll': []
  'update:searchKeyword': [value: string]
}>()

const ALL_DIFFICULTIES: Difficulty[] = ['easy', 'medium', 'hard']

const selectedDifficulties = ref<Difficulty[]>([...ALL_DIFFICULTIES])
const selectedTopicIds = ref<string[]>([])

const searchKeywordModel = computed({
  get: () => props.searchKeyword,
  set: (value: string) => emit('update:searchKeyword', value),
})

const {
  filteredGroups,
  selectedTopics,
  hasTopicFilters,
  removeTopicFilter,
  toggleTopicFilter,
  clearTopicFilters,
} = useChecklistFiltering({
  groups: toRef(props, 'groups'),
  topics: toRef(props, 'topics'),
  problems: toRef(props, 'problems'),
  searchKeyword: searchKeywordModel,
  selectedDifficulties,
  selectedTopicIds,
})

const {
  isProblemDone,
  topicDoneCount,
  groupDoneCount,
  groupTotalCount,
  overallDoneCount,
  overallTotalCount,
  difficultyStats,
  canRandomOpen,
  openRandomProblem,
} = useChecklistProgressStats({
  filteredGroups,
  progress: toRef(props, 'progress'),
  problems: toRef(props, 'problems'),
})

const forceOpen = computed(() => searchKeywordModel.value.trim().length > 0 || hasTopicFilters.value)

function onProblemChange(problemId: string, checked: boolean): void {
  emit('toggleProblem', problemId, checked)
}

function onClearGroup(groupId: string): void {
  emit('clearGroup', groupId)
}

function onSelectGroup(groupId: string): void {
  emit('selectGroup', groupId)
}

function onClearTopic(topicId: string): void {
  emit('clearTopic', topicId)
}

function onSelectTopic(topicId: string): void {
  emit('selectTopic', topicId)
}

function onClearAll(): void {
  emit('clearAll')
}

function onSelectAll(): void {
  emit('selectAll')
}
</script>

<template>
  <section class="text-foreground/80 flex flex-col h-full min-h-0">
    <ChecklistToolbar
      v-model:search-keyword="searchKeywordModel"
      v-model:selected-difficulties="selectedDifficulties"
      :topics="props.topics"
      :progress="props.progress"
      :selected-topic-ids="selectedTopicIds"
      :selected-topics="selectedTopics"
      :difficulty-stats="difficultyStats"
      :can-random-open="canRandomOpen"
      :overall-done-count="overallDoneCount"
      :overall-total-count="overallTotalCount"
      @toggle-topic-filter="toggleTopicFilter"
      @clear-topic-filters="clearTopicFilters"
      @remove-topic-filter="removeTopicFilter"
      @open-random-problem="openRandomProblem"
      @select-all="onSelectAll"
      @clear-all="onClearAll"
    />

    <ChecklistGroups
      :groups="filteredGroups"
      :problems="props.problems"
      :progress="props.progress"
      :force-open="forceOpen"
      :is-problem-done="isProblemDone"
      :topic-done-count="topicDoneCount"
      :group-done-count="groupDoneCount"
      :group-total-count="groupTotalCount"
      @toggle-problem="onProblemChange"
      @select-group="onSelectGroup"
      @clear-group="onClearGroup"
      @select-topic="onSelectTopic"
      @clear-topic="onClearTopic"
    />
  </section>
</template>
