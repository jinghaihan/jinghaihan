<script setup lang="ts">
import type { AlgorithmDifficultyStat, AlgorithmProblemTag, AlgorithmProgress, Difficulty, Topic } from '@/types'
import { computed } from 'vue'
import InputSearch from '@/components/ui/input-search.vue'
import { ALGORITHM_PROBLEM_TAG_ICONS, ALGORITHM_STUDY_PLAN_TITLES } from '@/constants/algorithm'
import CompletionStat from './completion-stat.vue'
import DifficultyFilter from './difficulty-filter.vue'
import DifficultyProgressRing from './difficulty-progress-ring.vue'
import RandomProblemButton from './random-problem-button.vue'
import RecommendTopicPopover from './recommend-topic-popover.vue'

interface Props {
  searchKeyword: string
  selectedDifficulties: Difficulty[]
  selectedProblemTags: AlgorithmProblemTag[]
  topics: Topic[]
  progress: AlgorithmProgress
  selectedTopicIds: string[]
  selectedTopics: Topic[]
  difficultyStats: AlgorithmDifficultyStat[]
  canRandomOpen: boolean
  overallDoneCount: number
  overallTotalCount: number
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'update:searchKeyword': [value: string]
  'update:selectedDifficulties': [value: Difficulty[]]
  'update:selectedProblemTags': [value: AlgorithmProblemTag[]]
  'toggleTopicFilter': [topicId: string]
  'clearTopicFilters': []
  'removeTopicFilter': [topicId: string]
  'openRandomProblem': []
  'selectAll': []
  'clearAll': []
}>()

const searchKeywordModel = computed({
  get: () => props.searchKeyword,
  set: (value: string) => emit('update:searchKeyword', value),
})

const selectedDifficultiesModel = computed({
  get: () => props.selectedDifficulties,
  set: (value: Difficulty[]) => emit('update:selectedDifficulties', value),
})

const selectedProblemTagsModel = computed({
  get: () => props.selectedProblemTags,
  set: (value: AlgorithmProblemTag[]) => emit('update:selectedProblemTags', value),
})

function onToggleTopicFilter(topicId: string): void {
  emit('toggleTopicFilter', topicId)
}

function onClearTopicFilters(): void {
  emit('clearTopicFilters')
}

function onRemoveTopicFilter(topicId: string): void {
  emit('removeTopicFilter', topicId)
}

function onOpenRandomProblem(): void {
  emit('openRandomProblem')
}

function onRemoveProblemTag(tag: AlgorithmProblemTag): void {
  emit('update:selectedProblemTags', props.selectedProblemTags.filter(item => item !== tag))
}

function onClearProblemTags(): void {
  emit('update:selectedProblemTags', [])
}

function onSelectAll(): void {
  emit('selectAll')
}

function onClearAll(): void {
  emit('clearAll')
}
</script>

<template>
  <div class="px-3 py-2.5">
    <div class="flex flex-col gap-2.5 min-w-0 w-full sm:flex-row sm:items-center">
      <InputSearch
        v-model="searchKeywordModel"
        placeholder="搜索分组 / 专题 / 题号 / 题名 / 标签"
        class="min-w-0 w-full sm:flex-1"
      />
      <div class="flex flex-wrap gap-2.5 min-w-0 w-full items-center sm:w-auto">
        <DifficultyFilter
          v-model="selectedDifficultiesModel"
          v-model:selected-problem-tags="selectedProblemTagsModel"
        />
        <span aria-hidden="true" class="bg-border/40 shrink-0 h-4 w-px" />
        <RecommendTopicPopover
          :topics="props.topics"
          :progress="props.progress"
          :selected-topic-ids="props.selectedTopicIds"
          @toggle-topic="onToggleTopicFilter"
          @clear="onClearTopicFilters"
        />
        <span aria-hidden="true" class="bg-border/40 shrink-0 h-4 w-px" />
        <RandomProblemButton :disabled="!props.canRandomOpen" @click="onOpenRandomProblem" />
      </div>
    </div>
    <div class="mt-2 gap-2.5 grid grid-cols-[minmax(0,1fr)_auto] w-full items-center">
      <div class="flex flex-wrap gap-1.5 min-w-0 items-center">
        <DifficultyProgressRing
          v-for="stat in props.difficultyStats"
          :key="stat.difficulty"
          :label="stat.label"
          :done="stat.done"
          :total="stat.total"
          :color="stat.color"
        />
      </div>
      <CompletionStat
        :done="props.overallDoneCount"
        :total="props.overallTotalCount"
        select-label="全部标记为已完成"
        select-title="全部标记为已完成"
        clear-label="清空所有已完成"
        class="text-sm text-foreground/65 shrink-0"
        @select="onSelectAll"
        @clear="onClearAll"
      />
    </div>
    <div
      v-if="props.selectedProblemTags.length > 0 || props.selectedTopics.length > 0"
      class="mt-2 flex flex-wrap gap-1.5 items-center"
    >
      <button
        v-for="tag in props.selectedProblemTags"
        :key="tag"
        type="button"
        class="text-xs text-foreground/70 px-2 py-1 border border-border/45 rounded-md inline-flex gap-1 transition-colors duration-150 items-center hover:text-foreground hover:bg-muted/35"
        @click="onRemoveProblemTag(tag)"
      >
        <i class="size-3" :class="ALGORITHM_PROBLEM_TAG_ICONS[tag]" />
        <span>{{ ALGORITHM_STUDY_PLAN_TITLES[tag] }}</span>
        <i class="i-ri:close-line text-[11px]" />
      </button>
      <button
        v-for="topic in props.selectedTopics"
        :key="topic.id"
        type="button"
        class="text-xs text-foreground/70 px-2 py-1 border border-border/45 rounded-md inline-flex gap-1 transition-colors duration-150 items-center hover:text-foreground hover:bg-muted/35"
        @click="onRemoveTopicFilter(topic.id)"
      >
        <span>{{ topic.title }}</span>
        <i class="i-ri:close-line text-[11px]" />
      </button>
      <button
        v-if="props.selectedProblemTags.length > 0"
        type="button"
        class="text-xs text-foreground/55 transition-colors duration-150 hover:text-foreground"
        @click="onClearProblemTags"
      >
        清空标签过滤
      </button>
      <button
        v-if="props.selectedTopics.length > 0"
        type="button"
        class="text-xs text-foreground/55 transition-colors duration-150 hover:text-foreground"
        @click="onClearTopicFilters"
      >
        清空专题过滤
      </button>
    </div>
  </div>
</template>
