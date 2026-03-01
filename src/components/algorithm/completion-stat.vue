<script setup lang="ts">
interface Props {
  done: number
  total: number
}

defineProps<Props>()
</script>

<template>
  <span class="font-mono whitespace-nowrap tabular-nums">
    {{ done }}/{{ total }}
  </span>
</template>
