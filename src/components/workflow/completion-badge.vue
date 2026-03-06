<script setup lang="ts">
import type { WorkflowNode, WorkflowNodeCheckProgress } from '@/types/workflow'
import { computed } from 'vue'

defineOptions({
  name: 'WorkflowCompletionBadge',
})

const props = withDefaults(defineProps<{
  nodes: WorkflowNode<string>[]
  checkedNodeProgress?: WorkflowNodeCheckProgress
}>(), {
  checkedNodeProgress: () => ({}),
})

const completion = computed(() => {
  const total = props.nodes.length
  if (total <= 0) {
    return {
      done: 0,
      total: 0,
      percent: 0,
    }
  }

  let done = 0
  for (const node of props.nodes) {
    if (props.checkedNodeProgress[node.id])
      done += 1
  }

  return {
    done,
    total,
    percent: Math.round((done / total) * 100),
  }
})
</script>

<template>
  <div
    class="text-xs text-muted-foreground font-mono px-2.5 border border-border/70 rounded-md flex gap-1.5 h-8 shadow-sm items-center backdrop-blur bg-card!"
    aria-label="知识图谱完成度"
  >
    <span
      class="i-ri:checkbox-circle-line text-sm"
      :class="completion.done > 0 ? 'text-emerald-600 dark:text-emerald-400' : ''"
    />
    <span class="tabular-nums">{{ completion.done }}/{{ completion.total }}</span>
    <span class="opacity-80">({{ completion.percent }}%)</span>
  </div>
</template>
