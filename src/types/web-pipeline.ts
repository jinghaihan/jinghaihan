export type NodeKind = 'entry' | 'cache' | 'network' | 'server' | 'render' | 'perf'
export type EdgeKind = 'normal' | 'hit' | 'miss' | 'validate' | 'optimize'

export interface WorkflowNode {
  id: string
  title: string
  kind: NodeKind
  stage: number
  lane: number
}

export interface WorkflowEdge {
  source: string
  target: string
  label: string
  kind: EdgeKind
}

export interface NodeLinkItem {
  id: string
  title: string
}

export interface PositionedNode extends WorkflowNode {
  x: number
  y: number
}

export interface PositionedEdge extends WorkflowEdge {
  sourceNode: PositionedNode
  targetNode: PositionedNode
}

export interface FallbackNode {
  id: string
  title: string
  kind: NodeKind
  x: number
  y: number
}

export interface FallbackEdge extends WorkflowEdge {
  sourceNode: FallbackNode
  targetNode: FallbackNode
}
