<script setup lang="ts">
import { useIntersectionObserver } from '@vueuse/core'
import { onBeforeUnmount, onMounted, ref, useTemplateRef } from 'vue'

const props = withDefaults(defineProps<{
  rank?: string
  percentile?: number
}>(), {
  rank: 'C',
  percentile: 0,
})

const chartRef = useTemplateRef<HTMLDivElement>('chartRef')

const size = 130
const stroke = 10
const radius = (size - stroke) / 2
const center = size / 2
const circumference = 2 * Math.PI * radius
const offset = ref(circumference)

const colors = ref<{
  background: string
  progress: string
}>({
  background: '',
  progress: '',
})

const { stop } = useIntersectionObserver(chartRef, ([{ isIntersecting }]) => {
  if (isIntersecting) {
    render()
    stop()
  }
})
let classObserver: MutationObserver | null = null

function render() {
  requestAnimationFrame(() => {
    offset.value = circumference * (props.percentile / 100)
  })
}

function getColors() {
  const computedStyle = window.getComputedStyle(document.body)
  colors.value.background = computedStyle.getPropertyValue('--muted')
  colors.value.progress = computedStyle.getPropertyValue('--primary')
}

onMounted(() => {
  getColors()

  classObserver = new MutationObserver(() => {
    getColors()
  })
  classObserver.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['class'],
  })
})

onBeforeUnmount(() => {
  classObserver?.disconnect()
  stop()
})
</script>

<template>
  <div
    ref="chartRef"
    class="flex h-full items-center justify-center relative"
    :style="{ width: `${size}px` }"
  >
    <svg
      :width="size"
      :height="size"
      class="block"
    >
      <circle
        :cx="center"
        :cy="center"
        :r="radius"
        fill="none"
        :stroke="colors.background"
        :stroke-width="stroke"
      />

      <circle
        :cx="center"
        :cy="center"
        :r="radius"
        fill="none"
        :stroke="colors.progress"
        :stroke-width="stroke"
        stroke-linecap="round"
        :stroke-dasharray="circumference"
        :stroke-dashoffset="offset"
        class="transition-[stroke-dashoffset] origin-center duration-700 ease-out -rotate-90"
      />
    </svg>

    <div class="text-4xl font-bold flex items-center inset-0 justify-center absolute">
      {{ rank }}
    </div>
  </div>
</template>
