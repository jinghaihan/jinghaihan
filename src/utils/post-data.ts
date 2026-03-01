import type { Frontmatter } from '@/types'
import { readFile } from 'node:fs/promises'
import { basename, resolve } from 'node:path'
import process from 'node:process'
import matter from 'gray-matter'
import { glob } from 'tinyglobby'

export interface PostData {
  slug: string
  filePath: string
  routePath: string
  frontmatter: Frontmatter
  content: string
}

export interface PostGroup {
  year: string
  posts: PostData[]
}

const POSTS_GLOB = 'src/markdown/posts/*.mdv'

function parseSlug(filePath: string) {
  return basename(filePath).replace(/\.mdv$/, '')
}

function toRoutePath(slug: string) {
  return `/posts/${slug}`
}

function parseDateTime(date?: string) {
  if (!date)
    return -1

  const value = new Date(date).getTime()
  return Number.isNaN(value) ? -1 : value
}

async function readPost(filePath: string): Promise<PostData> {
  const raw = await readFile(resolve(process.cwd(), filePath), 'utf-8')
  const { data, content } = matter(raw)
  const slug = parseSlug(filePath)

  return {
    slug,
    filePath,
    routePath: toRoutePath(slug),
    frontmatter: data as Frontmatter,
    content,
  }
}

export async function getPosts() {
  const files = await glob(POSTS_GLOB)
  const posts = await Promise.all(files.map(readPost))

  return posts
    .filter(post => !post.slug.endsWith('index'))
    .sort((a, b) => parseDateTime(b.frontmatter.date) - parseDateTime(a.frontmatter.date))
}

export async function getPostBySlug(slug: string) {
  const posts = await getPosts()
  return posts.find(post => post.slug === slug) ?? null
}
