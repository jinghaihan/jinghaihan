import type { ResvgRenderOptions } from '@resvg/resvg-js'
import type { CollectionEntry } from 'astro:content'
import { Resvg } from '@resvg/resvg-js'
import { OG_BRAND, OG_COLORS, OG_FONT_FAMILY, OG_SIZE } from './constants'
import { loadOgFontFiles } from './load-google-font'

export async function generateOgImageForPost(post: CollectionEntry<'posts'>, siteUrl: string) {
  const svg = createPostSvg(post, siteUrl)
  const fontFiles = await loadPostFonts(post, siteUrl)
  return renderSvg(svg, fontFiles)
}

export async function generateOgImageForSite(siteUrl: string) {
  const svg = createSiteSvg(siteUrl)
  const fontFiles = await loadSiteFonts(siteUrl)
  return renderSvg(svg, fontFiles)
}

async function loadPostFonts(post: CollectionEntry<'posts'>, siteUrl: string) {
  const title = getPostTitle(post)
  const meta = getPostMeta(post)
  const host = getHost(siteUrl)
  return loadOgFontFiles(`${title}${meta}${host}${OG_BRAND.author}`)
}

async function loadSiteFonts(siteUrl: string) {
  const host = getHost(siteUrl)
  return loadOgFontFiles(`${OG_BRAND.name}${OG_BRAND.description}${host}`)
}

function renderSvg(svg: string, fontFiles: string[]) {
  const resvg = new Resvg(svg, buildRenderOptions(fontFiles))
  const pngData = resvg.render()
  return pngData.asPng()
}

function buildRenderOptions(fontFiles: string[]): ResvgRenderOptions {
  if (fontFiles.length === 0) {
    return {
      font: {
        loadSystemFonts: true,
        defaultFontFamily: 'sans-serif',
      },
    }
  }

  return {
    font: {
      loadSystemFonts: true,
      fontFiles,
      defaultFontFamily: 'Noto Sans SC',
      sansSerifFamily: 'Noto Sans SC',
    },
  }
}

function createPostSvg(post: CollectionEntry<'posts'>, siteUrl: string) {
  const host = getHost(siteUrl)
  const title = getPostTitle(post)
  const meta = getPostMeta(post)

  const titleLines = splitTitleLines(title, 16, 3)
  const titleFontSize = titleLines.length > 2 ? 74 : 82
  const titleLineHeight = titleLines.length > 2 ? 92 : 98
  const titleStartY = titleLines.length === 1 ? 322 : titleLines.length === 2 ? 272 : 224

  const titleText = titleLines
    .map((line, index) => {
      const y = titleStartY + index * titleLineHeight
      return `<text x="72" y="${y}" fill="${OG_COLORS.foreground}" font-family="${OG_FONT_FAMILY}" font-size="${titleFontSize}" font-weight="900" letter-spacing="-1.2">${escapeText(line)}</text>`
    })
    .join('\n')

  const hostPillWidth = Math.max(220, Math.min(560, Math.round(getTextWidth(host) * 32 + 72)))

  return `
<svg xmlns="http://www.w3.org/2000/svg" width="${OG_SIZE.width}" height="${OG_SIZE.height}" viewBox="0 0 ${OG_SIZE.width} ${OG_SIZE.height}">
  <defs>
    <pattern id="dot-grid" width="96" height="96" patternUnits="userSpaceOnUse">
      <circle cx="22" cy="22" r="1.4" fill="${OG_COLORS.accent}" />
      <circle cx="74" cy="74" r="1.4" fill="${OG_COLORS.accent}" />
    </pattern>
    <linearGradient id="glow-top" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${OG_COLORS.chart1}" />
      <stop offset="100%" stop-color="${OG_COLORS.chart4}" />
    </linearGradient>
    <linearGradient id="glow-bottom" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${OG_COLORS.chart2}" />
      <stop offset="100%" stop-color="${OG_COLORS.chart5}" />
    </linearGradient>
    <filter id="blur-strong" x="-60%" y="-60%" width="220%" height="220%">
      <feGaussianBlur stdDeviation="76" />
    </filter>
  </defs>

  <rect width="${OG_SIZE.width}" height="${OG_SIZE.height}" fill="${OG_COLORS.background}" />
  <rect width="${OG_SIZE.width}" height="${OG_SIZE.height}" fill="url(#dot-grid)" opacity="0.35" />

  <circle cx="1120" cy="-20" r="280" fill="url(#glow-top)" filter="url(#blur-strong)" opacity="0.32" />
  <circle cx="110" cy="690" r="280" fill="url(#glow-bottom)" filter="url(#blur-strong)" opacity="0.28" />

  <rect x="72" y="72" width="${hostPillWidth}" height="56" rx="28" fill="${OG_COLORS.card}" stroke="${OG_COLORS.border}" />
  <text x="100" y="108" fill="${OG_COLORS.muted}" font-family="${OG_FONT_FAMILY}" font-size="24" font-weight="700" letter-spacing="1.2">${escapeText(host)}</text>

  ${titleText}

  <rect x="72" y="530" width="72" height="5" rx="2.5" fill="${OG_COLORS.chart3}" />
  <text x="160" y="552" fill="${OG_COLORS.muted}" font-family="${OG_FONT_FAMILY}" font-size="30" font-weight="500">${escapeText(`${meta} | ${OG_BRAND.author}`)}</text>
</svg>
`.trim()
}

