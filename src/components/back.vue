<script setup lang="ts">
const route = useRoute()
</script>

<template>
  <div class="prose">
    <span font-mono op50>> </span>
    <RouterLink
      :to="route.path.split('/').slice(0, -1).join('/') || '/'"
      class="font-mono op50 hover:op75"
    >
      cd..
    </RouterLink>
  </div>
</template>
