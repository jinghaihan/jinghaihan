import type { APIRoute } from 'astro'
import { Resvg } from '@resvg/resvg-js'

export const prerender = true

const width = 1200
const height = 630

const svg = `
<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#111111" />
      <stop offset="100%" stop-color="#1f2937" />
    </linearGradient>
    <linearGradient id="line" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="#94a3b8" stop-opacity="0.45" />
      <stop offset="100%" stop-color="#94a3b8" stop-opacity="0.08" />
    </linearGradient>
  </defs>

  <rect width="${width}" height="${height}" fill="url(#bg)" rx="32" />
  <rect x="56" y="56" width="${width - 112}" height="${height - 112}" fill="none" stroke="url(#line)" stroke-width="2" rx="26" />

  <text x="100" y="220" fill="#f8fafc" font-family="ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, Liberation Mono, Courier New, monospace" font-size="30" opacity="0.72">$ cat about.mdx</text>
  <text x="100" y="350" fill="#ffffff" font-family="ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial" font-size="88" font-weight="700">octohash</text>
  <text x="100" y="445" fill="#cbd5e1" font-family="ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial" font-size="42" opacity="0.9">jinghaihan / blog / projects</text>
  <text x="100" y="530" fill="#94a3b8" font-family="ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, Liberation Mono, Courier New, monospace" font-size="26" opacity="0.86">https://octohash.me</text>
</svg>
`

export const GET: APIRoute = () => {
  const png = new Resvg(svg).render().asPng()
  const bytes = new Uint8Array(png.buffer, png.byteOffset, png.byteLength)
  const body = bytes.slice().buffer as ArrayBuffer

  return new Response(body, {
    headers: {
      'Content-Type': 'image/png',
      'Cache-Control': 'public, max-age=31536000, immutable',
    },
  })
}
