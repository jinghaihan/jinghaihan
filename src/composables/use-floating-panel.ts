import { autoUpdate, flip, offset, shift, useFloating } from '@floating-ui/vue'
import { onBeforeUnmount, onMounted, ref } from 'vue'

interface FloatingPanelOptions {
  placement?: 'bottom-start' | 'bottom-end' | 'top-start' | 'top-end'
  offset?: number
  shiftPadding?: number
}

export function useFloatingPanel(options: FloatingPanelOptions = {}) {
  const open = ref(false)
  const referenceRef = ref<HTMLElement | null>(null)
  const floatingRef = ref<HTMLElement | null>(null)

  const { floatingStyles } = useFloating(referenceRef, floatingRef, {
    placement: options.placement || 'bottom-end',
    middleware: [
      offset(options.offset ?? 8),
      flip(),
      shift({ padding: options.shiftPadding ?? 8 }),
    ],
    whileElementsMounted: autoUpdate,
  })

  function toggle(): void {
    open.value = !open.value
  }

  function close(): void {
    open.value = false
  }

  function onDocumentPointerDown(event: PointerEvent): void {
    if (!open.value)
      return

    const target = event.target as Node | null
    if (!target)
      return

    if (referenceRef.value?.contains(target) || floatingRef.value?.contains(target))
      return

    close()
  }

  function onDocumentKeyDown(event: KeyboardEvent): void {
    if (event.key === 'Escape')
      close()
  }

  onMounted(() => {
    document.addEventListener('pointerdown', onDocumentPointerDown)
    document.addEventListener('keydown', onDocumentKeyDown)
  })

  onBeforeUnmount(() => {
    document.removeEventListener('pointerdown', onDocumentPointerDown)
    document.removeEventListener('keydown', onDocumentKeyDown)
  })

  return {
    open,
    referenceRef,
    floatingRef,
    floatingStyles,
    toggle,
    close,
  }
}
