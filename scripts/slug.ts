import { resolve } from 'node:path'
import process from 'node:process'

const POSTS_ROOT = resolve(process.cwd(), 'src/pages/posts').replaceAll('\\', '/')

export function resolvePostSlug(id: string) {
  const normalized = id.split('?')[0].replaceAll('\\', '/')
  if (!normalized.startsWith(`${POSTS_ROOT}/`))
    return null

  const relative = normalized.slice(POSTS_ROOT.length + 1)
  if (!relative.endsWith('.md'))
    return null
  if (relative === 'index.md' || relative.endsWith('/index.md'))
    return null

  return relative.replace(/\.md$/, '')
}
