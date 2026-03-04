<script setup lang="ts">
import type { WorkflowCanvasDefinition, WorkflowNode } from '@/types/workflow'
import { computed, toRef, watch } from 'vue'
import ZoomContainer from '@/components/ui/zoom-container.vue'
import { useWorkflowGraph } from '@/composables/use-workflow-graph'
import WorkflowSearchPanel from './search-panel.vue'

defineOptions({
  name: 'WorkflowCanvas',
})

const props = withDefaults(defineProps<{
  canvas: WorkflowCanvasDefinition<string, string>
  nodes: WorkflowNode<string>[]
  selectedNodeId?: string
  kindLabels?: Record<string, string>
  searchPlaceholder?: string
  isDark?: boolean
  getNodeColor: (kind: string, isDark: boolean) => string
  getNodeStrokeColor?: (isDark: boolean) => string
  getEdgeBaseWidth?: (kind: string) => number
}>(), {
  selectedNodeId: '',
  kindLabels: () => ({}),
  searchPlaceholder: '输入节点名、ID、stage...',
  isDark: false,
})

const emit = defineEmits<{
  (event: 'selectionChange', nodeId: string): void
}>()

const graph = useWorkflowGraph({
  nodes: props.canvas.nodes,
  edges: props.canvas.edges,
  nodeWidth: props.canvas.nodeWidth,
  nodeHeight: props.canvas.nodeHeight,
  isDark: toRef(props, 'isDark'),
  getNodeColor: props.getNodeColor,
  getNodeStrokeColor: props.getNodeStrokeColor,
  getEdgeBaseWidth: props.getEdgeBaseWidth,
})

const fallbackEdges = computed(() => graph.fallbackEdges.value)
const fallbackNodes = computed(() => graph.fallbackNodes.value)

watch(() => graph.selectedNodeId.value, (nodeId) => {
  emit('selectionChange', nodeId)
}, { immediate: true })

watch(() => props.selectedNodeId, (nodeId) => {
  if (nodeId === graph.selectedNodeId.value)
    return
  graph.selectedNodeId.value = nodeId
})

function onSearchNodeSelect(nodeId: string): void {
  graph.selectedNodeId.value = nodeId
}
</script>

<template>
  <div class="size-full min-h-0 relative">
    <WorkflowSearchPanel
      :nodes="nodes"
      :kind-labels="kindLabels"
      :placeholder="searchPlaceholder"
      @select-node="onSearchNodeSelect"
    />

    <ZoomContainer
      :ref="graph.zoomContainerRef"
      @drag-end="graph.onViewportDragEnd"
    >
      <svg
        :width="canvas.width"
        :height="canvas.height"
        class="block select-none touch-none"
        :viewBox="`0 0 ${canvas.width} ${canvas.height}`"
        shape-rendering="geometricPrecision"
        text-rendering="geometricPrecision"
        @click="graph.onFallbackBackgroundClick"
      >
        <defs>
          <marker id="workflow-arrow" viewBox="0 0 12 12" refX="10.6" refY="6" markerWidth="6.2" markerHeight="6.2" orient="auto-start-reverse">
            <path d="M 1 1 L 11 6 L 1 11 z" fill="var(--muted-foreground)" />
          </marker>
          <marker id="workflow-arrow-focus" viewBox="0 0 12 12" refX="10.6" refY="6" markerWidth="6.2" markerHeight="6.2" orient="auto-start-reverse">
            <path d="M 1 1 L 11 6 L 1 11 z" fill="var(--foreground)" />
          </marker>
        </defs>
        <g>
          <path
            v-for="edge in fallbackEdges"
            :id="edge.id"
            :key="edge.key"
            :d="edge.path"
            :stroke="edge.visual.stroke"
            :stroke-width="edge.visual.width"
            :style="{ strokeDasharray: edge.kind === 'optimize' ? '6 4' : undefined }"
            :marker-end="edge.visual.marker"
            stroke-linecap="round"
            :stroke-opacity="edge.visual.opacity"
            fill="none"
          />
        </g>
        <g pointer-events="none">
          <g
            v-for="edge in fallbackEdges"
            :key="`${edge.key}-label`"
            :transform="edge.labelTransform"
            :opacity="edge.visual.labelOpacity"
          >
            <rect
              :x="-edge.labelWidth / 2"
              y="-9"
              :width="edge.labelWidth"
              height="18"
              rx="6"
              ry="6"
              fill="var(--background)"
              fill-opacity="0.9"
            />
            <text
              x="0"
              y="3.5"
              text-anchor="middle"
              font-size="10.5"
              font-weight="600"
              fill="var(--muted-foreground)"
            >
              {{ edge.label }}
            </text>
          </g>
        </g>
        <g>
          <g
            v-for="node in fallbackNodes"
            :key="`fallback-node-${node.id}`"
            :transform="`translate(${node.x},${node.y}) scale(${node.visual.scale})`"
            :opacity="node.visual.opacity"
            class="cursor-pointer transition-transform duration-150"
            data-no-pan
            @mouseenter="graph.onFallbackNodeEnter(node.id)"
            @mouseleave="graph.onFallbackNodeLeave"
            @click="graph.onFallbackNodeClick(node.id, $event)"
          >
            <rect
              :x="-canvas.nodeWidth / 2"
              :y="-canvas.nodeHeight / 2"
              :width="canvas.nodeWidth"
              :height="canvas.nodeHeight"
              fill="var(--background)"
              :fill-opacity="node.visual.backdropOpacity"
              rx="8"
              ry="8"
            />
            <rect
              :x="-canvas.nodeWidth / 2"
              :y="-canvas.nodeHeight / 2"
              :width="canvas.nodeWidth"
              :height="canvas.nodeHeight"
              :fill="graph.nodeColor(node.kind)"
              :fill-opacity="node.visual.fillOpacity"
              :stroke="graph.nodeStrokeColor()"
              :stroke-opacity="node.visual.strokeOpacity"
              :stroke-width="node.visual.strokeWidth"
              rx="8"
              ry="8"
            />
            <text
              x="0"
              y="4.5"
              text-anchor="middle"
              font-size="11"
              font-weight="600"
              fill="var(--foreground)"
            >
              {{ node.title }}
            </text>
          </g>
        </g>
      </svg>
    </ZoomContainer>
  </div>
</template>
