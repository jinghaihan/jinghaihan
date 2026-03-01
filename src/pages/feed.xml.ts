import rss from '@astrojs/rss'
import MarkdownIt from 'markdown-it'
import { getPosts } from '@/utils/server'
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
  const posts = await getPosts()

  return rss({
    title: 'octohash',
    description: 'octohash\'s Blog',
    site: context.site || new URL(DOMAIN),
    customData: `<author>${AUTHOR.name}</author>`,
    items: posts.map(post => ({
      title: post.frontmatter.title || post.frontmatter.display || post.slug,
      pubDate: post.frontmatter.date ? new Date(post.frontmatter.date) : undefined,
      description: post.frontmatter.display || post.frontmatter.title || post.slug,
      link: post.routePath,
      content: markdown.render(post.content)
        .replace(/src="\//g, `src="${DOMAIN}/`),
    })),
  })
}
