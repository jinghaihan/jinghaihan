import { join } from 'node:path'
import process from 'node:process'

export const OG_SIZE = {
  width: 1200,
  height: 630,
} as const

export const OG_BRAND = {
  name: 'octohash',
  description: 'jinghaihan / blog / projects',
  author: 'jinghaihan',
  fallbackHost: 'octohash.me',
} as const

export const OG_COLORS = {
  background: '#171717', // --background (.dark)
  foreground: '#fafafa', // --foreground (.dark)
  muted: '#a3a3a3', // --muted-foreground (.dark)
  card: 'rgba(38, 38, 38, 0.82)', // --card (.dark)
  border: 'rgba(255, 255, 255, 0.1)', // --border (.dark)
  accent: '#404040', // --accent (.dark)
  chart1: '#5f75ff', // --chart-1 (.dark)
  chart2: '#14b88a', // --chart-2 (.dark)
  chart3: '#f4b14b', // --chart-3 (.dark)
  chart4: '#cb66ff', // --chart-4 (.dark)
  chart5: '#e27a7a', // --chart-5 (.dark)
} as const

export const OG_FONT_FAMILY = [
  'Noto Sans SC',
  'Noto Sans',
  'PingFang SC',
  'Microsoft YaHei',
  'Source Han Sans SC',
  'sans-serif',
].join(', ')

export const OG_FONT_CACHE_DIR = join(process.cwd(), 'node_modules', '.cache', 'octohash-og-fonts')

export const OG_FONT_CONFIG = [
  { font: 'Noto+Sans', weight: 400 },
  { font: 'Noto+Sans', weight: 700 },
  { font: 'Noto+Sans+SC', weight: 400 },
  { font: 'Noto+Sans+SC', weight: 700 },
] as const

export const GOOGLE_FONT_USER_AGENT = 'Mozilla/5.0 (Macintosh; U; Intel Mac OS X 10_6_8; de-at) AppleWebKit/533.21.1 (KHTML, like Gecko) Version/5.0.5 Safari/533.21.1'
