<script setup lang="ts">
import type { EdgeKind, NodeKind } from '@/types/web-pipeline'
import type { WorkflowCanvasDefinition } from '@/types/workflow'
import WorkflowViewer from '@/components/workflow/index.vue'
import { isDark } from '@/composables/use-reactive-dark'
import {
  WEB_PIPELINE_EDGES,
  WEB_PIPELINE_FALLBACK_EDGES,
  WEB_PIPELINE_FALLBACK_HEIGHT,
  WEB_PIPELINE_FALLBACK_NODE_HEIGHT,
  WEB_PIPELINE_FALLBACK_NODE_WIDTH,
  WEB_PIPELINE_FALLBACK_NODES,
  WEB_PIPELINE_FALLBACK_WIDTH,
  WEB_PIPELINE_KIND_LABELS,
  WEB_PIPELINE_NODES,
} from '@/constants/web-pipeline'

const workflowCanvas: WorkflowCanvasDefinition<NodeKind, EdgeKind> = {
  width: WEB_PIPELINE_FALLBACK_WIDTH,
  height: WEB_PIPELINE_FALLBACK_HEIGHT,
  nodeWidth: WEB_PIPELINE_FALLBACK_NODE_WIDTH,
  nodeHeight: WEB_PIPELINE_FALLBACK_NODE_HEIGHT,
  nodes: WEB_PIPELINE_FALLBACK_NODES,
  edges: WEB_PIPELINE_FALLBACK_EDGES,
}

function getNodeColor(kind: string, dark: boolean): string {
  if (dark) {
    if (kind === 'entry')
      return 'oklch(0.64 0.1 248)'
    if (kind === 'cache')
      return 'oklch(0.65 0.085 208)'
    if (kind === 'network')
      return 'oklch(0.61 0.12 230)'
    if (kind === 'server')
      return 'oklch(0.63 0.095 220)'
    if (kind === 'render')
      return 'oklch(0.66 0.08 188)'
    return 'oklch(0.62 0.11 268)'
  }

  if (kind === 'entry')
    return 'oklch(0.62 0.095 252)'
  if (kind === 'cache')
    return 'oklch(0.68 0.088 187)'
  if (kind === 'network')
    return 'oklch(0.6 0.1 224)'
  if (kind === 'server')
    return 'oklch(0.66 0.1 35)'
  if (kind === 'render')
    return 'oklch(0.62 0.085 152)'
  return 'oklch(0.66 0.075 300)'
}

function getNodeStrokeColor(dark: boolean): string {
  if (dark)
    return 'oklch(0.74 0.03 235)'
  return 'var(--muted-foreground)'
}

function getEdgeBaseWidth(kind: string): number {
  if (kind === 'hit')
    return 1.85
  if (kind === 'miss')
    return 1.8
  if (kind === 'validate')
    return 1.7
  if (kind === 'optimize')
    return 1.55
  return 1.65
}

async function loadNodeContent(nodeId: string): Promise<string> {
  const response = await fetch(`/web-pipeline/node-content/${nodeId}`)
  if (!response.ok)
    throw new Error(`Failed to load node content: ${response.status}`)

  return response.text()
}
</script>

<template>
  <WorkflowViewer
    :nodes="WEB_PIPELINE_NODES"
    :edges="WEB_PIPELINE_EDGES"
    :canvas="workflowCanvas"
    :kind-labels="WEB_PIPELINE_KIND_LABELS"
    :is-dark="isDark"
    :get-node-color="getNodeColor"
    :get-node-stroke-color="getNodeStrokeColor"
    :get-edge-base-width="getEdgeBaseWidth"
    :load-node-content="loadNodeContent"
  />
</template>
