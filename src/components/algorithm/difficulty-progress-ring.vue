<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  label: string
  done: number
  total: number
  color: string
  size?: number
  strokeWidth?: number
}

const props = withDefaults(defineProps<Props>(), {
  size: 22,
  strokeWidth: 3,
})

const progress = computed(() => {
  if (props.total <= 0)
    return 0
  return Math.min(1, Math.max(0, props.done / props.total))
})

const radius = computed(() => (props.size - props.strokeWidth) / 2)
const circumference = computed(() => Math.PI * 2 * radius.value)
const dashOffset = computed(() => circumference.value * (1 - progress.value))
</script>

<template>
  <div class="px-1.5 py-1 rounded-md bg-muted/25 inline-flex gap-1.5 items-center">
    <span class="text-xs text-foreground/60 leading-none shrink-0">{{ label }}</span>
    <span class="text-xs text-foreground/72 leading-none font-mono shrink-0 tabular-nums">{{ done }}/{{ total }}</span>
    <svg
      :width="props.size"
      :height="props.size"
      :viewBox="`0 0 ${props.size} ${props.size}`"
      class="shrink-0"
      aria-hidden="true"
    >
      <circle
        :cx="props.size / 2"
        :cy="props.size / 2"
        :r="radius"
        fill="none"
        stroke="var(--border)"
        stroke-opacity="0.45"
        :stroke-width="props.strokeWidth"
      />
      <circle
        :cx="props.size / 2"
        :cy="props.size / 2"
        :r="radius"
        fill="none"
        :stroke="props.color"
        stroke-linecap="round"
        :stroke-width="props.strokeWidth"
        :stroke-dasharray="circumference"
        :stroke-dashoffset="dashOffset"
        :transform="`rotate(-90 ${props.size / 2} ${props.size / 2})`"
      />
    </svg>
  </div>
</template>
