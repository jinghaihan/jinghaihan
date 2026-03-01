import { defineEcConfig } from 'astro-expressive-code'

export default defineEcConfig({
  themes: ['kanagawa-lotus', 'kanagawa-dragon'],
  useDarkModeMediaQuery: false,
  themeCssSelector: theme => theme.type === 'dark' ? '.dark' : '',
  styleOverrides: {
    frames: {
      frameBoxShadowCssValue: 'none',
    },
  },
})
