<script setup lang="ts">
import { useMediaQuery } from '@vueuse/core'

const isPrinting = useMediaQuery('print')
const isDarkMode = ref(isDark.value)
async function handleExport() {
  isDarkMode.value = isDark.value
  isDark.value = false
  nextTick(() => {
    window.print()
  })
}

watch(
  isPrinting,
  (value) => {
    if (!value)
      isDark.value = isDarkMode.value
  },
)
</script>

<template>
  <div
    id="print-button"
    p-0 flex-center size-8
    class="btn-slate"
    @click="handleExport"
  >
    <i i-tabler:file-download />
  </div>
</template>
