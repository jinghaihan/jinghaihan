function normalizePath(path: string) {
  const normalized = path.replace(/\/+$/, '')
  return normalized || '/'
}

export function useSiteHeader(header: HTMLElement | null) {
  if (!header || header.dataset.siteHeaderBound === '1')
    return

  header.dataset.siteHeaderBound = '1'

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
}
