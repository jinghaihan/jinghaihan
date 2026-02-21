<script setup lang="ts">
import { timeline } from '@/constants'

const collapsed = ref<boolean>(true)

function toggleCollapsed() {
  collapsed.value = !collapsed.value
}
</script>

<template>
  <footer text-sm py-6 w-full>
    <div flex items-center justify-between>
      <div class="btn-slate border-none" @click="toggleCollapsed">
        About This Site
        <i i-ri:expand-up-down-line />
      </div>
      <span op60>2025-PRESENT © octohash</span>
    </div>

    <div
      v-if="!collapsed"
      class="prose"
      mt-4 pt-4 border-t border-gray-200 dark:border-gray-700
    >
      <div class="timeline-container">
        <div
          v-for="event in timeline"
          :key="event.date"
          mb-3 gap-4 grid items-baseline
          class="grid-cols-[100px_1fr]"
        >
          <div text-right>
            {{ event.date }}
          </div>
          <div>
            <div font-semibold>
              {{ event.title }}
            </div>
            <div mt-1 v-html="event.description" />
          </div>
        </div>
      </div>
    </div>
  </footer>
</template>
