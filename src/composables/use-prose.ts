import mediumZoom from 'medium-zoom'

const ZOOM_SELECTOR = '[data-zoomable]'

let listenersBound = false
const zoom = mediumZoom({ background: 'oklab(0 0 0 / 0.5)' })

function attachZoomable() {
  zoom.detach()
  const images = document.querySelectorAll(ZOOM_SELECTOR)
  if (images.length > 0)
    zoom.attach(images)
}

export function useProse() {
  attachZoomable()

  if (listenersBound)
    return
  listenersBound = true

  document.addEventListener('astro:before-swap', () => {
    zoom.close()
  })
  document.addEventListener('astro:page-load', () => {
    attachZoomable()
  })
}
