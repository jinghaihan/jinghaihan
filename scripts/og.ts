import type { Frontmatter } from '../src/types'
import { Buffer } from 'node:buffer'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import process from 'node:process'
import { Resvg } from '@resvg/resvg-js'
import matter from 'gray-matter'
import satori from 'satori'
import { html } from 'satori-html'
import { glob } from 'tinyglobby'
import { formatDate } from '../src/utils/index'
import { DOMAIN } from './shared'

const WIDTH = 1200
const HEIGHT = 630
const DARK_BG_OUTER = 'linear-gradient(160deg, #121212 0%, #171717 45%, #1d1d1d 100%)'
const DARK_BG_INNER = 'linear-gradient(145deg, #151515 0%, #1a1a1a 100%)'
const DARK_FG = '#FAFAFA'
const DIST_DIR = resolve(process.cwd(), 'dist')
const FONT_CACHE_DIR = resolve(process.cwd(), 'node_modules/font')
const FONT_CACHE_FILE = resolve(FONT_CACHE_DIR, 'NotoSansCJKsc-Regular.otf')
const FONT_REMOTE_URL = process.env.OG_FONT_URL || 'https://raw.githubusercontent.com/notofonts/noto-cjk/main/Sans/OTF/SimplifiedChinese/NotoSansCJKsc-Regular.otf'

function getSiteLabel(url: string) {
  try {
    return new URL(url).host
  }
  catch {
    return url.replace(/^https?:\/\//, '').replace(/\/$/, '')
  }
}

function toRoutePath(file: string) {
  return file
    .replace(/^src\/markdown/, '')
    .replace(/^\/?posts\//, '/posts/')
    .replace(/\.mdv$/, '')
}

function toOgAssetPath(routePath: string) {
  return `og${routePath}.png`.replace(/^\//, '')
}

function escapeHtml(raw: string) {
  return raw
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
}

function getTitleFontSize(title: string) {
  if (title.length > 30)
    return 58
  if (title.length > 20)
    return 66
  return 74
}

async function resolveFontBuffer() {
  try {
    return await readFile(FONT_CACHE_FILE)
  }
  catch (error) {
    const e = error as NodeJS.ErrnoException
    if (e.code !== 'ENOENT')
      throw error
  }

  const response = await fetch(FONT_REMOTE_URL)
  if (!response.ok)
    throw new Error(`Failed to download font from ${FONT_REMOTE_URL}: ${response.status} ${response.statusText}`)

  const fontBuffer = Buffer.from(await response.arrayBuffer())
  await mkdir(FONT_CACHE_DIR, { recursive: true })
  await writeFile(FONT_CACHE_FILE, fontBuffer)
  return fontBuffer
}

async function renderOgPng(frontmatter: Frontmatter, routePath: string, fontData: Buffer) {
  const title = escapeHtml(frontmatter.display || frontmatter.title || routePath)
  const titleSize = getTitleFontSize(frontmatter.display || frontmatter.title || routePath)
  const date = formatDate(frontmatter.date, false)
  const duration = frontmatter.duration || ''
  const footer = [date, duration].filter(Boolean).join('  •  ')
  const safeFooter = escapeHtml(footer)
  const safeSiteLabel = escapeHtml(getSiteLabel(DOMAIN))
  const footerText = safeFooter || escapeHtml(routePath)
  const commandLine = escapeHtml(`$ cat ${routePath}.md`)
  const metaLine = `> ${footerText}   |   ${safeSiteLabel}`

  const markup = html(`<div style="width:${WIDTH}px;height:${HEIGHT}px;display:flex;background:${DARK_BG_OUTER};"><div style="position:relative;overflow:hidden;width:100%;height:100%;display:flex;flex-direction:column;background:${DARK_BG_INNER};color:${DARK_FG};border-radius:18px;font-family:NotoSansCJKsc;"><div style="height:58px;display:flex;align-items:center;justify-content:space-between;padding:0 18px;border-bottom:1px solid rgba(250,250,250,0.14);"><div style="display:flex;gap:12px;align-items:center;"><div style="width:12px;height:12px;display:flex;border-radius:9999px;background:rgba(250,250,250,0.75);"></div><div style="width:12px;height:12px;display:flex;border-radius:9999px;background:rgba(250,250,250,0.45);"></div><div style="width:12px;height:12px;display:flex;border-radius:9999px;background:rgba(250,250,250,0.25);"></div></div><div style="display:flex;font-size:18px;letter-spacing:0.06em;opacity:0.72;">jinghaihan / octohash</div></div><div style="flex:1;display:flex;flex-direction:column;justify-content:space-between;padding:34px 42px 36px 42px;"><div style="display:flex;font-size:24px;letter-spacing:0.03em;opacity:0.82;">${commandLine}</div><div style="display:flex;max-width:1030px;font-size:${titleSize}px;line-height:1.06;font-weight:700;letter-spacing:-0.02em;">${title}</div><div style="display:flex;font-size:21px;letter-spacing:0.02em;opacity:0.86;">${metaLine}</div></div></div></div>`)

  const svg = await satori(markup, {
    width: WIDTH,
    height: HEIGHT,
    fonts: [
      {
        name: 'NotoSansCJKsc',
        data: fontData,
        weight: 400,
        style: 'normal',
      },
    ],
  })

  return new Resvg(svg).render().asPng()
}

async function run() {
  const files = await glob('src/markdown/posts/**/*.mdv')
  const postFiles = files.filter((file) => {
    const routePath = toRoutePath(file)
    return routePath.startsWith('/posts/') && !routePath.endsWith('/index')
  })

  if (postFiles.length === 0) {
    console.log('No post markdown files found.')
    return
  }

  const fontData = await resolveFontBuffer()

  for (const file of postFiles) {
    const raw = await readFile(file, 'utf-8')
    const { data } = matter(raw)
    const frontmatter = data
    const routePath = toRoutePath(file)
    const ogAssetPath = toOgAssetPath(routePath)
    const outputPath = resolve(DIST_DIR, ogAssetPath)

    const png = await renderOgPng(frontmatter, routePath, fontData)
    await mkdir(dirname(outputPath), { recursive: true })
    await writeFile(outputPath, png)

    const publicUrl = `${DOMAIN}/${ogAssetPath}`
    console.log(`Generated OG image: ${publicUrl}`)
  }
}

run().catch((error) => {
  console.error('Error generating OG images:', error)
  process.exit(1)
})
