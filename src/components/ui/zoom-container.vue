<script setup lang="ts">
import { toRef } from 'vue'
import { useZoomContainer } from '@/composables/use-zoom-container'

interface Props {
  minScale?: number
  maxScale?: number
  initialScale?: number
  step?: number
  wheelSpeed?: number
  controls?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  minScale: 0.2,
  maxScale: 3,
  initialScale: 1,
  step: 0.7,
  wheelSpeed: 0.0032,
  controls: true,
})
const emit = defineEmits<{
  (event: 'dragEnd', moved: boolean): void
}>()

const viewportClass = 'size-full min-h-0 relative overflow-hidden touch-none select-none'
const contentClass = 'absolute left-0 top-0 origin-top-left'
const controlsClass = 'absolute bottom-3 right-3 z-20 flex items-center gap-1 rounded-lg border border-border/70 bg-background/85 p-1 backdrop-blur'
const controlButtonClass = 'size-7 flex items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground'
const zoomLevelButtonClass = 'h-7 min-w-14 px-2 inline-flex items-center justify-center gap-1 rounded-md text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground'
const presetPanelClass = 'absolute right-0 bottom-[calc(100%+0.4rem)] z-30 w-16 rounded-md border border-border/70 bg-background/96 p-1 shadow-sm backdrop-blur'
const presetOptionClass = 'h-7 w-full rounded-md text-xs font-mono tabular-nums transition-colors'

const {
  viewportRef,
  contentRef,
  contentStyle,
  isDragging,
  zoomPresetOpen,
  zoomPresetOptions,
  zoomLevelText,
  zoomIn,
  zoomOut,
  resetView,
  fitContent,
  centerAt,
  onWheel,
  onPointerDown,
  onPointerMove,
  onPointerUp,
  selectZoomPreset,
  isPresetActive,
} = useZoomContainer({
  minScale: toRef(props, 'minScale'),
  maxScale: toRef(props, 'maxScale'),
  initialScale: toRef(props, 'initialScale'),
  step: toRef(props, 'step'),
  wheelSpeed: toRef(props, 'wheelSpeed'),
  onDragEnd: moved => emit('dragEnd', moved),
})

void viewportRef
void contentRef

defineExpose({
  zoomIn,
  zoomOut,
  resetView,
  fitContent,
  centerAt,
})
</script>

<template>
  <div
    ref="viewportRef"
    :class="[viewportClass, isDragging ? 'cursor-grabbing' : 'cursor-grab']"
    @pointerdown="onPointerDown"
    @pointermove="onPointerMove"
    @pointerup="onPointerUp"
    @pointercancel="onPointerUp"
    @wheel.prevent="onWheel"
  >
    <div
      ref="contentRef"
      :class="contentClass"
      :style="contentStyle"
    >
      <slot />
    </div>

    <div
      v-if="controls"
      :class="controlsClass"
      data-zoom-control
    >
      <button
        data-zoom-control
        :class="controlButtonClass"
        title="缩小"
        aria-label="缩小"
        @click.stop="zoomOut"
      >
        <i class="i-tabler:minus" />
      </button>
      <div class="relative" data-zoom-control>
        <button
          data-zoom-control
          :class="zoomLevelButtonClass"
          title="缩放等级"
          aria-label="缩放等级"
          :aria-expanded="zoomPresetOpen ? 'true' : 'false'"
          @click.stop="zoomPresetOpen = !zoomPresetOpen"
        >
          <span>{{ zoomLevelText }}</span>
          <i class="i-ri:arrow-down-s-line text-[10px] transition-transform" :class="zoomPresetOpen ? 'rotate-180' : ''" />
        </button>
        <div
          v-if="zoomPresetOpen"
          :class="presetPanelClass"
          data-zoom-control
        >
          <button
            v-for="preset in zoomPresetOptions"
            :key="preset"
            type="button"
            data-zoom-control
            :class="[
              presetOptionClass,
              isPresetActive(preset)
                ? 'bg-muted text-foreground'
                : 'text-muted-foreground hover:bg-muted hover:text-foreground',
            ]"
            @click.stop="selectZoomPreset(preset)"
          >
            {{ Math.round(preset * 100) }}%
          </button>
        </div>
      </div>
      <button
        data-zoom-control
        :class="controlButtonClass"
        title="放大"
        aria-label="放大"
        @click.stop="zoomIn"
      >
        <i class="i-tabler:plus" />
      </button>
      <button
        data-zoom-control
        :class="controlButtonClass"
        title="复位"
        aria-label="复位"
        @click.stop="resetView"
      >
        <i class="i-tabler:refresh" />
      </button>
    </div>
  </div>
</template>
