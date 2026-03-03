<script setup lang="ts">
import { computed } from 'vue'
import { nameToTitle } from '@/utils'

const props = defineProps<{
  name: string
  description: string
  url?: string
}>()

const title = computed(() => nameToTitle(props.name))
const githubLink = computed(() => `https://github.com/jinghaihan/${props.name}`)
</script>

<template>
  <a
    class="text-foreground/85 flex gap-4 cursor-pointer transition-colors duration-200 hover:text-foreground"
    :href="url || githubLink"
    target="_blank"
    rel="noopener"
  >
    <div class="flex-auto">
      <div class="text-normal text-foreground/85">
        {{ title }}
      </div>
      <div class="text-sm text-muted-foreground/75 font-normal">
        {{ description }}
      </div>
    </div>
  </a>
</template>
