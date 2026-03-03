<script setup lang="ts">
import type { AlgorithmProgress, Topic } from '@/types'
import { computed } from 'vue'
import { useFloatingPanel } from '@/composables/use-floating-panel'

interface Props {
  topics: Topic[]
  progress: AlgorithmProgress
  selectedTopicIds: string[]
}

const props = defineProps<Props>()

const emit = defineEmits<{
  toggleTopic: [topicId: string]
  clear: []
}>()

const {
  open,
  floatingStyles,
  toggle: toggleOpen,
  ...panel
} = useFloatingPanel({
  placement: 'bottom-end',
  offset: 8,
  shiftPadding: 8,
})

const selectedTopicIdSet = computed(() => new Set(props.selectedTopicIds))
const selectedCount = computed(() => props.selectedTopicIds.length)

const rankedTopics = computed(() =>
  props.topics.map((topic, index) => {
    const done = topic.problemIds.reduce((count, problemId) => count + Number(Boolean(props.progress[problemId])), 0)
    return {
      ...topic,
      rank: index + 1,
      done,
      total: topic.problemIds.length,
      selected: selectedTopicIdSet.value.has(topic.id),
    }
  }),
)

function onToggleTopic(topicId: string): void {
  emit('toggleTopic', topicId)
}

function onClear(): void {
  emit('clear')
}
</script>

<template>
  <div class="shrink-0 relative">
    <button
      :ref="panel.referenceRef"
      type="button"
      aria-label="按推荐顺序过滤专题"
      :aria-expanded="open ? 'true' : 'false'"
      class="text-sm text-foreground/65 px-2 rounded-md inline-flex gap-1.5 h-8 min-w-8 transition-colors duration-150 items-center hover:text-foreground"
      :class="selectedCount > 0 ? 'text-foreground' : ''"
      @click="toggleOpen"
    >
      <i class="i-ri:compass-3-line" />
      <span>推荐</span>
      <span class="leading-none font-mono tabular-nums">{{ selectedCount }}</span>
    </button>

    <div
      v-if="open"
      :ref="panel.floatingRef"
      :style="floatingStyles"
      class="border border-border/55 rounded-md bg-background w-76 shadow-sm z-50 overflow-hidden"
    >
      <div class="max-h-84 overflow-y-auto">
        <div class="px-3 py-2 border-b border-border/35 bg-background flex items-center top-0 sticky z-10">
          <span class="text-xs text-foreground/60">推荐顺序</span>
          <button
            v-if="selectedCount > 0"
            type="button"
            class="text-xs text-foreground/55 ml-auto transition-colors duration-150 hover:text-foreground"
            @click="onClear"
          >
            清空过滤
          </button>
        </div>

        <div class="p-2">
          <button
            v-for="topic in rankedTopics"
            :key="topic.id"
            type="button"
            class="text-sm px-2 py-1.5 rounded-md flex gap-2 w-full transition-colors duration-150 items-center hover:bg-muted/45"
            :class="topic.selected ? 'bg-muted/45' : ''"
            @click="onToggleTopic(topic.id)"
          >
            <span class="text-xs text-foreground/45 leading-none font-mono text-left shrink-0 w-6 tabular-nums">{{ topic.rank }}</span>
            <span class="truncate">{{ topic.title }}</span>
            <span class="ml-auto inline-flex gap-1.5 items-center">
              <span class="text-xs text-foreground/60 leading-none font-mono tabular-nums">{{ topic.done }}/{{ topic.total }}</span>
              <i
                class="i-ri:check-line text-xs"
                :class="topic.selected ? 'op100 text-green-500/85 dark:text-green-400/85' : 'op0'"
              />
            </span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
