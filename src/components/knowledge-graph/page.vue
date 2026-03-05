<script setup lang="ts">
import type { WorkflowCanvasDefinition } from '@/types/workflow'
import WorkflowViewer from '@/components/workflow/index.vue'
import { isDark } from '@/composables/use-reactive-dark'
import { KNOWLEDGE_GRAPH } from '@/constants/knowledge-graph'

const workflowCanvas: WorkflowCanvasDefinition<string, string> = {
  width: KNOWLEDGE_GRAPH.fallbackWidth,
  height: KNOWLEDGE_GRAPH.fallbackHeight,
  nodeWidth: KNOWLEDGE_GRAPH.fallbackNodeWidth,
  nodeHeight: KNOWLEDGE_GRAPH.fallbackNodeHeight,
  nodes: KNOWLEDGE_GRAPH.fallbackNodes,
  edges: KNOWLEDGE_GRAPH.fallbackEdges,
}

const darkNodeColors: Record<string, string> = {
  entry: 'oklch(0.64 0.1 248)',
  cache: 'oklch(0.65 0.085 208)',
  network: 'oklch(0.61 0.12 230)',
  server: 'oklch(0.63 0.095 220)',
  render: 'oklch(0.66 0.08 188)',
  perf: 'oklch(0.63 0.085 262)',
  plan: 'oklch(0.67 0.08 234)',
  build: 'oklch(0.65 0.1 205)',
  quality: 'oklch(0.69 0.09 165)',
  delivery: 'oklch(0.66 0.09 120)',
  observe: 'oklch(0.68 0.08 270)',
  html: 'oklch(0.69 0.07 225)',
  css: 'oklch(0.67 0.08 200)',
  javascript: 'oklch(0.7 0.1 110)',
  browser: 'oklch(0.66 0.09 168)',
  core: 'oklch(0.67 0.09 206)',
  component: 'oklch(0.69 0.08 194)',
  data: 'oklch(0.7 0.09 145)',
  runtime: 'oklch(0.66 0.1 220)',
  state: 'oklch(0.67 0.1 250)',
}

const lightNodeColors: Record<string, string> = {
  entry: 'oklch(0.62 0.095 252)',
  cache: 'oklch(0.68 0.088 187)',
  network: 'oklch(0.6 0.1 224)',
  server: 'oklch(0.66 0.1 35)',
  render: 'oklch(0.62 0.085 152)',
  perf: 'oklch(0.66 0.075 300)',
  plan: 'oklch(0.62 0.1 244)',
  build: 'oklch(0.64 0.11 215)',
  quality: 'oklch(0.66 0.08 162)',
  delivery: 'oklch(0.68 0.1 134)',
  observe: 'oklch(0.68 0.08 292)',
  html: 'oklch(0.63 0.09 230)',
  css: 'oklch(0.62 0.11 205)',
  javascript: 'oklch(0.72 0.13 102)',
  browser: 'oklch(0.64 0.09 170)',
  core: 'oklch(0.65 0.09 230)',
  component: 'oklch(0.65 0.1 196)',
  data: 'oklch(0.68 0.1 140)',
  runtime: 'oklch(0.62 0.1 214)',
  state: 'oklch(0.65 0.11 252)',
}

function getNodeColor(kind: string, dark: boolean): string {
  return (dark ? darkNodeColors : lightNodeColors)[kind]
    ?? (dark ? 'oklch(0.62 0.11 268)' : 'oklch(0.66 0.075 300)')
}

function getNodeStrokeColor(dark: boolean): string {
  if (dark)
    return 'oklch(0.74 0.03 235)'
  return 'var(--muted-foreground)'
}

function getEdgeBaseWidth(kind: string): number {
  if (kind === 'risk')
    return 1.95
  if (kind === 'guard')
    return 1.82
  if (kind === 'feedback')
    return 1.74
  if (kind === 'practice')
    return 1.72
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
  const response = await fetch(`/knowledge-graph/node-content/${nodeId}`)
  if (!response.ok)
    throw new Error(`Failed to load node content: ${response.status}`)

  return response.text()
}
</script>

<template>
  <WorkflowViewer
    :nodes="KNOWLEDGE_GRAPH.nodes"
    :edges="KNOWLEDGE_GRAPH.edges"
    :canvas="workflowCanvas"
    check-storage-key="knowledge-graph-node-check-progress"
    :kind-labels="KNOWLEDGE_GRAPH.kindLabels"
    :is-dark="isDark"
    :get-node-color="getNodeColor"
    :get-node-stroke-color="getNodeStrokeColor"
    :get-edge-base-width="getEdgeBaseWidth"
    :load-node-content="loadNodeContent"
  />
</template>
