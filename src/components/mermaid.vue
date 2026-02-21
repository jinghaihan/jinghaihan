<script setup lang="ts">
import { renderMermaid, THEMES } from 'beautiful-mermaid'

const props = withDefaults(defineProps<{
  code?: string
}>(), {
  code: '',
})

const svg = ref<string>('')
const theme = computed(() => isDark.value ? THEMES['github-dark'] : THEMES['github-light'])

async function render() {
  svg.value = await renderMermaid(props.code, {
    ...theme.value,
    bg: 'var(--background)',
  })
}

onMounted(render)
watch(isDark, render)
</script>

<template>
  <div class="mermaid-container" v-html="svg" />
</template>

<style>
.mermaid-container {
  & svg {
    width: 100%;
  }
}
</style>
