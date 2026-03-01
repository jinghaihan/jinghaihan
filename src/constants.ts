import type { TimelineEvent } from '@/types'

const GIST_ID = '5e634a23246ce16a31f01aed40c9f656'

export const GIST_BASE_URL = `https://gist.githubusercontent.com/jinghaihan/${GIST_ID}/raw`

export const GIST_PROJECTS_URL = `${GIST_BASE_URL}/projects.json`

export const GIST_STATS_URL = `${GIST_BASE_URL}/github-stats.json`

export const timeline: TimelineEvent[] = [
  {
    date: 'Mar. 2026',
    title: 'Rebuilt with Astro.',
    description: 'Rebuilt the whole website using Astro.',
  },
  {
    date: 'Jan. 2026',
    title: 'Firstly launched.',
    description: 'Inspired by <a href="https://antfu.me/" target="_blank" rel="noopener noreferrer">antfu.me</a> & <a href="https://skywt.net/" target="_blank" rel="noopener noreferrer">skywt.net</a>',
  },
]
