<script setup lang="ts">
import type { Component } from 'vue'

const props = defineProps<{
  slug: string
}>()

const markdownModules = import.meta.glob('@/markdown/posts/*.mdv', {
  eager: true,
}) as Record<string, { default: Component }>

const componentKey = computed(() => {
  return `/src/markdown/posts/${props.slug}.mdv`
})

const postComponent = computed(() => {
  return markdownModules[componentKey.value]?.default || null
})
</script>

<template>
  <component :is="postComponent" v-if="postComponent" />
</template>
