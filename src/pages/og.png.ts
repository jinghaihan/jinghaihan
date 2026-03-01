import type { APIRoute } from 'astro'
import { DOMAIN } from '@/constants/site'
import { generateOgImageForSite } from '@/utils/og/generate'

export const prerender = true

export const GET: APIRoute = async ({ site }) => {
  const siteUrl = site?.toString() ?? DOMAIN
  const png = await generateOgImageForSite(siteUrl)
  const bytes = new Uint8Array(png.buffer, png.byteOffset, png.byteLength)
  const body = bytes.slice().buffer as ArrayBuffer

  return new Response(body, {
    headers: {
      'Content-Type': 'image/png',
      'Cache-Control': 'public, max-age=31536000, immutable',
    },
  })
}
