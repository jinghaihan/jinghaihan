import type { CollectionEntry } from 'astro:content'
import rss from '@astrojs/rss'
import { getCollection } from 'astro:content'
import MarkdownIt from 'markdown-it'
import { DOMAIN } from '../../scripts/shared'

const AUTHOR = {
  name: 'jinghaihan',
  email: 'jhh19980114@gmail.com',
  link: DOMAIN,
}

const markdown = MarkdownIt({
  html: true,
  breaks: true,
  linkify: true,
})

export async function GET(context: { site?: URL }) {
  const posts = (await getCollection('posts'))
    .slice()
    .sort((a: CollectionEntry<'posts'>, b: CollectionEntry<'posts'>) => {
      const dateA = a.data.date
        ? (a.data.date instanceof Date ? a.data.date : new Date(a.data.date)).getTime()
        : -1
      const dateB = b.data.date
        ? (b.data.date instanceof Date ? b.data.date : new Date(b.data.date)).getTime()
        : -1
      return dateB - dateA
    })

  return rss({
    title: 'octohash',
    description: 'octohash\'s Blog',
    site: context.site || new URL(DOMAIN),
    customData: `<author>${AUTHOR.name}</author>`,
    items: posts.map((post: CollectionEntry<'posts'>) => ({
      title: post.data.title || post.data.display || post.id,
      pubDate: post.data.date
        ? (post.data.date instanceof Date ? post.data.date : new Date(post.data.date))
        : undefined,
      description: post.data.display || post.data.title || post.id,
      link: `/posts/${post.id}`,
      content: markdown.render(post.body)
        .replace(/src="\//g, `src="${DOMAIN}/`),
    })),
  })
}
