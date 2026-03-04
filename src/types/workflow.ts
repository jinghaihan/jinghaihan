export interface WorkflowNode<TNodeKind extends string = string> {
  id: string
  title: string
  kind: TNodeKind
  stage: number
  lane: number
}

export interface WorkflowEdge<TEdgeKind extends string = string> {
  source: string
  target: string
  label: string
  kind: TEdgeKind
}

export interface WorkflowDefinition<TNodeKind extends string = string, TEdgeKind extends string = string> {
  nodes: WorkflowNode<TNodeKind>[]
  edges: WorkflowEdge<TEdgeKind>[]
}

export interface WorkflowCanvasDefinition<TNodeKind extends string = string, TEdgeKind extends string = string> {
  width: number
  height: number
  nodeWidth: number
  nodeHeight: number
  nodes: WorkflowFallbackNode<TNodeKind>[]
  edges: WorkflowFallbackEdge<TNodeKind, TEdgeKind>[]
}

export interface WorkflowNodeLinkItem {
  id: string
  title: string
}

export interface WorkflowPositionedNode<TNodeKind extends string = string> extends WorkflowNode<TNodeKind> {
  x: number
  y: number
}

export interface WorkflowPositionedEdge<TNodeKind extends string = string, TEdgeKind extends string = string> extends WorkflowEdge<TEdgeKind> {
  sourceNode: WorkflowPositionedNode<TNodeKind>
  targetNode: WorkflowPositionedNode<TNodeKind>
}

export interface WorkflowFallbackNode<TNodeKind extends string = string> {
  id: string
  title: string
  kind: TNodeKind
  x: number
  y: number
}

export interface WorkflowFallbackEdge<TNodeKind extends string = string, TEdgeKind extends string = string> extends WorkflowEdge<TEdgeKind> {
  sourceNode: WorkflowFallbackNode<TNodeKind>
  targetNode: WorkflowFallbackNode<TNodeKind>
}
