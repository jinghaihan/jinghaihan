import { defineEcConfig } from 'astro-expressive-code'

export default defineEcConfig({
  themes: ['vitesse-light', 'vitesse-dark'],
  useDarkModeMediaQuery: false,
  themeCssSelector: theme => theme.type === 'dark' ? '.dark' : '',
  styleOverrides: {
    frames: {
      frameBoxShadowCssValue: 'none',
    },
  },
})
