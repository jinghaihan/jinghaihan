<script setup lang="ts">
import type { WorkflowNode } from '@/types/web-pipeline'
import { onClickOutside, useMagicKeys, whenever } from '@vueuse/core'
import { computed, nextTick, ref, watch } from 'vue'
import { WEB_PIPELINE_KIND_LABELS, WEB_PIPELINE_NODES } from '@/constants/web-pipeline'

interface SearchResultItem {
  id: string
  title: string
  kindLabel: string
  stage: number
}

const emit = defineEmits<{
  (event: 'selectNode', nodeId: string): void
}>()

const panelRef = ref<HTMLElement | null>(null)
const inputRef = ref<HTMLInputElement | null>(null)
const open = ref(false)
const query = ref('')
const activeIndex = ref(0)

const orderedNodes = [...WEB_PIPELINE_NODES].sort((a, b) => a.stage - b.stage || a.lane - b.lane)
const keys = useMagicKeys({
  passive: false,
  onEventFired(event) {
    if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k')
      event.preventDefault()
  },
})
const triggerSearchHotkey = computed(() => keys['Meta+K'].value || keys['Ctrl+K'].value)

const results = computed<SearchResultItem[]>(() => {
  const keyword = query.value.trim().toLowerCase()
  if (!keyword) {
    return orderedNodes.map(node => toResultItem(node))
  }

  return orderedNodes
    .map((node) => {
      const score = searchScore(node, keyword)
      return {
        node,
        score,
      }
    })
    .filter(item => item.score > 0)
    .sort((a, b) => b.score - a.score || a.node.stage - b.node.stage || a.node.lane - b.node.lane)
    .map(item => toResultItem(item.node))
})

whenever(triggerSearchHotkey, () => {
  togglePanel()
})

whenever(keys.escape, () => {
  if (open.value)
    closePanel()
})

watch(open, async (isOpen) => {
  if (isOpen) {
    await nextTick()
    inputRef.value?.focus()
    inputRef.value?.select()
    return
  }

  query.value = ''
  activeIndex.value = 0
})

watch(query, () => {
  activeIndex.value = 0
})

watch(results, (next) => {
  if (!next.length) {
    activeIndex.value = 0
    return
  }

  if (activeIndex.value >= next.length)
    activeIndex.value = next.length - 1
})

onClickOutside(panelRef, () => {
  if (open.value)
    closePanel()
})

function toResultItem(node: WorkflowNode): SearchResultItem {
  return {
    id: node.id,
    title: node.title,
    kindLabel: WEB_PIPELINE_KIND_LABELS[node.kind],
    stage: node.stage,
  }
}

function searchScore(node: WorkflowNode, keyword: string): number {
  const title = node.title.toLowerCase()
  const id = node.id.toLowerCase()
  const kindLabel = WEB_PIPELINE_KIND_LABELS[node.kind].toLowerCase()
  const stageToken = `stage:${node.stage}`
  const stageCnToken = `阶段${node.stage}`

  let score = 0
  if (title === keyword)
    score += 120
  else if (title.startsWith(keyword))
    score += 90
  else if (title.includes(keyword))
    score += 70

  if (id === keyword)
    score += 95
  else if (id.startsWith(keyword))
    score += 70
  else if (id.includes(keyword))
    score += 55

  if (kindLabel.includes(keyword))
    score += 30
  if (stageToken === keyword || stageCnToken === keyword || `${node.stage}` === keyword)
    score += 40

  return score
}

function closePanel(): void {
  open.value = false
}

function togglePanel(): void {
  open.value = !open.value
}

function moveCursor(step: number): void {
  const total = results.value.length
  if (!total)
    return

  activeIndex.value = (activeIndex.value + step + total) % total
}

function selectNode(nodeId: string): void {
  emit('selectNode', nodeId)
  closePanel()
}

function selectActiveNode(): void {
  const current = results.value[activeIndex.value]
  if (!current)
    return

  selectNode(current.id)
}

function onInputKeydown(event: KeyboardEvent): void {
  if (event.key === 'ArrowDown') {
    event.preventDefault()
    moveCursor(1)
    return
  }

  if (event.key === 'ArrowUp') {
    event.preventDefault()
    moveCursor(-1)
    return
  }

  if (event.key === 'Enter') {
    event.preventDefault()
    selectActiveNode()
    return
  }

  if (event.key === 'Escape') {
    event.preventDefault()
    closePanel()
  }
}
</script>

<template>
  <div
    ref="panelRef"
    class="pointer-events-auto left-6 top-4 absolute z-40"
  >
    <button
      type="button"
      class="text-xs text-muted-foreground px-2.5 border border-border/70 rounded-md bg-background/92 flex gap-2 h-8 shadow-sm transition-colors items-center backdrop-blur hover:text-foreground hover:bg-muted/45"
      aria-label="查找节点"
      @click="togglePanel"
    >
      <span class="i-ri:search-line text-sm" />
      <span class="font-medium">搜索节点</span>
      <span class="text-[10px] font-mono px-1.5 py-0.5 border border-border/60 rounded tabular-nums">
        Ctrl/⌘K
      </span>
    </button>

    <div
      v-if="open"
      class="mt-2 border border-border/70 rounded-lg bg-background/96 max-w-[calc(100vw-2rem)] w-[21rem] shadow-lg backdrop-blur"
    >
      <div class="px-3 py-2 border-b border-border/60 flex gap-2 items-center">
        <span class="i-ri:search-line text-sm text-muted-foreground" />
        <input
          ref="inputRef"
          v-model="query"
          type="text"
          placeholder="输入节点名、ID、stage..."
          class="text-sm outline-none bg-transparent w-full placeholder:text-foreground/40"
          @keydown="onInputKeydown"
        >
      </div>

      <ul class="p-1 max-h-72 overflow-y-auto">
        <li
          v-if="!results.length"
          class="text-xs text-muted-foreground px-2 py-2"
        >
          未找到匹配节点
        </li>
        <li
          v-for="(item, index) in results"
          :key="item.id"
        >
          <button
            type="button"
            class="px-2 py-1.5 text-left rounded-md flex gap-2 w-full transition-colors items-center justify-between"
            :class="index === activeIndex
              ? 'bg-muted text-foreground'
              : 'text-muted-foreground hover:bg-muted/45 hover:text-foreground'"
            @mouseenter="activeIndex = index"
            @click="selectNode(item.id)"
          >
            <div class="min-w-0">
              <p class="text-sm font-medium truncate">
                {{ item.title }}
              </p>
              <p class="text-[11px] font-mono opacity-80 truncate">
                {{ item.id }}
              </p>
            </div>
            <div class="flex shrink-0 gap-1 items-center">
              <span class="text-[10px] px-1.5 py-0.5 border border-border/60 rounded">
                {{ item.kindLabel }}
              </span>
              <span class="text-[10px] font-mono opacity-80 tabular-nums">
                S{{ item.stage }}
              </span>
            </div>
          </button>
        </li>
      </ul>
    </div>
  </div>
</template>
