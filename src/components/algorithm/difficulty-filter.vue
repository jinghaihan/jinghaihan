<script setup lang="ts">
import type { Difficulty } from '@/types'
import { computed } from 'vue'
import { useFloatingPanel } from '@/composables/use-floating-panel'
import { getAlgorithmDifficultyColor } from '@/constants/algorithm'

interface Props {
  modelValue: Difficulty[]
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'update:modelValue': [value: Difficulty[]]
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
const isActive = computed(() => props.modelValue.length > 0 && props.modelValue.length < ALL_DIFFICULTIES.length)
const selectedCount = computed(() => props.modelValue.length)

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
</script>

<template>
  <div class="shrink-0 relative">
    <button
      :ref="panel.referenceRef"
      type="button"
      aria-label="按难度过滤"
      :aria-expanded="open ? 'true' : 'false'"
      class="text-foreground/65 px-2 rounded-md inline-flex gap-1.5 h-8 min-w-8 transition-colors duration-150 items-center hover:text-foreground"
      :class="isActive ? 'text-foreground' : ''"
      @click="toggleOpen"
    >
      <i class="i-ri:filter-2-line text-sm" />
      <span class="text-[11px] leading-none font-mono tabular-nums">{{ selectedCount }}</span>
    </button>

    <div
      v-if="open"
      :ref="panel.floatingRef"
      :style="floatingStyles"
      class="p-2 border border-border/55 rounded-md bg-background min-w-34 shadow-sm z-50"
    >
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
  </div>
</template>
