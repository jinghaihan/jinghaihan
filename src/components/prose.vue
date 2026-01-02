<script setup lang="ts">
import { formatDate } from '@/utils'

const { frontmatter } = defineProps({
  frontmatter: {
    type: Object,
    required: true,
  },
})

const route = useRoute()
</script>

<template>
  <div m-auto mb-8 class="prose">
    <h1 mb-0>
      {{ frontmatter.display || frontmatter.title }}
    </h1>

    <p
      v-if="frontmatter.subtitle"
      opacity-50
      class="!-mt-0.5"
    >
      {{ frontmatter.subtitle }}
    </p>

    <p
      v-if="frontmatter.date"
      op50
      class="!-mt-0.5"
    >
      {{ formatDate(frontmatter.date, false) }} <span v-if="frontmatter.duration">· {{ frontmatter.duration }}</span>
    </p>

    <article>
      <slot />
    </article>

    <Back v-if="route.path !== '/'" />
  </div>
</template>
