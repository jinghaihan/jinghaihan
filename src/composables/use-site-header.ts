const OVERLAY_CLASSES = ['fixed', 'top-0', 'left-0', 'pointer-events-auto']

function normalizePath(path: string) {
  const normalized = path.replace(/\/+$/, '')
  return normalized || '/'
}

function getLayoutMode(doc: Document = document) {
  return doc.body?.dataset.layoutMode ?? null
}

function syncOverlayFromMode(header: HTMLElement, mode?: string | null) {
  const isOverlay = mode === 'fullscreen'
  for (const className of OVERLAY_CLASSES)
    header.classList.toggle(className, isOverlay)
}

export function useSiteHeader(header: HTMLElement | null) {
  if (!header || header.dataset.siteHeaderBound === '1')
    return

  header.dataset.siteHeaderBound = '1'
  syncOverlayFromMode(header, getLayoutMode())

  header.addEventListener('click', (event) => {
    if (event.button !== 0)
      return
    if (event.metaKey || event.ctrlKey || event.altKey || event.shiftKey)
      return

    const target = event.target as HTMLElement | null
    if (!target)
      return

    const link = target.closest<HTMLAnchorElement>('a[data-nav-link]')
    if (!link)
      return

    const path = normalizePath(window.location.pathname)
    const nextPath = normalizePath(new URL(link.href, window.location.href).pathname)
    if (path === nextPath)
      event.preventDefault()
  })

  document.addEventListener('astro:page-load', () => {
    syncOverlayFromMode(header, getLayoutMode())
  })

  document.addEventListener('astro:before-swap', (event) => {
    const nextDocument = (event as Event & { newDocument?: Document }).newDocument
    syncOverlayFromMode(header, getLayoutMode(nextDocument ?? document))
  })
}
