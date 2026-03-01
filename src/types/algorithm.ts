export type Difficulty = 'easy' | 'medium' | 'hard' | 'unknown'
export type ProblemId = string
export type TopicId = string
export type GroupId = string

export interface Group {
  id: GroupId
  title: string
}

export interface Topic {
  id: TopicId
  title: string
  groupId?: GroupId | null
  difficulty: Difficulty
  problemIds: ProblemId[]
}

export interface Edge {
  source: TopicId
  target: TopicId
}

export interface Problem {
  id: ProblemId
  number: string | null
  slug: string
  title: string
  difficulty: Difficulty
}

export interface AlgorithmRoadmapData {
  version: number
  groups: Group[]
  topics: Topic[]
  edges: Edge[]
  problems: Record<ProblemId, Problem>
}

export type AlgorithmProgress = Record<ProblemId, boolean>
