<script setup lang="ts">
import type { Problem, Relation, Topic, TopicGroup } from '@/types'
import { toRef } from 'vue'
import { useKnowledgeGraph } from '@/composables/algorithm/use-knowledge-graph'

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

const knowledgeGraph = useKnowledgeGraph({
  groups: toRef(props, 'groups'),
  topics: toRef(props, 'topics'),
  problems: toRef(props, 'problems'),
  relations: toRef(props, 'relations'),
  onNodeSelect: label => emit('nodeSelect', label),
})
</script>

<template>
  <section class="flex flex-col h-full min-h-0">
    <div :ref="knowledgeGraph.graphContainerRef" class="flex-1 min-h-0">
      <svg :ref="knowledgeGraph.graphSvgRef" class="size-full" />
    </div>
  </section>
</template>
