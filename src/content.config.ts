import { glob } from 'astro/loaders'
import { defineCollection, z } from 'astro:content'

const frontmatterSchema = z.object({
  title: z.string().optional(),
  subtitle: z.string().optional(),
  display: z.string().optional(),
  image: z.string().optional(),
  date: z.union([z.string(), z.date()]).optional(),
  duration: z.string().optional(),
  lang: z.enum(['zh-CN', 'en-US']).optional(),
})

const posts = defineCollection({
  loader: glob({ pattern: '*.mdx', base: './src/markdown/posts' }),
  schema: frontmatterSchema,
})

const pages = defineCollection({
  loader: glob({ pattern: '*.mdx', base: './src/markdown/pages' }),
  schema: frontmatterSchema,
})

export const collections = {
  pages,
  posts,
}
