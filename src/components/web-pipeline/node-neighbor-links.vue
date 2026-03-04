<script setup lang="ts">
import type { NodeLinkItem } from '@/types/web-pipeline'

defineProps<{
  previousNodes: NodeLinkItem[]
  nextNodes: NodeLinkItem[]
}>()

const emit = defineEmits<{
  (event: 'selectNode', nodeId: string): void
}>()

function selectNode(nodeId: string): void {
  emit('selectNode', nodeId)
}
</script>

<template>
  <div v-if="previousNodes.length > 0 || nextNodes.length > 0" class="px-4 py-3 border-t border-border/60 bg-background/90">
    <div class="space-y-2">
      <div v-if="previousNodes.length > 0" class="flex flex-wrap gap-x-2 gap-y-1.5 min-w-0 items-center">
        <span class="text-xs text-muted-foreground leading-6 shrink-0">
          上一个节点
        </span>
        <button
          v-for="item in previousNodes"
          :key="`prev-${item.id}`"
          type="button"
          class="text-xs text-muted-foreground px-2 py-1 border border-border/70 rounded-md transition-colors hover:text-foreground hover:bg-muted/65"
          @click="selectNode(item.id)"
        >
          {{ item.title }}
        </button>
      </div>

      <div v-if="nextNodes.length > 0" class="flex flex-wrap gap-x-2 gap-y-1.5 min-w-0 items-center">
        <span class="text-xs text-muted-foreground leading-6 shrink-0">
          下一个节点
        </span>
        <button
          v-for="item in nextNodes"
          :key="`next-${item.id}`"
          type="button"
          class="text-xs text-muted-foreground px-2 py-1 border border-border/70 rounded-md transition-colors hover:text-foreground hover:bg-muted/65"
          @click="selectNode(item.id)"
        >
          {{ item.title }}
        </button>
      </div>
    </div>
  </div>
</template>
