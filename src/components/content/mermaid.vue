<script setup lang="ts">
import { renderMermaid, THEMES } from 'beautiful-mermaid'
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'

const props = withDefaults(defineProps<{
  code?: string
}>(), {
  code: '',
})

const svg = ref<string>('')
const isDark = ref(false)
let classObserver: MutationObserver | null = null

const theme = computed(() => isDark.value ? THEMES['github-dark'] : THEMES['github-light'])

async function render() {
  svg.value = await renderMermaid(props.code, {
    ...theme.value,
    bg: 'var(--background)',
  })
}

function updateDarkState() {
  isDark.value = document.documentElement.classList.contains('dark')
}

onMounted(() => {
  updateDarkState()
  render()

  classObserver = new MutationObserver(() => {
    const previous = isDark.value
    updateDarkState()
    if (previous !== isDark.value)
      render()
  })
  classObserver.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['class'],
  })
})

onBeforeUnmount(() => {
  classObserver?.disconnect()
})
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
