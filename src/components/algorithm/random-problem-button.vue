<script setup lang="ts">
interface Props {
  disabled?: boolean
}

withDefaults(defineProps<Props>(), {
  disabled: false,
})

const emit = defineEmits<{
  click: []
}>()

function onClick(): void {
  emit('click')
}
</script>

<template>
  <button
    type="button"
    :disabled="disabled"
    class="text-sm text-foreground/65 px-2 rounded-md inline-flex gap-1.5 h-8 min-w-8 transition-colors duration-150 items-center hover:text-foreground disabled:op45 disabled:cursor-not-allowed"
    @click="onClick"
  >
    <i class="i-ri:shuffle-line" />
    <span class="leading-none font-medium">随机一题</span>
  </button>
</template>
