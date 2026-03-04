<script setup lang="ts">
import { computed, watch } from 'vue'
import ZoomContainer from '@/components/ui/zoom-container.vue'
import { useWebPipeline } from '@/composables/web-pipeline/use-web-pipeline'
import {
  WEB_PIPELINE_FALLBACK_HEIGHT,
  WEB_PIPELINE_FALLBACK_NODE_HEIGHT,
  WEB_PIPELINE_FALLBACK_NODE_WIDTH,
  WEB_PIPELINE_FALLBACK_WIDTH,
} from '@/constants/web-pipeline'

const emit = defineEmits<{
  (event: 'selectionChange', nodeId: string): void
}>()

const pipeline = useWebPipeline()
const fallbackEdges = computed(() => pipeline.fallbackEdges.value)
const fallbackNodes = computed(() => pipeline.fallbackNodes.value)

watch(() => pipeline.selectedNodeId.value, (nodeId) => {
  emit('selectionChange', nodeId)
}, { immediate: true })
</script>

<template>
  <div class="size-full min-h-0 relative">
    <ZoomContainer
      :ref="pipeline.zoomContainerRef"
      @drag-end="pipeline.onViewportDragEnd"
    >
      <svg
        :width="WEB_PIPELINE_FALLBACK_WIDTH"
        :height="WEB_PIPELINE_FALLBACK_HEIGHT"
        class="block select-none touch-none"
        :viewBox="`0 0 ${WEB_PIPELINE_FALLBACK_WIDTH} ${WEB_PIPELINE_FALLBACK_HEIGHT}`"
        shape-rendering="geometricPrecision"
        text-rendering="geometricPrecision"
        @click="pipeline.onFallbackBackgroundClick"
      >
        <defs>
          <marker id="fallback-arrow" viewBox="0 0 12 12" refX="10.6" refY="6" markerWidth="6.2" markerHeight="6.2" orient="auto-start-reverse">
            <path d="M 1 1 L 11 6 L 1 11 z" fill="var(--muted-foreground)" />
          </marker>
          <marker id="fallback-arrow-focus" viewBox="0 0 12 12" refX="10.6" refY="6" markerWidth="6.2" markerHeight="6.2" orient="auto-start-reverse">
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
            @mouseenter="pipeline.onFallbackNodeEnter(node.id)"
            @mouseleave="pipeline.onFallbackNodeLeave"
            @click="pipeline.onFallbackNodeClick(node.id, $event)"
          >
            <rect
              :x="-WEB_PIPELINE_FALLBACK_NODE_WIDTH / 2"
              :y="-WEB_PIPELINE_FALLBACK_NODE_HEIGHT / 2"
              :width="WEB_PIPELINE_FALLBACK_NODE_WIDTH"
              :height="WEB_PIPELINE_FALLBACK_NODE_HEIGHT"
              fill="var(--background)"
              :fill-opacity="node.visual.backdropOpacity"
              rx="8"
              ry="8"
            />
            <rect
              :x="-WEB_PIPELINE_FALLBACK_NODE_WIDTH / 2"
              :y="-WEB_PIPELINE_FALLBACK_NODE_HEIGHT / 2"
              :width="WEB_PIPELINE_FALLBACK_NODE_WIDTH"
              :height="WEB_PIPELINE_FALLBACK_NODE_HEIGHT"
              :fill="pipeline.nodeColor(node.kind)"
              :fill-opacity="node.visual.fillOpacity"
              :stroke="pipeline.nodeStrokeColor()"
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
