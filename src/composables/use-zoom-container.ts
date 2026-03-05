import type { Ref } from 'vue'
import { useResizeObserver } from '@vueuse/core'
import { computed, nextTick, onMounted, ref } from 'vue'

interface UseZoomContainerOptions {
  minScale: Ref<number>
  maxScale: Ref<number>
  initialScale: Ref<number>
  step: Ref<number>
  wheelSpeed: Ref<number>
  onDragEnd?: (moved: boolean) => void
}

const ZOOM_PRESET_VALUES = [0.25, 0.5, 1, 1.5, 2, 3]
const DRAG_DISTANCE_THRESHOLD = 4

export function useZoomContainer(options: UseZoomContainerOptions) {
  const viewportRef = ref<HTMLElement | null>(null)
  const contentRef = ref<HTMLElement | null>(null)

  const scale = ref(options.initialScale.value)
  const offsetX = ref(0)
  const offsetY = ref(0)
  const hasInteracted = ref(false)
  const zoomPresetOpen = ref(false)

  const isDragging = ref(false)
  let activePointerId: number | null = null
  const activePointers = new Map<number, { x: number, y: number }>()
  let dragStartX = 0
  let dragStartY = 0
  let dragOriginX = 0
  let dragOriginY = 0
  let movedDuringDrag = false
  let movedDuringGesture = false
  let pinchStartDistance = 1
  let pinchStartScale = 1
  let pinchAnchorLogicalX = 0
  let pinchAnchorLogicalY = 0
  let pinchStartCenterX = 0
  let pinchStartCenterY = 0

  const contentStyle = computed(() => {
    const alignedX = Math.round(offsetX.value)
    const alignedY = Math.round(offsetY.value)
    return {
      transform: `translate(${alignedX}px, ${alignedY}px) scale(${scale.value})`,
    }
  })

  const zoomLevelText = computed(() => `${Math.round(scale.value * 100)}%`)
  const zoomPresetOptions = computed(() => {
    return ZOOM_PRESET_VALUES.filter(value => value >= options.minScale.value && value <= options.maxScale.value)
  })

  function clampScale(value: number): number {
    return Math.max(options.minScale.value, Math.min(options.maxScale.value, value))
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
    zoomBy(options.step.value)
  }

  function zoomOut(): void {
    const nextPreset = [...zoomPresetOptions.value].reverse().find(value => value < scale.value - 0.01)
    if (nextPreset !== undefined) {
      zoomTo(nextPreset)
      return
    }
    zoomBy(-options.step.value)
  }

  function resetView(): void {
    scale.value = options.initialScale.value
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
    const nextScale = scale.value * Math.exp(-normalizedDeltaY * options.wheelSpeed.value)
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
    if (event.pointerType === 'mouse' && event.button !== 0)
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
    activePointers.set(event.pointerId, { x: event.clientX, y: event.clientY })

    if (activePointers.size >= 2) {
      startPinch(viewport)
      return
    }

    movedDuringGesture = false
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
    if (!activePointers.has(event.pointerId))
      return

    activePointers.set(event.pointerId, { x: event.clientX, y: event.clientY })

    if (activePointers.size >= 2) {
      const viewport = viewportRef.value
      if (!viewport)
        return
      updatePinch(viewport)
      return
    }

    if (!isDragging.value || event.pointerId !== activePointerId)
      return

    const deltaX = event.clientX - dragStartX
    const deltaY = event.clientY - dragStartY
    if (!movedDuringDrag && (deltaX * deltaX + deltaY * deltaY) >= DRAG_DISTANCE_THRESHOLD * DRAG_DISTANCE_THRESHOLD) {
      movedDuringDrag = true
      movedDuringGesture = true
    }

    offsetX.value = dragOriginX + deltaX
    offsetY.value = dragOriginY + deltaY
  }

  function onPointerUp(event: PointerEvent): void {
    const viewport = viewportRef.value
    if (viewport?.hasPointerCapture(event.pointerId))
      viewport.releasePointerCapture(event.pointerId)

    const hadMultiTouch = activePointers.size >= 2
    activePointers.delete(event.pointerId)

    if (activePointers.size === 0) {
      options.onDragEnd?.(movedDuringGesture || movedDuringDrag)
      isDragging.value = false
      activePointerId = null
      movedDuringDrag = false
      movedDuringGesture = false
      return
    }

    if (activePointers.size >= 2) {
      if (viewport)
        startPinch(viewport)
      return
    }

    if (hadMultiTouch) {
      const [nextPointerId, point] = activePointers.entries().next().value as [number, { x: number, y: number }]
      activePointerId = nextPointerId
      isDragging.value = true
      dragStartX = point.x
      dragStartY = point.y
      dragOriginX = offsetX.value
      dragOriginY = offsetY.value
      movedDuringDrag = false
    }
  }

  function startPinch(viewport: HTMLElement): void {
    const points = Array.from(activePointers.values())
    if (points.length < 2)
      return

    const [first, second] = points
    const rect = viewport.getBoundingClientRect()
    const centerX = (first.x + second.x) / 2 - rect.left
    const centerY = (first.y + second.y) / 2 - rect.top
    const distance = Math.max(1, Math.hypot(first.x - second.x, first.y - second.y))

    pinchStartDistance = distance
    pinchStartScale = scale.value
    pinchAnchorLogicalX = (centerX - offsetX.value) / scale.value
    pinchAnchorLogicalY = (centerY - offsetY.value) / scale.value
    pinchStartCenterX = centerX
    pinchStartCenterY = centerY

    isDragging.value = false
    activePointerId = null
    movedDuringDrag = false
  }

  function updatePinch(viewport: HTMLElement): void {
    const points = Array.from(activePointers.values())
    if (points.length < 2)
      return

    const [first, second] = points
    const rect = viewport.getBoundingClientRect()
    const centerX = (first.x + second.x) / 2 - rect.left
    const centerY = (first.y + second.y) / 2 - rect.top
    const distance = Math.max(1, Math.hypot(first.x - second.x, first.y - second.y))
    const scaleRatio = distance / pinchStartDistance
    const nextScale = clampScale(pinchStartScale * scaleRatio)

    scale.value = nextScale
    offsetX.value = centerX - pinchAnchorLogicalX * nextScale
    offsetY.value = centerY - pinchAnchorLogicalY * nextScale

    const centerDeltaX = centerX - pinchStartCenterX
    const centerDeltaY = centerY - pinchStartCenterY
    if (
      Math.abs(nextScale - pinchStartScale) > 0.003
      || (centerDeltaX * centerDeltaX + centerDeltaY * centerDeltaY) >= DRAG_DISTANCE_THRESHOLD * DRAG_DISTANCE_THRESHOLD
    ) {
      movedDuringGesture = true
    }
  }

  onMounted(async () => {
    await nextTick()
    fitContent()
  })

  useResizeObserver(viewportRef, () => {
    if (!hasInteracted.value)
      fitContent()
  })

  return {
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
    onWheel,
    onPointerDown,
    onPointerMove,
    onPointerUp,
    selectZoomPreset,
    isPresetActive,
  }
}
