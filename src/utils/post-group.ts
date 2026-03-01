import type { PostData, PostGroup } from './post-data'

function parseDateTime(date?: string) {
  if (!date)
    return -1

  const value = new Date(date).getTime()
  return Number.isNaN(value) ? -1 : value
}

export function groupPostsByYear(posts: PostData[]): PostGroup[] {
  const grouped = posts.reduce((acc, post) => {
    const date = post.frontmatter.date ? new Date(post.frontmatter.date) : null
    const year = date && !Number.isNaN(date.getTime()) ? date.getFullYear().toString() : 'Unknown'

    if (!acc[year])
      acc[year] = []

    acc[year].push(post)
    return acc
  }, {} as Record<string, PostData[]>)

  return Object.entries(grouped)
    .map(([year, yearPosts]) => ({
      year,
      posts: yearPosts
        .slice()
        .sort((a, b) => parseDateTime(b.frontmatter.date) - parseDateTime(a.frontmatter.date)),
    }))
    .sort((a, b) => {
      if (a.year === 'Unknown')
        return 1
      if (b.year === 'Unknown')
        return -1
      return Number.parseInt(b.year) - Number.parseInt(a.year)
    })
}
