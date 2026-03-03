import type { ComputedRef, Ref } from 'vue'
import type { AlgorithmDifficultyStat, AlgorithmProgress, Difficulty, Problem, Topic, TopicGroup } from '@/types'
import { computed } from 'vue'
import { getAlgorithmDifficultyColor } from '@/constants/algorithm'

interface UseChecklistProgressStatsOptions {
  filteredGroups: ComputedRef<TopicGroup[]>
  progress: Ref<AlgorithmProgress>
  problems: Ref<Record<string, Problem>>
}

interface UseChecklistProgressStatsReturn {
  isProblemDone: (problemId: string) => boolean
  topicDoneCount: (topic: Topic) => number
  groupDoneCount: (group: TopicGroup) => number
  groupTotalCount: (group: TopicGroup) => number
  overallDoneCount: ComputedRef<number>
  overallTotalCount: ComputedRef<number>
  difficultyStats: ComputedRef<AlgorithmDifficultyStat[]>
  visibleProblemIds: ComputedRef<string[]>
  unresolvedProblemIds: ComputedRef<string[]>
  randomCandidateProblemIds: ComputedRef<string[]>
  canRandomOpen: ComputedRef<boolean>
  openRandomProblem: () => void
}

const ALL_DIFFICULTIES: Difficulty[] = ['easy', 'medium', 'hard']
const DIFFICULTY_LABEL: Record<Difficulty, string> = {
  easy: '简单',
  medium: '中等',
  hard: '困难',
}

export function useChecklistProgressStats(options: UseChecklistProgressStatsOptions): UseChecklistProgressStatsReturn {
  function getProblem(problemId: string): Problem | undefined {
    return options.problems.value[problemId]
  }

  function isProblemDone(problemId: string): boolean {
    return Boolean(options.progress.value[problemId])
  }

  const visibleProblemIds = computed(() => {
    const ids: string[] = []
    const seen = new Set<string>()

    for (const group of options.filteredGroups.value) {
      for (const topic of group.topics) {
        for (const problemId of topic.problemIds) {
          if (seen.has(problemId))
            continue
          seen.add(problemId)
          ids.push(problemId)
        }
      }
    }

    return ids
  })

  const unresolvedProblemIds = computed(() =>
    visibleProblemIds.value.filter(problemId => !isProblemDone(problemId)),
  )

  const randomCandidateProblemIds = computed(() =>
    unresolvedProblemIds.value.length > 0 ? unresolvedProblemIds.value : visibleProblemIds.value,
  )

  function openRandomProblem(): void {
    const candidates = randomCandidateProblemIds.value
    if (candidates.length === 0)
      return

    const randomIndex = Math.floor(Math.random() * candidates.length)
    const problem = getProblem(candidates[randomIndex])
    const url = problem
      ? `https://leetcode.cn/problems/${problem.slug}/description/`
      : `https://leetcode.cn/problemset/all/?search=${encodeURIComponent(candidates[randomIndex])}`
    window.open(url, '_blank', 'noopener,noreferrer')
  }

  function topicDoneCount(topic: Topic): number {
    return topic.problemIds.reduce((count, problemId) => count + Number(isProblemDone(problemId)), 0)
  }

  function groupDoneCount(group: TopicGroup): number {
    return group.topics.reduce((count, topic) => count + topicDoneCount(topic), 0)
  }

  function groupTotalCount(group: TopicGroup): number {
    return group.topics.reduce((count, topic) => count + topic.problemIds.length, 0)
  }

  const overallDoneCount = computed(() =>
    options.filteredGroups.value.reduce((count, group) => count + groupDoneCount(group), 0),
  )
  const overallTotalCount = computed(() =>
    options.filteredGroups.value.reduce((count, group) => count + groupTotalCount(group), 0),
  )

  const difficultyStats = computed<AlgorithmDifficultyStat[]>(() => {
    const counts: Record<Difficulty, { done: number, total: number }> = {
      easy: { done: 0, total: 0 },
      medium: { done: 0, total: 0 },
      hard: { done: 0, total: 0 },
    }

    for (const problemId of visibleProblemIds.value) {
      const difficulty = getProblem(problemId)?.difficulty
      if (!difficulty)
        continue

      counts[difficulty].total += 1
      if (isProblemDone(problemId))
        counts[difficulty].done += 1
    }

    return ALL_DIFFICULTIES.map(difficulty => ({
      difficulty,
      label: DIFFICULTY_LABEL[difficulty],
      done: counts[difficulty].done,
      total: counts[difficulty].total,
      color: getAlgorithmDifficultyColor(difficulty),
    }))
  })

  const canRandomOpen = computed(() => randomCandidateProblemIds.value.length > 0)

  return {
    isProblemDone,
    topicDoneCount,
    groupDoneCount,
    groupTotalCount,
    overallDoneCount,
    overallTotalCount,
    difficultyStats,
    visibleProblemIds,
    unresolvedProblemIds,
    randomCandidateProblemIds,
    canRandomOpen,
    openRandomProblem,
  }
}
