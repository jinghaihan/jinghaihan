<script setup lang="ts">
import type { Problem, Relation, Topic, TopicGroup } from '@/types'
import { toRef } from 'vue'
import { useAlgorithmGraph } from '@/composables/use-algorithm-graph'

interface Props {
  groups: TopicGroup[]
  topics: Topic[]
  problems: Record<string, Problem>
  relations: Relation[]
}

const props = defineProps<Props>()
const emit = defineEmits<{
  nodeSelect: [label: string]
}>()

const algorithmGraph = useAlgorithmGraph({
  groups: toRef(props, 'groups'),
  topics: toRef(props, 'topics'),
  problems: toRef(props, 'problems'),
  relations: toRef(props, 'relations'),
  onNodeSelect: label => emit('nodeSelect', label),
})
</script>

<template>
  <section class="flex flex-col h-full min-h-0">
    <div :ref="algorithmGraph.graphContainerRef" class="flex-1 min-h-0">
      <svg :ref="algorithmGraph.graphSvgRef" class="size-full" />
    </div>
  </section>
</template>
