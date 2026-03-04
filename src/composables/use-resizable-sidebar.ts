import { useEventListener } from '@vueuse/core'
import { computed, ref } from 'vue'

interface UseResizableSidebarOptions {
  minWidth?: number
  maxWidth?: number
  collapsedWidth?: number
  defaultWidth?: number
}

const DEFAULT_MIN_WIDTH = 280
const DEFAULT_MAX_WIDTH = 520
const DEFAULT_COLLAPSED_WIDTH = 0
const DEFAULT_WIDTH = 400

export function useResizableSidebar(options: UseResizableSidebarOptions = {}) {
  const minWidth = options.minWidth ?? DEFAULT_MIN_WIDTH
  const maxWidth = options.maxWidth ?? DEFAULT_MAX_WIDTH
  const collapsedWidth = options.collapsedWidth ?? DEFAULT_COLLAPSED_WIDTH
  const defaultWidth = options.defaultWidth ?? DEFAULT_WIDTH

  const resizing = ref(false)
  const collapsed = ref(false)
  const width = ref(defaultWidth)
  const startX = ref(0)
  const startWidth = ref(0)

  const trackWidth = computed(() => (collapsed.value ? collapsedWidth : width.value))

  function clampWidth(nextWidth: number): number {
    return Math.min(maxWidth, Math.max(minWidth, nextWidth))
  }

  function onResizeStart(event: PointerEvent): void {
    if (collapsed.value)
      return

    resizing.value = true
    startX.value = event.clientX
    startWidth.value = clampWidth(width.value)
    event.preventDefault()
  }

  function toggleCollapsed(): void {
    collapsed.value = !collapsed.value
  }

  function expand(): void {
    collapsed.value = false
  }

  useEventListener(window, 'pointermove', (event) => {
    if (!resizing.value)
      return

    const delta = startX.value - event.clientX
    width.value = clampWidth(startWidth.value + delta)
  })

  useEventListener(window, 'pointerup', () => {
    resizing.value = false
  })

  return {
    collapsed,
    trackWidth,
    onResizeStart,
    toggleCollapsed,
    expand,
  }
}