function createSiteSvg(siteUrl: string) {
  const host = getHost(siteUrl)
  const hostPillWidth = Math.max(240, Math.min(560, Math.round(getTextWidth(host) * 24 + 88)))
  const hostPillX = (OG_SIZE.width - hostPillWidth) / 2

  return `
<svg xmlns="http://www.w3.org/2000/svg" width="${OG_SIZE.width}" height="${OG_SIZE.height}" viewBox="0 0 ${OG_SIZE.width} ${OG_SIZE.height}">
  <defs>
    <pattern id="dot-grid" width="96" height="96" patternUnits="userSpaceOnUse">
      <circle cx="22" cy="22" r="1.4" fill="${OG_COLORS.accent}" />
      <circle cx="74" cy="74" r="1.4" fill="${OG_COLORS.accent}" />
    </pattern>
    <linearGradient id="glow-top" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${OG_COLORS.chart1}" />
      <stop offset="100%" stop-color="${OG_COLORS.chart4}" />
    </linearGradient>
    <linearGradient id="glow-bottom" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${OG_COLORS.chart2}" />
      <stop offset="100%" stop-color="${OG_COLORS.chart5}" />
    </linearGradient>
    <filter id="blur-strong" x="-60%" y="-60%" width="220%" height="220%">
      <feGaussianBlur stdDeviation="80" />
    </filter>
  </defs>

  <rect width="${OG_SIZE.width}" height="${OG_SIZE.height}" fill="${OG_COLORS.background}" />
  <rect width="${OG_SIZE.width}" height="${OG_SIZE.height}" fill="url(#dot-grid)" opacity="0.35" />

  <circle cx="1120" cy="-30" r="290" fill="url(#glow-top)" filter="url(#blur-strong)" opacity="0.3" />
  <circle cx="80" cy="680" r="280" fill="url(#glow-bottom)" filter="url(#blur-strong)" opacity="0.25" />

  <text x="600" y="268" text-anchor="middle" fill="${OG_COLORS.foreground}" font-family="${OG_FONT_FAMILY}" font-size="104" font-weight="900" letter-spacing="-2">${escapeText(OG_BRAND.name)}</text>
  <rect x="558" y="292" width="84" height="6" rx="3" fill="${OG_COLORS.chart3}" />
  <text x="600" y="366" text-anchor="middle" fill="${OG_COLORS.muted}" font-family="${OG_FONT_FAMILY}" font-size="34">${escapeText(OG_BRAND.description)}</text>

  <rect x="${hostPillX}" y="520" width="${hostPillWidth}" height="58" rx="29" fill="${OG_COLORS.card}" stroke="${OG_COLORS.border}" />
  <text x="600" y="558" text-anchor="middle" fill="${OG_COLORS.muted}" font-family="${OG_FONT_FAMILY}" font-size="24" font-weight="600" letter-spacing="1">${escapeText(host)}</text>
</svg>
`.trim()
}

function getPostTitle(post: CollectionEntry<'posts'>) {
  return post.data.display?.trim()
    || post.data.title?.trim()
    || post.id
}

function getPostMeta(post: CollectionEntry<'posts'>) {
  if (post.data.subtitle?.trim())
    return post.data.subtitle.trim()

  if (post.data.duration?.trim())
    return `Read in ${post.data.duration.trim()}`

  return 'Blog Post'
}

function getHost(siteUrl: string) {
  try {
    return new URL(siteUrl).hostname
  }
  catch {
    return OG_BRAND.fallbackHost
  }
}

function splitTitleLines(title: string, maxUnitsPerLine: number, maxLines: number) {
  const normalized = title.replace(/\s+/g, ' ').trim()
  if (!normalized)
    return ['Untitled Post']

  const chars = Array.from(normalized)
  const lines: string[] = []
  let cursor = 0

  while (cursor < chars.length && lines.length < maxLines) {
    let line = ''
    let units = 0

    while (cursor < chars.length) {
      const char = chars[cursor]!

      if (char === '\n') {
        cursor++
        break
      }

      const nextUnits = units + getCharWidth(char)
      if (nextUnits > maxUnitsPerLine && line)
        break

      line += char
      units = nextUnits
      cursor++
    }

    const trimmed = line.trim()
    if (trimmed)
      lines.push(trimmed)

    while (cursor < chars.length && chars[cursor] === ' ')
      cursor++
  }

  if (cursor < chars.length && lines.length > 0)
    lines[lines.length - 1] = trimEllipsis(lines[lines.length - 1]!, maxUnitsPerLine)

  return lines.length > 0 ? lines : ['Untitled Post']
}

function trimEllipsis(text: string, maxUnits: number) {
  const ellipsis = '…'
  const maxWithEllipsis = maxUnits - getCharWidth(ellipsis)
  let result = text.trimEnd()

  while (result && getTextWidth(result) > maxWithEllipsis)
    result = result.slice(0, -1)

  return `${result}${ellipsis}`
}

function getTextWidth(text: string) {
  return Array.from(text).reduce((total, char) => total + getCharWidth(char), 0)
}

function getCharWidth(char: string) {
  const codePoint = char.codePointAt(0) ?? 0xFFFF
  return codePoint <= 0xFF ? 0.56 : 1
}

function escapeText(text: string) {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}
