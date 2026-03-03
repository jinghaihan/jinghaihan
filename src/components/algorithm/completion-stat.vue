<script setup lang="ts">
interface Props {
  done: number
  total: number
  selectLabel?: string
  selectTitle?: string
  clearLabel?: string
  clearTitle?: string
  compact?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  selectLabel: '',
  selectTitle: '',
  clearLabel: '',
  clearTitle: '',
  compact: false,
})

const emit = defineEmits<{
  select: []
  clear: []
}>()

function onSelect(): void {
  emit('select')
}

function onClear(): void {
  emit('clear')
}
</script>

<template>
  <span class="group inline-flex items-center justify-center relative">
    <span
      class="font-mono whitespace-nowrap transition-opacity duration-150 tabular-nums"
      :class="(props.clearLabel || props.selectLabel) ? 'group-hover:op0 group-focus-within:op0' : ''"
    >
      {{ done }}/{{ total }}
    </span>
    <span
      v-if="props.clearLabel || props.selectLabel"
      class="op0 inline-flex gap-0.5 pointer-events-none transition-all duration-150 items-center justify-center absolute group-focus-within:op100 group-hover:op100 group-focus-within:pointer-events-auto group-hover:pointer-events-auto"
    >
      <button
        v-if="props.selectLabel"
        type="button"
        :title="props.selectTitle || props.selectLabel"
        :aria-label="props.selectLabel"
        class="text-foreground/45 leading-none inline-flex transition-colors duration-150 items-center justify-center focus-visible:text-green-500/85 hover:text-green-500/85 dark:focus-visible:text-green-400/85 dark:hover:text-green-400/85"
        :class="props.compact ? 'p-0.5 rounded-sm' : 'p-1.5 rounded-md'"
        @click="onSelect"
      >
        <i class="i-ri:check-double-line text-sm block" />
      </button>
      <button
        v-if="props.clearLabel"
        type="button"
        :title="props.clearTitle || props.clearLabel"
        :aria-label="props.clearLabel"
        class="text-foreground/45 leading-none inline-flex transition-colors duration-150 items-center justify-center focus-visible:text-destructive/80 hover:text-destructive/80"
        :class="props.compact ? 'p-0.5 rounded-sm' : 'p-1.5 rounded-md'"
        @click="onClear"
      >
        <i class="i-ri:delete-bin-line text-sm block" />
      </button>
    </span>
  </span>
</template>
