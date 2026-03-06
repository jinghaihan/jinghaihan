export type Difficulty = 'easy' | 'medium' | 'hard'
export type AlgorithmProblemTag = 'hot100' | 'interview150'

export interface Group {
  id: string
  title: string
}

export interface Topic {
  id: string
  title: string
  groupId?: string
  difficulty: Difficulty
  problemIds: string[]
}

export interface TopicGroup {
  id: string
  title: string
  topics: Topic[]
}

export interface Relation {
  source: string
  target: string
}

export interface Problem {
  id: string
  number: string | null
  slug: string
  title: string
  difficulty: Difficulty
  tags?: AlgorithmProblemTag[]
}

export interface AlgorithmDifficultyStat {
  difficulty: Difficulty
  label: string
  done: number
  total: number
  color: string
}

export interface AlgorithmKnowledgeData {
  version: number
  groups: Group[]
  topics: Topic[]
  problems: Record<string, Problem>
}

export type AlgorithmProgress = Partial<Record<string, true>>
