import type { APIRoute } from 'astro'
import type { CollectionEntry } from 'astro:content'
import { getCollection } from 'astro:content'
import { DOMAIN } from '@/constants/site'
import { generateOgImageForPost } from '@/utils/og/generate'

export const prerender = true

interface Props {
  post: CollectionEntry<'posts'>
}

export async function getStaticPaths() {
  const posts = await getCollection('posts')

  return posts.map((post: CollectionEntry<'posts'>) => ({
    params: { slug: post.id },
    props: { post },
  }))
}

export const GET: APIRoute = async ({ props, site }) => {
  const { post } = props as Props
  const siteUrl = site?.toString() ?? DOMAIN
  const png = await generateOgImageForPost(post, siteUrl)
  const bytes = new Uint8Array(png.buffer, png.byteOffset, png.byteLength)
  const body = bytes.slice().buffer as ArrayBuffer

  return new Response(body, {
    headers: {
      'Content-Type': 'image/png',
      'Cache-Control': 'public, max-age=31536000, immutable',
    },
  })
}
