<script setup lang="ts">
import type { WorkflowNode, WorkflowNodeLinkItem } from '@/types/workflow'
import { ref, watch } from 'vue'
import Spinner from '@/components/ui/spinner.vue'
import { useResizableSidebar } from '@/composables/use-resizable-sidebar'
import WorkflowNodeNeighborLinks from './node-neighbor-links.vue'

defineOptions({
  name: 'WorkflowSidebar',
})

const props = withDefaults(defineProps<Props>(), {
  contentLoading: false,
  minWidth: 280,
  maxWidth: 640,
  collapsedWidth: 0,
  defaultWidth: 400,
})

const emit = defineEmits<{
  (event: 'selectNode', nodeId: string): void
}>()

interface Props {
  node: WorkflowNode<string>
  previousNodes: WorkflowNodeLinkItem[]
  nextNodes: WorkflowNodeLinkItem[]
  contentHtml: string
  contentLoading?: boolean
  minWidth?: number
  maxWidth?: number
  collapsedWidth?: number
  defaultWidth?: number
}

const {
  collapsed,
  trackWidth,
  onResizeStart: onSidebarResizeStart,
  toggleCollapsed: onSidebarToggleCollapsed,
  expand: expandSidebar,
} = useResizableSidebar({
  minWidth: props.minWidth,
  maxWidth: props.maxWidth,
  collapsedWidth: props.collapsedWidth,
  defaultWidth: props.defaultWidth,
})

const resizeHovering = ref(false)

watch(() => props.node.id, () => {
  expandSidebar()
  resizeHovering.value = false
})

function onResizeStart(event: PointerEvent): void {
  onSidebarResizeStart(event)
}

function toggleCollapsed(): void {
  onSidebarToggleCollapsed()
  resizeHovering.value = false
}

function onResizeHandleEnter(): void {
  if (collapsed.value)
    return
  resizeHovering.value = true
}

function onResizeHandleLeave(): void {
  resizeHovering.value = false
}
</script>

<template>
  <aside
    class="h-full relative"
    :class="collapsed
      ? 'w-0 overflow-visible'
      : 'border border-border/55 rounded-l-xl bg-background/76 shadow-lg overflow-hidden backdrop-blur-sm'"
    :style="collapsed ? undefined : { width: `${trackWidth}px` }"
  >
    <div v-if="collapsed" class="h-full w-0">
      <button
        type="button"
        aria-label="展开侧边栏"
        class="text-muted-foreground border border-r-0 border-border/70 rounded-l-md bg-background/92 flex h-9 w-8 shadow-sm transition-colors items-center right-0 top-1/2 justify-center absolute z-30 hover:text-foreground hover:bg-muted -translate-y-1/2"
        @click="toggleCollapsed"
      >
        <span class="i-ri:arrow-left-s-line text-base text-current" />
      </button>
    </div>

    <div v-else class="flex flex-col h-full min-h-0">
      <span
        aria-hidden="true"
        class="bg-primary w-0.5 pointer-events-none transition-opacity bottom-0 left-0 top-0 absolute z-10"
        :class="resizeHovering ? 'opacity-100' : 'opacity-0'"
      />

      <button
        type="button"
        aria-label="调整侧边栏宽度"
        class="bg-transparent w-4 cursor-col-resize bottom-0 left-0 top-0 absolute"
        @pointerdown="onResizeStart"
        @mouseenter="onResizeHandleEnter"
        @mouseleave="onResizeHandleLeave"
      />

      <div class="px-4 py-2.5 border-y border-border/60 flex items-center justify-between">
        <div class="min-w-0">
          <p class="text-sm text-foreground font-semibold truncate">
            {{ node.title }}
          </p>
        </div>
        <button
          type="button"
          aria-label="收起侧边栏"
          class="text-muted-foreground rounded-md flex h-7 w-7 transition-colors items-center justify-center hover:text-foreground hover:bg-muted/65"
          @click="toggleCollapsed"
        >
          <span class="i-ri:arrow-right-s-line text-base text-current" />
        </button>
      </div>

      <div class="px-5 pb-4 flex-1 min-h-0 overflow-y-auto">
        <div
          v-if="contentLoading"
          class="flex h-full items-center justify-center"
        >
          <Spinner class="max-w-20" />
        </div>
        <div
          v-else
          class="[&_h2]:text-base [&_h3]:text-sm [&_h2]:font-semibold [&_h3]:font-medium [&_ol]:my-2 [&_pre]:my-2 [&_ul]:my-2 [&_h2]:mb-2 [&_h2]:mt-5 [&_h3]:mb-1 [&_h3]:mt-4 [&_li]:mb-1 [&_pre]:p-3 [&_ol]:pl-5 [&_ul]:pl-5 [&_pre]:rounded-md [&_pre]:bg-muted [&_pre]:overflow-x-auto"
          v-html="contentHtml"
        />
      </div>

      <WorkflowNodeNeighborLinks
        :previous-nodes="previousNodes"
        :next-nodes="nextNodes"
        @select-node="emit('selectNode', $event)"
      />
    </div>
  </aside>
</template>
