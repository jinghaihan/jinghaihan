<script setup lang="ts">
import type { AlgorithmProblemTag, Difficulty } from '@/types'
import { computed } from 'vue'
import { useFloatingPanel } from '@/composables/use-floating-panel'
import {
  ALGORITHM_PROBLEM_TAG_ICONS,
  ALGORITHM_PROBLEM_TAG_ORDER,
  ALGORITHM_STUDY_PLAN_TITLES,
  getAlgorithmDifficultyColor,
} from '@/constants/algorithm'

interface Props {
  modelValue: Difficulty[]
  selectedProblemTags: AlgorithmProblemTag[]
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'update:modelValue': [value: Difficulty[]]
  'update:selectedProblemTags': [value: AlgorithmProblemTag[]]
}>()

const ALL_DIFFICULTIES: Difficulty[] = ['easy', 'medium', 'hard']

const DIFFICULTY_LABEL: Record<Difficulty, string> = {
  easy: '简单',
  medium: '中等',
  hard: '困难',
}

const {
  open,
  floatingStyles,
  toggle: toggleOpen,
  ...panel
} = useFloatingPanel({
  placement: 'bottom-end',
  offset: 8,
  shiftPadding: 8,
})

const selectedSet = computed(() => new Set(props.modelValue))
const selectedTagSet = computed(() => new Set(props.selectedProblemTags))
const isDifficultyActive = computed(() => props.modelValue.length > 0 && props.modelValue.length < ALL_DIFFICULTIES.length)
const isTagActive = computed(() => props.selectedProblemTags.length > 0)
const isActive = computed(() => isDifficultyActive.value || isTagActive.value)
const selectedCount = computed(() => props.modelValue.length + props.selectedProblemTags.length)

function normalizeDifficulties(values: Difficulty[]): Difficulty[] {
  const set = new Set(values)
  return ALL_DIFFICULTIES.filter(item => set.has(item))
}

function updateValue(values: Difficulty[]): void {
  emit('update:modelValue', normalizeDifficulties(values))
}

function toggleDifficulty(difficulty: Difficulty): void {
  const next = new Set(props.modelValue)
  if (next.has(difficulty))
    next.delete(difficulty)
  else
    next.add(difficulty)

  updateValue(Array.from(next))
}

function toggleProblemTag(tag: AlgorithmProblemTag): void {
  const next = new Set(props.selectedProblemTags)
  if (next.has(tag))
    next.delete(tag)
  else
    next.add(tag)

  emit('update:selectedProblemTags', ALGORITHM_PROBLEM_TAG_ORDER.filter(item => next.has(item)))
}

function resetFilters(): void {
  updateValue(ALL_DIFFICULTIES)
  emit('update:selectedProblemTags', [])
}
</script>

<template>
  <div class="shrink-0 relative">
    <button
      :ref="panel.referenceRef"
      type="button"
      aria-label="按条件过滤"
      :aria-expanded="open ? 'true' : 'false'"
      class="text-sm text-foreground/65 px-2 rounded-md inline-flex gap-1.5 h-8 min-w-8 transition-colors duration-150 items-center hover:text-foreground"
      :class="isActive ? 'text-foreground' : ''"
      @click="toggleOpen"
    >
      <i class="i-ri:filter-2-line" />
      <span class="leading-none font-mono tabular-nums">{{ selectedCount }}</span>
    </button>

    <div
      v-if="open"
      :ref="panel.floatingRef"
      :style="floatingStyles"
      class="border border-border/55 rounded-md bg-background min-w-52 shadow-sm z-50 overflow-hidden"
    >
      <div class="px-3 py-2 border-b border-border/35 bg-background flex gap-2 items-center">
        <span class="text-xs text-foreground/60">筛选条件</span>
        <button
          v-if="isActive"
          type="button"
          class="text-xs text-foreground/55 ml-auto transition-colors duration-150 hover:text-foreground"
          @click="resetFilters"
        >
          重置
        </button>
      </div>

      <div class="p-2">
        <div class="text-[11px] text-foreground/45 tracking-[0.08em] px-2 pb-1 uppercase">
          难度
        </div>
        <button
          v-for="difficulty in ALL_DIFFICULTIES"
          :key="difficulty"
          type="button"
          class="text-sm px-2 py-1.5 rounded-md flex gap-2 w-full transition-colors duration-150 items-center hover:bg-muted/45"
          @click="toggleDifficulty(difficulty)"
        >
          <span class="rounded-full shrink-0 h-2 w-2" :style="{ backgroundColor: getAlgorithmDifficultyColor(difficulty) }" />
          <span>{{ DIFFICULTY_LABEL[difficulty] }}</span>
          <i
            class="i-ri:check-line text-xs ml-auto"
            :class="selectedSet.has(difficulty) ? 'op100 text-foreground/80' : 'op0'"
          />
        </button>
      </div>

      <div class="mx-2 bg-border/35 h-px" />

      <div class="p-2">
        <div class="text-[11px] text-foreground/45 tracking-[0.08em] px-2 pb-1 uppercase">
          题单标签
        </div>
        <button
          v-for="tag in ALGORITHM_PROBLEM_TAG_ORDER"
          :key="tag"
          type="button"
          class="text-sm px-2 py-1.5 rounded-md flex gap-2 w-full transition-colors duration-150 items-center hover:bg-muted/45"
          @click="toggleProblemTag(tag)"
        >
          <i class="shrink-0 size-3.5" :class="ALGORITHM_PROBLEM_TAG_ICONS[tag]" />
          <span>{{ ALGORITHM_STUDY_PLAN_TITLES[tag] }}</span>
          <i
            class="i-ri:check-line text-xs ml-auto"
            :class="selectedTagSet.has(tag) ? 'op100 text-foreground/80' : 'op0'"
          />
        </button>
      </div>
    </div>
  </div>
</template>
