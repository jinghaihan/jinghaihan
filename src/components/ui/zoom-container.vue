<script setup lang="ts">
import { useResizeObserver } from '@vueuse/core'
import { computed, nextTick, onMounted, ref } from 'vue'

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

const viewportRef = ref<HTMLElement | null>(null)
const contentRef = ref<HTMLElement | null>(null)

const scale = ref(props.initialScale)
const offsetX = ref(0)
const offsetY = ref(0)
const hasInteracted = ref(false)
const zoomPresetOpen = ref(false)
const zoomPresetValues = [0.25, 0.5, 1, 1.5, 2, 3]

const isDragging = ref(false)
let activePointerId: number | null = null
let dragStartX = 0
let dragStartY = 0
let dragOriginX = 0
let dragOriginY = 0
let movedDuringDrag = false

const DRAG_DISTANCE_THRESHOLD = 4

const contentStyle = computed(() => {
  const alignedX = Math.round(offsetX.value)
  const alignedY = Math.round(offsetY.value)
  return {
    transform: `translate(${alignedX}px, ${alignedY}px) scale(${scale.value})`,
  }
})

const viewportClass = 'size-full min-h-0 relative overflow-hidden touch-none select-none'
const contentClass = 'absolute left-0 top-0 origin-top-left'
const controlsClass = 'absolute bottom-3 right-3 z-20 flex items-center gap-1 rounded-lg border border-border/70 bg-background/85 p-1 backdrop-blur'
const controlButtonClass = 'size-7 flex items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground'
const zoomLevelButtonClass = 'h-7 min-w-14 px-2 inline-flex items-center justify-center gap-1 rounded-md text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground'
const presetPanelClass = 'absolute right-0 bottom-[calc(100%+0.4rem)] z-30 w-16 rounded-md border border-border/70 bg-background/96 p-1 shadow-sm backdrop-blur'
const presetOptionClass = 'h-7 w-full rounded-md text-xs font-mono tabular-nums transition-colors'

const zoomLevelText = computed(() => `${Math.round(scale.value * 100)}%`)
const zoomPresetOptions = computed(() => {
  return zoomPresetValues.filter(value => value >= props.minScale && value <= props.maxScale)
})

function clampScale(value: number): number {
  return Math.max(props.minScale, Math.min(props.maxScale, value))
}

function zoomAt(nextScale: number, anchorX: number, anchorY: number): void {
  const clampedScale = clampScale(nextScale)
  const prevScale = scale.value
  if (Math.abs(clampedScale - prevScale) < 0.0001)
    return

  const logicalX = (anchorX - offsetX.value) / prevScale
  const logicalY = (anchorY - offsetY.value) / prevScale
  scale.value = clampedScale
  offsetX.value = anchorX - logicalX * clampedScale
  offsetY.value = anchorY - logicalY * clampedScale
}

function zoomBy(stepDelta: number): void {
  const viewport = viewportRef.value
  if (!viewport)
    return

  const rect = viewport.getBoundingClientRect()
  const anchorX = rect.width / 2
  const anchorY = rect.height / 2
  zoomAt(scale.value * (1 + stepDelta), anchorX, anchorY)
  hasInteracted.value = true
  zoomPresetOpen.value = false
}

function zoomTo(nextScale: number): void {
  const viewport = viewportRef.value
  if (!viewport)
    return

  const rect = viewport.getBoundingClientRect()
  const anchorX = rect.width / 2
  const anchorY = rect.height / 2
  zoomAt(nextScale, anchorX, anchorY)
  hasInteracted.value = true
}

function zoomIn(): void {
  const nextPreset = zoomPresetOptions.value.find(value => value > scale.value + 0.01)
  if (nextPreset !== undefined) {
    zoomTo(nextPreset)
    return
  }
  zoomBy(props.step)
}

function zoomOut(): void {
  const nextPreset = [...zoomPresetOptions.value].reverse().find(value => value < scale.value - 0.01)
  if (nextPreset !== undefined) {
    zoomTo(nextPreset)
    return
  }
  zoomBy(-props.step)
}

