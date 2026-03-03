import type { ComputedRef, Ref } from 'vue'
import type { Difficulty, Problem, Topic, TopicGroup } from '@/types'
import { computed } from 'vue'

interface UseChecklistFilteringOptions {
  groups: Ref<TopicGroup[]>
  topics: Ref<Topic[]>
  problems: Ref<Record<string, Problem>>
  searchKeyword: Ref<string>
  selectedDifficulties: Ref<Difficulty[]>
  selectedTopicIds: Ref<string[]>
}

interface UseChecklistFilteringReturn {
  filteredGroups: ComputedRef<TopicGroup[]>
  selectedTopics: ComputedRef<Topic[]>
  hasTopicFilters: ComputedRef<boolean>
  addTopicFilter: (topicId: string) => void
  removeTopicFilter: (topicId: string) => void
  toggleTopicFilter: (topicId: string) => void
  clearTopicFilters: () => void
}

export function useChecklistFiltering(options: UseChecklistFilteringOptions): UseChecklistFilteringReturn {
  const normalizedSearchKeyword = computed(() => options.searchKeyword.value.trim().toLowerCase())
  const selectedDifficultySet = computed(() => new Set(options.selectedDifficulties.value))
  const selectedTopicIdSet = computed(() => new Set(options.selectedTopicIds.value))
  const hasTopicFilters = computed(() => selectedTopicIdSet.value.size > 0)
  const topicById = computed(() => new Map(options.topics.value.map(topic => [topic.id, topic])))

  const selectedTopics = computed(() =>
    options.selectedTopicIds.value
      .map(topicId => topicById.value.get(topicId))
      .filter((topic): topic is Topic => Boolean(topic)),
  )

  function getProblem(problemId: string): Problem | undefined {
    return options.problems.value[problemId]
  }

  function matchProblem(problemId: string, keyword: string): boolean {
    const problem = getProblem(problemId)
    if (!problem)
      return problemId.toLowerCase().includes(keyword)

    const problemNumber = (problem.number || problem.id).toLowerCase()
    return problem.title.toLowerCase().includes(keyword)
      || problemNumber.includes(keyword)
      || problem.id.toLowerCase().includes(keyword)
  }

  function matchProblemDifficulty(problemId: string): boolean {
    const difficulty = getProblem(problemId)?.difficulty
    if (!difficulty)
      return true
    return selectedDifficultySet.value.has(difficulty)
  }

  const filteredGroups = computed<TopicGroup[]>(() => {
    const keyword = normalizedSearchKeyword.value
    const hasKeyword = Boolean(keyword)

    const groups: TopicGroup[] = []
    for (const group of options.groups.value) {
      const groupMatched = hasKeyword && group.title.toLowerCase().includes(keyword)

      const matchedTopics: Topic[] = []
      for (const topic of group.topics) {
        if (selectedTopicIdSet.value.size > 0 && !selectedTopicIdSet.value.has(topic.id))
          continue

        const topicMatched = hasKeyword && topic.title.toLowerCase().includes(keyword)
        const matchedProblemIds = topic.problemIds.filter((problemId) => {
          if (!matchProblemDifficulty(problemId))
            return false
          if (!hasKeyword || groupMatched || topicMatched)
            return true
          return matchProblem(problemId, keyword)
        })
        if (matchedProblemIds.length > 0)
          matchedTopics.push({ ...topic, problemIds: matchedProblemIds })
      }

      if (matchedTopics.length > 0)
        groups.push({ ...group, topics: matchedTopics })
    }

    return groups
  })

  function addTopicFilter(topicId: string): void {
    if (selectedTopicIdSet.value.has(topicId))
      return
    options.selectedTopicIds.value = [...options.selectedTopicIds.value, topicId]
  }

  function removeTopicFilter(topicId: string): void {
    options.selectedTopicIds.value = options.selectedTopicIds.value.filter(id => id !== topicId)
  }

  function toggleTopicFilter(topicId: string): void {
    if (selectedTopicIdSet.value.has(topicId)) {
      removeTopicFilter(topicId)
      return
    }
    addTopicFilter(topicId)
  }

  function clearTopicFilters(): void {
    options.selectedTopicIds.value = []
  }

  return {
    filteredGroups,
    selectedTopics,
    hasTopicFilters,
    addTopicFilter,
    removeTopicFilter,
    toggleTopicFilter,
    clearTopicFilters,
  }
}
