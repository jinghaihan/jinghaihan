const STORAGE_KEY = 'vueuse-color-scheme'

function applyDark(isDark: boolean) {
  document.documentElement.classList.toggle('dark', isDark)
  localStorage.setItem(STORAGE_KEY, isDark ? 'dark' : 'light')
}

export function useDark(button: HTMLButtonElement | null) {
  if (!button || button.dataset.darkBound === '1')
    return

  button.dataset.darkBound = '1'
  button.addEventListener('click', (event) => {
    const canAnimate = typeof document.startViewTransition === 'function'
      && !window.matchMedia('(prefers-reduced-motion: reduce)').matches

    const nextIsDark = !document.documentElement.classList.contains('dark')
    if (!canAnimate) {
      applyDark(nextIsDark)
      return
    }

    const pointer = event instanceof MouseEvent
    const x = pointer ? event.clientX : window.innerWidth / 2
    const y = pointer ? event.clientY : window.innerHeight / 2
    const endRadius = Math.hypot(
      Math.max(x, innerWidth - x),
      Math.max(y, innerHeight - y),
    )

    const transition = document.startViewTransition(() => {
      applyDark(nextIsDark)
    })

    void transition.ready.then(() => {
      const clipPath = [
        `circle(0px at ${x}px ${y}px)`,
        `circle(${endRadius}px at ${x}px ${y}px)`,
      ]

      document.documentElement.animate(
        {
          clipPath: nextIsDark
            ? [...clipPath].reverse()
            : clipPath,
        },
        {
          duration: 400,
          easing: 'ease-out',
          fill: 'forwards',
          pseudoElement: nextIsDark
            ? '::view-transition-old(root)'
            : '::view-transition-new(root)',
        },
      )
    })
  })
}