function resetView(): void {
  scale.value = props.initialScale
  offsetX.value = 0
  offsetY.value = 0
  hasInteracted.value = false
  zoomPresetOpen.value = false
  fitContent()
}

function fitContent(): void {
  const viewport = viewportRef.value
  const content = contentRef.value
  if (!viewport || !content)
    return

  const viewportWidth = viewport.clientWidth
  const viewportHeight = viewport.clientHeight
  const contentWidth = content.offsetWidth
  const contentHeight = content.offsetHeight

  if (viewportWidth <= 0 || viewportHeight <= 0 || contentWidth <= 0 || contentHeight <= 0)
    return

  const fittedScale = clampScale(Math.min(viewportWidth / contentWidth, viewportHeight / contentHeight) * 0.92)
  scale.value = fittedScale
  offsetX.value = (viewportWidth - contentWidth * fittedScale) / 2
  offsetY.value = (viewportHeight - contentHeight * fittedScale) / 2
}

function onWheel(event: WheelEvent): void {
  const viewport = viewportRef.value
  if (!viewport)
    return

  const rect = viewport.getBoundingClientRect()
  const anchorX = event.clientX - rect.left
  const anchorY = event.clientY - rect.top
  const normalizedDeltaY = normalizeWheelDelta(event.deltaY, event.deltaMode, viewport.clientHeight)
  const nextScale = scale.value * Math.exp(-normalizedDeltaY * props.wheelSpeed)
  zoomAt(nextScale, anchorX, anchorY)

  hasInteracted.value = true
  zoomPresetOpen.value = false
}

function normalizeWheelDelta(value: number, mode: number, viewportHeight: number): number {
  if (mode === WheelEvent.DOM_DELTA_LINE)
    return value * 16
  if (mode === WheelEvent.DOM_DELTA_PAGE)
    return value * viewportHeight
  return value
}

function selectZoomPreset(targetScale: number): void {
  zoomTo(targetScale)
  zoomPresetOpen.value = false
}

function isPresetActive(value: number): boolean {
  return Math.abs(scale.value - value) < 0.01
}

function onPointerDown(event: PointerEvent): void {
  if (event.button !== 0)
    return
  const target = event.target as HTMLElement
  if (target.closest('[data-zoom-control]'))
    return
  if (target.closest('[data-no-pan]'))
    return

  zoomPresetOpen.value = false

  const viewport = viewportRef.value
  if (!viewport)
    return

  viewport.setPointerCapture(event.pointerId)
  activePointerId = event.pointerId
  isDragging.value = true
  dragStartX = event.clientX
  dragStartY = event.clientY
  dragOriginX = offsetX.value
  dragOriginY = offsetY.value
  movedDuringDrag = false
  hasInteracted.value = true
}

function onPointerMove(event: PointerEvent): void {
  if (!isDragging.value || event.pointerId !== activePointerId)
    return

  const deltaX = event.clientX - dragStartX
  const deltaY = event.clientY - dragStartY
  if (!movedDuringDrag && (deltaX * deltaX + deltaY * deltaY) >= DRAG_DISTANCE_THRESHOLD * DRAG_DISTANCE_THRESHOLD)
    movedDuringDrag = true

  offsetX.value = dragOriginX + deltaX
  offsetY.value = dragOriginY + deltaY
}

function onPointerUp(event: PointerEvent): void {
  if (event.pointerId !== activePointerId)
    return

  const viewport = viewportRef.value
  if (viewport?.hasPointerCapture(event.pointerId))
    viewport.releasePointerCapture(event.pointerId)

  emit('dragEnd', movedDuringDrag)

  isDragging.value = false
  activePointerId = null
  movedDuringDrag = false
}

onMounted(async () => {
  await nextTick()
  fitContent()
})

useResizeObserver(viewportRef, () => {
  if (!hasInteracted.value)
    fitContent()
})

defineExpose({
  zoomIn,
  zoomOut,
  resetView,
  fitContent,
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
