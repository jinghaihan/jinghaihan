<script setup lang="ts">
import type { Zoom } from 'medium-zoom'
import mediumZoom from 'medium-zoom'
import { formatDate } from '@/utils'

const { frontmatter } = defineProps({
  frontmatter: {
    type: Object,
    required: true,
  },
})

const route = useRoute()
const isAboutPage = computed(() => route.path === '/')

const zoom = shallowRef<Zoom>()
onMounted(() => {
  zoom.value = mediumZoom('[data-zoomable]', { background: 'oklab(0 0 0 / 0.5)' })
  zoom.value.attach('[data-zoomable]')
})
onBeforeUnmount(() => zoom.value?.close())
</script>

<template>
  <div m-auto mb-8 class="prose" :class="{ 'prose-compact': frontmatter.layout === 'compact' }">
    <div id="prose-container">
      <div flex items-center justify-between>
        <h1 mb-0>
          {{ frontmatter.display || frontmatter.title }}
        </h1>
      </div>

      <p
        v-if="frontmatter.subtitle"
        op75
        class="!mt-0.5"
      >
        {{ frontmatter.subtitle }}
      </p>
      <p
        v-if="frontmatter.date"
        op75
        class="!mt-0.5"
      >
        {{ formatDate(frontmatter.date, false) }} <span v-if="frontmatter.duration">· {{ frontmatter.duration }}</span>
      </p>

      <article>
        <slot />
      </article>
    </div>

    <Back v-if="!isAboutPage" />
  </div>
</template>
