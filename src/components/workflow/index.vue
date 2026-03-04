<script setup lang="ts">
import type { WorkflowCanvasDefinition, WorkflowEdge, WorkflowNode, WorkflowNodeLinkItem } from '@/types/workflow'
import { computed, ref, watch } from 'vue'
import WorkflowCanvas from './canvas.vue'
import WorkflowSidebar from './sidebar.vue'

defineOptions({
  name: 'WorkflowViewer',
})

const props = withDefaults(defineProps<{
  nodes: WorkflowNode<string>[]
  edges: WorkflowEdge<string>[]
  canvas: WorkflowCanvasDefinition<string, string>
  kindLabels?: Record<string, string>
  searchPlaceholder?: string
  isDark?: boolean
  getNodeColor: (kind: string, isDark: boolean) => string
  getNodeStrokeColor?: (isDark: boolean) => string
  getEdgeBaseWidth?: (kind: string) => number
  loadNodeContent?: (nodeId: string) => Promise<string>
  emptyNodeContentHtml?: string
  errorNodeContentHtml?: string
  sidebarMinWidth?: number
  sidebarMaxWidth?: number
  sidebarCollapsedWidth?: number
  sidebarDefaultWidth?: number
}>(), {
  kindLabels: () => ({}),
  searchPlaceholder: '输入节点名、ID、stage...',
  isDark: false,
  emptyNodeContentHtml: '<article class="prose prose-sm max-w-none"><p>该节点暂无专题内容。</p></article>',
  errorNodeContentHtml: '<article class="prose prose-sm max-w-none"><p>节点内容加载失败。</p></article>',
  sidebarMinWidth: 280,
  sidebarMaxWidth: 640,
  sidebarCollapsedWidth: 0,
  sidebarDefaultWidth: 400,
})

const selectedNodeId = ref('')
const nodeTopicHtml = ref(props.emptyNodeContentHtml)
const nodeTopicLoading = ref(false)
let requestToken = 0

const nodeMap = computed(() => new Map(props.nodes.map(node => [node.id, node])))
const selectedNode = computed(() => nodeMap.value.get(selectedNodeId.value) ?? null)
const showSidebar = computed(() => Boolean(selectedNode.value))
const linkedNodes = computed(() => {
  const node = selectedNode.value
  if (!node) {
    return {
      previous: [] as WorkflowNodeLinkItem[],
      next: [] as WorkflowNodeLinkItem[],
    }
  }

  const previousIdSet = new Set<string>()
  const nextIdSet = new Set<string>()
  for (const edge of props.edges) {
    if (edge.target === node.id)
      previousIdSet.add(edge.source)
    if (edge.source === node.id)
      nextIdSet.add(edge.target)
  }

  const toLinks = (ids: Set<string>) => [...ids]
    .map(id => nodeMap.value.get(id))
    .filter((item): item is NonNullable<typeof item> => Boolean(item))
    .sort((a, b) => a.stage - b.stage || a.lane - b.lane)
    .map(item => ({ id: item.id, title: item.title }))

  return {
    previous: toLinks(previousIdSet),
    next: toLinks(nextIdSet),
  }
})

watch(() => props.nodes, (nodes) => {
  if (!selectedNodeId.value)
    return

  if (!nodes.some(node => node.id === selectedNodeId.value))
    selectedNodeId.value = ''
})

watch(() => [selectedNodeId.value, props.loadNodeContent] as const, async ([nodeId, loadNodeContent]) => {
  requestToken += 1
  const currentToken = requestToken

  if (!nodeId) {
    nodeTopicLoading.value = false
    nodeTopicHtml.value = props.emptyNodeContentHtml
    return
  }

  if (!loadNodeContent) {
    nodeTopicLoading.value = false
    nodeTopicHtml.value = props.emptyNodeContentHtml
    return
  }

  nodeTopicLoading.value = true
  try {
    const nextHtml = (await loadNodeContent(nodeId)).trim()
    if (currentToken !== requestToken)
      return

    nodeTopicHtml.value = nextHtml || props.emptyNodeContentHtml
  }
  catch {
    if (currentToken !== requestToken)
      return

    nodeTopicHtml.value = props.errorNodeContentHtml
  }
  finally {
    if (currentToken === requestToken)
      nodeTopicLoading.value = false
  }
}, { immediate: true })

function onSelectionChange(nodeId: string): void {
  if (nodeId === selectedNodeId.value)
    return

  selectedNodeId.value = nodeId
}

function onSidebarNodeSelect(nodeId: string): void {
  onSelectionChange(nodeId)
}
</script>

<template>
  <div
    class="grid size-full min-h-0"
    :class="showSidebar ? 'grid-cols-[minmax(0,1fr)_auto]' : ''"
  >
    <section class="min-h-0">
      <WorkflowCanvas
        :nodes="nodes"
        :canvas="canvas"
        :selected-node-id="selectedNodeId"
        :kind-labels="kindLabels"
        :search-placeholder="searchPlaceholder"
        :is-dark="isDark"
        :get-node-color="getNodeColor"
        :get-node-stroke-color="getNodeStrokeColor"
        :get-edge-base-width="getEdgeBaseWidth"
        @selection-change="onSelectionChange"
      />
    </section>
    <div
      v-if="showSidebar && selectedNode"
      class="pb-3 h-full min-h-0"
    >
      <WorkflowSidebar
        :node="selectedNode"
        :previous-nodes="linkedNodes.previous"
        :next-nodes="linkedNodes.next"
        :content-html="nodeTopicHtml"
        :content-loading="nodeTopicLoading"
        :min-width="sidebarMinWidth"
        :max-width="sidebarMaxWidth"
        :collapsed-width="sidebarCollapsedWidth"
        :default-width="sidebarDefaultWidth"
        @select-node="onSidebarNodeSelect"
      />
    </div>
  </div>
</template>
