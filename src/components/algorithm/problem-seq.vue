<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  value?: string | null
}

const props = defineProps<Props>()

const display = computed(() => {
  const raw = `${props.value ?? ''}`.trim()
  if (!raw)
    return '0000'

  if (/^\d+$/.test(raw))
    return raw.padStart(4, '0')

  const alphaAndNumber = raw.match(/^([A-Z]+)\s*(\d+)$/i)
  if (alphaAndNumber)
    return `${alphaAndNumber[1]} ${alphaAndNumber[2].padStart(4, '0')}`

  const anyNumber = raw.match(/(\d+)/)
  if (anyNumber)
    return anyNumber[1].padStart(4, '0')

  return raw
})
</script>

<template>
  <span class="text-[12px] text-foreground/58 leading-none font-mono text-right shrink-0 min-w-10 tabular-nums">
    {{ display }}
  </span>
</template>
