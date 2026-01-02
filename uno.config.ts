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
  shortcuts: [
    ['flex-center', 'flex items-center justify-center'],
    ['flex-col-center', 'flex flex-col items-center justify-center'],
    [/^btn-(\w+)$/, ([_, color]) => `op50 px2.5 py1 transition-all duration-200 ease-out cursor-pointer no-underline! hover:(op100 text-${color} bg-${color}/10) border border-base! rounded`],
    {
      'border-base': 'border-[#8884]',
    },
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
