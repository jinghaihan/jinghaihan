<script setup lang="ts">
const props = withDefaults(defineProps<{
  path?: string
}>(), {
  path: '',
})

const currentPath = computed(() => {
  if (props.path)
    return props.path
  if (typeof window !== 'undefined')
    return window.location.pathname
  return '/'
})

const parentPath = computed(() => currentPath.value.split('/').slice(0, -1).join('/') || '/')
</script>

<template>
  <div class="prose">
    <span font-mono op50>> </span>
    <a
      :href="parentPath"
      class="font-mono op50 hover:op75"
    >
      cd..
    </a>
  </div>
</template>
