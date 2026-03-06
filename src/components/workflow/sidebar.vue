<script setup lang="ts">
import type { WorkflowNode, WorkflowNodeLinkItem } from '@/types/workflow'
import { useMediaQuery } from '@vueuse/core'
import { computed, ref, watch } from 'vue'
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
  (event: 'toggleCheck', nodeId: string, checked: boolean): void
  (event: 'collapseChange', collapsed: boolean): void
}>()

interface Props {
  node: WorkflowNode<string>
  previousNodes: WorkflowNodeLinkItem[]
  nextNodes: WorkflowNodeLinkItem[]
  checked?: boolean
  contentHtml: string
  contentLoading?: boolean
  minWidth?: number
  maxWidth?: number
  collapsedWidth?: number
  defaultWidth?: number
  expandSignal?: number
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
const isDesktop = useMediaQuery('(min-width: 1024px)')
const sidebarStyle = computed(() => {
  if (collapsed.value)
    return undefined

  return {
    width: isDesktop.value ? `${trackWidth.value}px` : '100vw',
  }
})

watch(() => props.node.id, () => {
  expandSidebar()
  resizeHovering.value = false
})

watch(() => collapsed.value, (value) => {
  emit('collapseChange', value)
}, { immediate: true })

watch(() => props.expandSignal, () => {
  if (!collapsed.value)
    return

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

function onToggleCheck(): void {
  emit('toggleCheck', props.node.id, !props.checked)
}
</script>

<template>
  <aside
    class="h-full pointer-events-auto relative"
    :class="collapsed
      ? 'w-0 overflow-visible'
      : 'bg-background overflow-hidden backdrop-blur-sm lg:border lg:border-border/55 lg:rounded-l-xl lg:bg-background/76 lg:shadow-lg'"
    :style="sidebarStyle"
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
        <div class="flex gap-1 items-center">
          <button
            type="button"
            :aria-label="checked ? '标记为未完成' : '标记为已完成'"
            class="text-xs px-2 rounded-md flex gap-1.5 h-7 transition-colors items-center hover:bg-muted/65"
            :class="checked
              ? 'text-emerald-600 dark:text-emerald-400'
              : 'text-muted-foreground hover:text-foreground'"
            @click="onToggleCheck"
          >
            <span :class="checked ? 'i-ri:checkbox-circle-fill' : 'i-ri:checkbox-blank-circle-line'" />
            <span class="leading-none">{{ checked ? '已完成' : '未完成' }}</span>
          </button>

          <button
            type="button"
            aria-label="收起侧边栏"
            class="text-muted-foreground rounded-md flex h-7 w-7 transition-colors items-center justify-center hover:text-foreground hover:bg-muted/65"
            @click="toggleCollapsed"
          >
            <span class="i-ri:arrow-right-s-line text-base text-current" />
          </button>
        </div>
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
        class="shrink-0 max-h-[10%] overflow-y-auto"
        :previous-nodes="previousNodes"
        :next-nodes="nextNodes"
        @select-node="emit('selectNode', $event)"
      />
    </div>
  </aside>
</template>
