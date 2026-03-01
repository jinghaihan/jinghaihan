import { Buffer } from 'node:buffer'
import { createHash } from 'node:crypto'
import { existsSync } from 'node:fs'
import { mkdir, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import { GOOGLE_FONT_USER_AGENT, OG_FONT_CACHE_DIR, OG_FONT_CONFIG } from './constants'

const cache = new Map<string, Promise<string>>()

export async function loadOgFontFiles(text: string) {
  const normalizedText = cleanText(text)

  const fontFiles = await Promise.all(
    OG_FONT_CONFIG.map(async ({ font, weight }) => {
      try {
        return await loadFont(font, normalizedText, weight)
      }
      catch {
        return null
      }
    }),
  )

  return fontFiles.filter((file): file is string => file !== null)
}

async function loadFont(font: string, text: string, weight: 400 | 700) {
  const cacheKey = `${font}|${weight}|${text}`
  if (!cache.has(cacheKey))
    cache.set(cacheKey, downloadFont(font, text, weight))
  return cache.get(cacheKey)!
}

async function downloadFont(font: string, text: string, weight: 400 | 700) {
  const css = await requestCss(font, text, weight)
  const fontUrl = parseFontUrl(css)
  if (!fontUrl)
    throw new Error(`Unable to resolve Google Font URL for ${font} ${weight}`)

  const fontBuffer = await requestFont(fontUrl, font, weight)
  const hash = createHash('sha1').update(fontBuffer).digest('hex').slice(0, 12)
  const filePath = join(OG_FONT_CACHE_DIR, `${font.replace(/\+/g, '-')}-${weight}-${hash}.ttf`)

  await ensureDir()
  if (!existsSync(filePath))
    await writeFile(filePath, fontBuffer)

  return filePath
}

async function requestCss(font: string, text: string, weight: 400 | 700) {
  const apiUrl = `https://fonts.googleapis.com/css2?family=${font}:wght@${weight}&text=${encodeURIComponent(text)}`
  const response = await fetch(apiUrl, {
    headers: {
      'User-Agent': GOOGLE_FONT_USER_AGENT,
    },
  })

  if (!response.ok)
    throw new Error(`Unable to fetch Google Font CSS: ${response.status}`)

  return response.text()
}

async function requestFont(fontUrl: string, font: string, weight: 400 | 700) {
  const response = await fetch(fontUrl)
  if (!response.ok)
    throw new Error(`Unable to download font ${font} ${weight}: ${response.status}`)

  const arrayBuffer = await response.arrayBuffer()
  return Buffer.from(arrayBuffer)
}

function cleanText(text: string) {
  const compact = text.replace(/\s+/g, ' ').trim()
  if (!compact)
    return 'octohash'

  return Array.from(new Set(Array.from(compact))).join('').slice(0, 280)
}

function parseFontUrl(css: string) {
  const match = css.match(/src:\s*url\((.+?)\)\s*format\('(opentype|truetype|woff|woff2)'\)/)
  return match?.[1]
}

async function ensureDir() {
  await mkdir(OG_FONT_CACHE_DIR, { recursive: true })
}
