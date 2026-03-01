export function useSiteFooter(footer: HTMLElement | null) {
  if (!footer || footer.dataset.siteFooterBound === '1')
    return

  footer.dataset.siteFooterBound = '1'
  const toggle = footer.querySelector('[data-footer-toggle]')
  const panel = footer.querySelector('[data-footer-panel]')
  if (!(toggle instanceof HTMLButtonElement) || !(panel instanceof HTMLElement))
    return

  toggle.addEventListener('click', () => {
    const expanded = toggle.getAttribute('aria-expanded') === 'true'
    toggle.setAttribute('aria-expanded', expanded ? 'false' : 'true')
    panel.classList.toggle('hidden', expanded)
  })
}
