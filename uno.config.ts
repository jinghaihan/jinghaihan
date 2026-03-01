import {
  defineConfig,
  presetAttributify,
  presetIcons,
  presetTypography,
  presetWebFonts,
  presetWind4,
  transformerDirectives,
  transformerVariantGroup,
} from 'unocss'

export default defineConfig({
  theme: {
    colors: {
      'background': 'var(--background)',
      'foreground': 'var(--foreground)',
      'primary': 'var(--primary)',
      'muted': 'var(--muted)',
      'muted-foreground': 'var(--muted-foreground)',
      'accent': 'var(--accent)',
      'border': 'var(--border)',
    },
  },
  shortcuts: [
    ['flex-center', 'flex items-center justify-center'],
    ['flex-col-center', 'flex flex-col items-center justify-center'],
    [/^btn-(\w+)$/, ([_, color]) => `inline-flex items-center gap-1 border border-border! rounded cursor-pointer no-underline! px2.5 py1 op50 transition-all duration-200 ease-out hover:(op100 text-${color} bg-${color}/10)`],
  ],
  presets: [
    presetWind4(),
    presetAttributify(),
    presetIcons({
      extraProperties: {
        'display': 'inline-block',
        'height': '1.2em',
        'width': '1.2em',
        'vertical-align': 'text-bottom',
      },
    }),
    presetTypography(),
    presetWebFonts({
      fonts: {
        sans: 'Geist',
        mono: 'Geist Mono',
      },
    }),
  ],
  transformers: [
    transformerDirectives(),
    transformerVariantGroup(),
  ],
  content: {
    pipeline: {
      include: [
        // the default
        /\.(vue|svelte|[jt]sx|mdx?|astro|elm|php|phtml|html)($|\?)/,
        // include js/ts files
        '(components|src)/**/*.{js,ts}',
      ],
    },
  },
})
