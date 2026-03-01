import type { TimelineEvent } from '@/types'

export const GIST_BASE_URL = 'https://gist.githubusercontent.com/jinghaihan/5e634a23246ce16a31f01aed40c9f656/raw'

export const GIST_PROJECTS_URL = `${GIST_BASE_URL}/projects.json`

export const GIST_STATS_URL = `${GIST_BASE_URL}/github-stats.json`

export const timeline: TimelineEvent[] = [
  {
    date: 'Jan. 2026',
    title: 'Firstly launched.',
    description: 'Inspired by <a href="https://antfu.me/" target="_blank" rel="noopener noreferrer">antfu.me</a> & <a href="https://skywt.net/" target="_blank" rel="noopener noreferrer">skywt.net</a>',
  },
]
