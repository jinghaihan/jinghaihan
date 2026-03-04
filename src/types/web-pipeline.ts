import type {
  WorkflowEdge as GenericWorkflowEdge,
  WorkflowFallbackEdge as GenericWorkflowFallbackEdge,
  WorkflowFallbackNode as GenericWorkflowFallbackNode,
  WorkflowNode as GenericWorkflowNode,
  WorkflowNodeLinkItem as GenericWorkflowNodeLinkItem,
  WorkflowPositionedEdge as GenericWorkflowPositionedEdge,
  WorkflowPositionedNode as GenericWorkflowPositionedNode,
} from './workflow'

export type NodeKind = 'entry' | 'cache' | 'network' | 'server' | 'render' | 'perf'
export type EdgeKind = 'normal' | 'hit' | 'miss' | 'validate' | 'optimize'

export type WorkflowNode = GenericWorkflowNode<NodeKind>

export type WorkflowEdge = GenericWorkflowEdge<EdgeKind>

export type NodeLinkItem = GenericWorkflowNodeLinkItem

export type PositionedNode = GenericWorkflowPositionedNode<NodeKind>

export type PositionedEdge = GenericWorkflowPositionedEdge<NodeKind, EdgeKind>

export type FallbackNode = GenericWorkflowFallbackNode<NodeKind>

export type FallbackEdge = GenericWorkflowFallbackEdge<NodeKind, EdgeKind>
