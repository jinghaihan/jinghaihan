let listenersBound = false

function bindSiteFooter(footer: HTMLElement) {
  if (footer.dataset.siteFooterBound === '1')
    return

  const toggle = footer.querySelector('[data-footer-toggle]')
  const panel = footer.querySelector('[data-footer-panel]')
  if (!(toggle instanceof HTMLButtonElement) || !(panel instanceof HTMLElement))
    return

  footer.dataset.siteFooterBound = '1'
  toggle.addEventListener('click', () => {
    const expanded = toggle.getAttribute('aria-expanded') === 'true'
    toggle.setAttribute('aria-expanded', expanded ? 'false' : 'true')
    panel.classList.toggle('hidden', expanded)
  })
}

function bindAllSiteFooters() {
  document.querySelectorAll<HTMLElement>('[data-site-footer]').forEach(bindSiteFooter)
}

export function useSiteFooter(footer?: HTMLElement | null) {
  if (footer)
    bindSiteFooter(footer)
  else
    bindAllSiteFooters()

  if (listenersBound)
    return
  listenersBound = true

  document.addEventListener('astro:page-load', () => {
    bindAllSiteFooters()
  })
}
