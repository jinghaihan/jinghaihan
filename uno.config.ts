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
      'card': 'var(--card)',
      'card-foreground': 'var(--card-foreground)',
      'popover': 'var(--popover)',
      'popover-foreground': 'var(--popover-foreground)',
      'primary': 'var(--primary)',
      'primary-foreground': 'var(--primary-foreground)',
      'secondary': 'var(--secondary)',
      'secondary-foreground': 'var(--secondary-foreground)',
      'muted': 'var(--muted)',
      'muted-foreground': 'var(--muted-foreground)',
      'accent': 'var(--accent)',
      'accent-foreground': 'var(--accent-foreground)',
      'destructive': 'var(--destructive)',
      'border': 'var(--border)',
      'input': 'var(--input)',
      'ring': 'var(--ring)',
      'chart-1': 'var(--chart-1)',
      'chart-2': 'var(--chart-2)',
      'chart-3': 'var(--chart-3)',
      'chart-4': 'var(--chart-4)',
      'chart-5': 'var(--chart-5)',
      'sidebar': 'var(--sidebar)',
      'sidebar-foreground': 'var(--sidebar-foreground)',
      'sidebar-primary': 'var(--sidebar-primary)',
      'sidebar-primary-foreground': 'var(--sidebar-primary-foreground)',
      'sidebar-accent': 'var(--sidebar-accent)',
      'sidebar-accent-foreground': 'var(--sidebar-accent-foreground)',
      'sidebar-border': 'var(--sidebar-border)',
      'sidebar-ring': 'var(--sidebar-ring)',
    },
  },
  shortcuts: [
    ['flex-center', 'flex items-center justify-center'],
    ['flex-col-center', 'flex flex-col items-center justify-center'],
    [/^btn-([\w-]+)$/, ([_, color]) => `inline-flex items-center gap-1 border border-border! rounded cursor-pointer no-underline! px2.5 py1 op50 transition-all duration-200 ease-out hover:(op100 text-${color} bg-${color}/10)`],
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
