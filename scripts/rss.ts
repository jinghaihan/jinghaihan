import type { FeedOptions, Item } from 'feed'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { dirname } from 'node:path'
import process from 'node:process'
import { Feed } from 'feed'
import matter from 'gray-matter'
import MarkdownIt from 'markdown-it'
import { glob } from 'tinyglobby'
import { DOMAIN } from './shared'

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

async function run() {
  await buildBlogRSS()
}

async function buildBlogRSS() {
  const files = await glob('src/pages/posts/*.md')

  const options: FeedOptions = {
    title: 'octohash',
    description: 'octohash\'s Blog',
    id: `${DOMAIN}/`,
    link: `${DOMAIN}/`,
    copyright: `CC BY-NC-SA 4.0 ${new Date().getFullYear()} © jinghaihan`,
    feedLinks: {
      json: `${DOMAIN}/feed.json`,
      atom: `${DOMAIN}/feed.atom`,
      rss: `${DOMAIN}/feed.xml`,
    },
  }

  const posts = (
    await Promise.all(
      files
        .filter((i: string) => !i.includes('index'))
        .map(async (file: string) => {
          const raw = await readFile(file, 'utf-8')
          const { data: frontmatter, content } = matter(raw)

          const html = markdown.render(content)
            .replace(/src="\//g, `src="${DOMAIN}/`)

          // Convert file path to URL path
          // src/pages/posts/example.md -> /posts/example
          const urlPath = file
            .replace(/^src\/pages/, '')
            .replace(/\.md$/, '')

          return {
            title: frontmatter.title,
            date: new Date(frontmatter.date),
            lang: frontmatter.lang || 'zh-CN',
            content: html,
            author: [AUTHOR],
            link: `${DOMAIN}${urlPath}`,
          }
        }),
    ))
    .filter((post: Item | null): post is Item => post !== null)

  posts.sort((a, b) => b.date.getTime() - a.date.getTime())

  await writeFeed('feed', options, posts)
}

async function writeFeed(name: string, options: FeedOptions, items: Item[]) {
  options.author = AUTHOR
  options.image = `${DOMAIN}/avatar.png`
  options.favicon = `${DOMAIN}/logo.png`

  const feed = new Feed(options)

  items.forEach((item: Item) => feed.addItem(item))

  await mkdir(dirname(`./dist/${name}`), { recursive: true })
  await writeFile(`./dist/${name}.xml`, feed.rss2(), 'utf-8')
  await writeFile(`./dist/${name}.atom`, feed.atom1(), 'utf-8')
  await writeFile(`./dist/${name}.json`, feed.json1(), 'utf-8')
}

run().catch((error) => {
  console.error('Error generating RSS feed:', error)
  process.exit(1)
})
