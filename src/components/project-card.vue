<script setup lang="ts">
import { nameToTitle } from '@/utils'

const props = defineProps<{
  name: string
  description: string
}>()

const title = computed(() => nameToTitle(props.name))
const githubLink = computed(() => `https://github.com/jinghaihan/${props.name}`)
</script>

<template>
  <a
    op75 flex gap-4 cursor-pointer transition-opacity duration-200 hover:op100
    :href="githubLink"
    target="_blank"
    rel="noopener"
  >
    <div flex-auto>
      <div text-normal op75>
        {{ title }}
      </div>
      <div text-sm font-normal op50>
        {{ description }}
      </div>
    </div>
  </a>
</template>
