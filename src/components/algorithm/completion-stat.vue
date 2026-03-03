<script setup lang="ts">
interface Props {
  done: number
  total: number
  clearLabel?: string
  clearTitle?: string
  compact?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  clearLabel: '',
  clearTitle: '',
  compact: false,
})

const emit = defineEmits<{
  clear: []
}>()

function onClear(): void {
  emit('clear')
}
</script>

<template>
  <span class="group inline-flex items-center justify-center relative">
    <span
      class="font-mono whitespace-nowrap transition-opacity duration-150 tabular-nums"
      :class="props.clearLabel ? 'group-hover:op0 group-focus-within:op0' : ''"
    >
      {{ done }}/{{ total }}
    </span>
    <button
      v-if="props.clearLabel"
      type="button"
      :title="props.clearTitle || props.clearLabel"
      :aria-label="props.clearLabel"
      class="text-foreground/45 leading-none op0 inline-flex pointer-events-none transition-all duration-150 items-center justify-center absolute focus-visible:text-destructive/80 hover:text-destructive/80 group-focus-within:op100 group-hover:op100 group-focus-within:pointer-events-auto group-hover:pointer-events-auto"
      :class="props.compact ? 'p-0.5 rounded-sm' : 'p-1.5 rounded-md'"
      @click="onClear"
    >
      <i class="i-ri:delete-bin-line text-sm block" />
    </button>
  </span>
</template>
