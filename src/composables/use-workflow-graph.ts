import type { Ref } from 'vue'
import type { WorkflowFallbackEdge, WorkflowFallbackNode } from '@/types/workflow'
import { computed, ref } from 'vue'

interface ZoomContainerExpose {
  fitContent: () => void
}

interface Point {
  x: number
  y: number
}

interface CubicCurve {
  start: Point
  control1: Point
  control2: Point
  end: Point
}

interface Rect {
  left: number
  right: number
  top: number
  bottom: number
}

interface EdgeLabelGeometry {
  path: string
  labelTransform: string
  labelWidth: number
}

interface EdgeVisualState {
  opacity: number
  width: number
  stroke: string
  marker: string
  labelOpacity: number
}

interface NodeVisualState {
  scale: number
  opacity: number
  backdropOpacity: number
  fillOpacity: number
  strokeOpacity: number
  strokeWidth: number
}

export interface WorkflowFallbackEdgeViewModel<TEdgeKind extends string = string> {
  key: string
  id: string
  label: string
  kind: TEdgeKind
  path: string
  labelTransform: string
  labelWidth: number
  visual: EdgeVisualState
}

export interface WorkflowFallbackNodeViewModel<TNodeKind extends string = string> {
  id: string
  title: string
  kind: TNodeKind
  x: number
  y: number
  visual: NodeVisualState
}

interface UseWorkflowGraphOptions<TNodeKind extends string, TEdgeKind extends string> {
  nodes: WorkflowFallbackNode<TNodeKind>[]
  edges: WorkflowFallbackEdge<TNodeKind, TEdgeKind>[]
  nodeWidth: number
  nodeHeight: number
  isDark: Ref<boolean>
  getNodeColor: (kind: TNodeKind, isDark: boolean) => string
  getNodeStrokeColor?: (isDark: boolean) => string
  getEdgeBaseWidth?: (kind: TEdgeKind) => number
}

const EDGE_LABEL_HEIGHT = 18
const EDGE_LABEL_PADDING_X = 10
const EDGE_LABEL_OFFSETS = [0.5, 0.62, 0.38, 0.72, 0.28, 0.82, 0.18] as const
const BACKGROUND_CLICK_GUARD_MS = 220

function edgeKey<TNodeKind extends string, TEdgeKind extends string>(edge: WorkflowFallbackEdge<TNodeKind, TEdgeKind>, index: number): string {
  return `${index}-${edge.source}-${edge.target}-${edge.kind}`
}

function overlaps(a: Rect, b: Rect): boolean {
  return !(a.right < b.left || a.left > b.right || a.bottom < b.top || a.top > b.bottom)
}

function cubicPointAt(curve: CubicCurve, t: number): Point {
  const mt = 1 - t
  const mt2 = mt * mt
  const t2 = t * t

  return {
    x: mt2 * mt * curve.start.x
      + 3 * mt2 * t * curve.control1.x
      + 3 * mt * t2 * curve.control2.x
      + t2 * t * curve.end.x,
    y: mt2 * mt * curve.start.y
      + 3 * mt2 * t * curve.control1.y
      + 3 * mt * t2 * curve.control2.y
      + t2 * t * curve.end.y,
  }
}

function cubicDerivativeAt(curve: CubicCurve, t: number): Point {
  const mt = 1 - t
  return {
    x: 3 * mt * mt * (curve.control1.x - curve.start.x)
      + 6 * mt * t * (curve.control2.x - curve.control1.x)
      + 3 * t * t * (curve.end.x - curve.control2.x),
    y: 3 * mt * mt * (curve.control1.y - curve.start.y)
      + 6 * mt * t * (curve.control2.y - curve.control1.y)
      + 3 * t * t * (curve.end.y - curve.control2.y),
  }
}

function estimateLabelWidth(label: string): number {
  return Math.max(56, label.length * 9.2 + EDGE_LABEL_PADDING_X * 2)
}

function normalizeTextAngle(rawAngle: number): number {
  let angle = rawAngle
  if (angle > 90)
    angle -= 180
  if (angle < -90)
    angle += 180
  if (Math.abs(angle) > 65)
    return 0
  return angle
}

function edgeCurve<TNodeKind extends string, TEdgeKind extends string>(
  edge: WorkflowFallbackEdge<TNodeKind, TEdgeKind>,
  nodeWidth: number,
  nodeHeight: number,
): CubicCurve {
  const source = edge.sourceNode
  const target = edge.targetNode
  const halfWidth = nodeWidth / 2 + 5
  const halfHeight = nodeHeight / 2 + 4
  const dx = target.x - source.x
  const dy = target.y - source.y

  if (Math.abs(dx) <= nodeWidth * 0.35) {
    const down = dy >= 0
    const start = {
      x: source.x,
      y: source.y + (down ? halfHeight : -halfHeight),
    }
    const end = {
      x: target.x,
      y: target.y + (down ? -halfHeight : halfHeight),
    }
    const curveY = Math.max(64, Math.abs(end.y - start.y) * 0.62)
    const offsetY = down ? curveY : -curveY

    return {
      start,
      control1: { x: start.x, y: start.y + offsetY },
      control2: { x: end.x, y: end.y - offsetY },
      end,
    }
  }

  const forward = dx > 0
  const start = {
    x: source.x + (forward ? halfWidth : -halfWidth),
    y: source.y,
  }
  const end = {
    x: target.x + (forward ? -halfWidth : halfWidth),
    y: target.y,
  }
  const curveX = Math.max(108, Math.abs(end.x - start.x) * 0.57)

  if (forward) {
    return {
      start,
      control1: { x: start.x + curveX, y: start.y },
      control2: { x: end.x - curveX, y: end.y },
      end,
    }
  }

  return {
    start,
    control1: { x: start.x - curveX, y: start.y },
    control2: { x: end.x + curveX, y: end.y },
    end,
  }
}

function curvePath(curve: CubicCurve): string {
  return `M${curve.start.x},${curve.start.y} C${curve.control1.x},${curve.control1.y} ${curve.control2.x},${curve.control2.y} ${curve.end.x},${curve.end.y}`
}

function fallbackLabelGeometry<TNodeKind extends string, TEdgeKind extends string>(
  edge: WorkflowFallbackEdge<TNodeKind, TEdgeKind>,
  curve: CubicCurve,
): Pick<EdgeLabelGeometry, 'labelTransform' | 'labelWidth'> {
  const center = cubicPointAt(curve, 0.5)
  const tangent = cubicDerivativeAt(curve, 0.5)
  const rawAngle = Math.atan2(tangent.y, tangent.x) * (180 / Math.PI)
  return {
    labelTransform: `translate(${center.x},${center.y}) rotate(${normalizeTextAngle(rawAngle)})`,
    labelWidth: estimateLabelWidth(edge.label),
  }
}

export function useWorkflowGraph<TNodeKind extends string, TEdgeKind extends string>(options: UseWorkflowGraphOptions<TNodeKind, TEdgeKind>) {
  const zoomContainerRef = ref<ZoomContainerExpose | null>(null)
  const selectedNodeId = ref('')
  const hoveredNodeId = ref('')
  const ignoreBackgroundClickUntil = ref(0)

  const resolveEdgeBaseWidth = options.getEdgeBaseWidth ?? (() => 1.65)
  const resolveNodeStrokeColor = options.getNodeStrokeColor ?? (dark => dark ? 'oklch(0.74 0.03 235)' : 'var(--muted-foreground)')

  const interactionState = computed(() => {
    const focusNodeId = hoveredNodeId.value || selectedNodeId.value
    const relatedNodeIdSet = new Set<string>()

    if (!focusNodeId) {
      return {
        hasFocus: false,
        focusNodeId: '',
        relatedNodeIdSet,
      }
    }

    relatedNodeIdSet.add(focusNodeId)
    for (const edge of options.edges) {
      if (edge.source === focusNodeId || edge.target === focusNodeId) {
        relatedNodeIdSet.add(edge.source)
        relatedNodeIdSet.add(edge.target)
      }
    }

    return {
      hasFocus: true,
      focusNodeId,
      relatedNodeIdSet,
    }
  })

  const edgeGeometryMap = computed(() => {
    const nodeBoxes: Rect[] = options.nodes.map(node => ({
      left: node.x - options.nodeWidth / 2 - 10,
      right: node.x + options.nodeWidth / 2 + 10,
      top: node.y - options.nodeHeight / 2 - 8,
      bottom: node.y + options.nodeHeight / 2 + 8,
    }))

    const placedLabelBoxes: Rect[] = []
    const geometry = new Map<string, EdgeLabelGeometry>()

    options.edges.forEach((edge, index) => {
      const key = edgeKey(edge, index)
      const curve = edgeCurve(edge, options.nodeWidth, options.nodeHeight)
      const path = curvePath(curve)
      const directDistance = Math.hypot(curve.end.x - curve.start.x, curve.end.y - curve.start.y)
      const candidates = directDistance < 290
        ? [0.62, 0.38, 0.72, 0.28, 0.5, 0.82, 0.18]
        : EDGE_LABEL_OFFSETS

      let selectedOffset = 0.5
      let selectedWidth = estimateLabelWidth(edge.label)
      let selectedBox: Rect | null = null
      let bestPenalty = Number.POSITIVE_INFINITY

      for (const offset of candidates) {
        const point = cubicPointAt(curve, offset)
        const labelWidth = estimateLabelWidth(edge.label)
        const labelBox: Rect = {
          left: point.x - labelWidth / 2,
          right: point.x + labelWidth / 2,
          top: point.y - EDGE_LABEL_HEIGHT / 2,
          bottom: point.y + EDGE_LABEL_HEIGHT / 2,
        }

        const hitNode = nodeBoxes.some(nodeBox => overlaps(nodeBox, labelBox))
        const hitLabel = placedLabelBoxes.some(existing => overlaps(existing, labelBox))
        const penalty = (hitNode ? 100 : 0) + (hitLabel ? 10 : 0)

        if (!hitNode && !hitLabel) {
          selectedOffset = offset
          selectedWidth = labelWidth
          selectedBox = labelBox
          break
        }

        if (penalty < bestPenalty) {
          bestPenalty = penalty
          selectedOffset = offset
          selectedWidth = labelWidth
          selectedBox = labelBox
        }
      }

      if (selectedBox)
        placedLabelBoxes.push(selectedBox)

      const point = cubicPointAt(curve, selectedOffset)
      const tangent = cubicDerivativeAt(curve, selectedOffset)
      const rawAngle = Math.atan2(tangent.y, tangent.x) * (180 / Math.PI)
      geometry.set(key, {
        path,
        labelTransform: `translate(${point.x},${point.y}) rotate(${normalizeTextAngle(rawAngle)})`,
        labelWidth: selectedWidth,
      })
    })

    return geometry
  })

  const fallbackEdges = computed<WorkflowFallbackEdgeViewModel<TEdgeKind>[]>(() => {
    const { hasFocus, focusNodeId } = interactionState.value

    return options.edges.map((edge, index) => {
      const key = edgeKey(edge, index)
      const geometry = edgeGeometryMap.value.get(key) ?? (() => {
        const curve = edgeCurve(edge, options.nodeWidth, options.nodeHeight)
        return {
          path: curvePath(curve),
          ...fallbackLabelGeometry(edge, curve),
        }
      })()
      const related = hasFocus && (edge.source === focusNodeId || edge.target === focusNodeId)
      const baseWidth = resolveEdgeBaseWidth(edge.kind)

      return {
        key,
        id: `workflow-edge-${key}`,
        label: edge.label,
        kind: edge.kind,
        path: geometry.path,
        labelTransform: geometry.labelTransform,
        labelWidth: geometry.labelWidth,
        visual: {
          opacity: !hasFocus ? 0.3 : related ? 0.98 : 0.08,
          width: !hasFocus ? baseWidth : related ? baseWidth + 1.35 : Math.max(1, baseWidth - 0.45),
          stroke: hasFocus && related ? 'var(--foreground)' : 'var(--border)',
          marker: hasFocus && related ? 'url(#workflow-arrow-focus)' : 'url(#workflow-arrow)',
          labelOpacity: !hasFocus ? 0.82 : related ? 1 : 0.16,
        },
      }
    })
  })

  const fallbackNodes = computed<WorkflowFallbackNodeViewModel<TNodeKind>[]>(() => {
    const { hasFocus, focusNodeId, relatedNodeIdSet } = interactionState.value
    const dark = options.isDark.value

    return options.nodes.map((node) => {
      const focused = hasFocus && focusNodeId === node.id
      const related = hasFocus && relatedNodeIdSet.has(node.id)

      return {
        ...node,
        visual: {
          scale: focused ? 1.15 : 1,
          opacity: !hasFocus || related ? 1 : (dark ? 0.4 : 0.26),
          backdropOpacity: dark ? 0.8 : 0.95,
          fillOpacity: !hasFocus
            ? (dark ? 0.2 : 0.18)
            : focused
              ? (dark ? 0.38 : 0.42)
              : related
                ? (dark ? 0.28 : 0.22)
                : (dark ? 0.08 : 0.1),
          strokeOpacity: dark ? 0.72 : 0.54,
          strokeWidth: !hasFocus
            ? (dark ? 1.25 : 1.2)
            : focused
              ? (dark ? 2.05 : 2.2)
              : related
                ? (dark ? 1.55 : 1.5)
                : (dark ? 1 : 1),
        },
      }
    })
  })

  function nodeColor(kind: TNodeKind): string {
    return options.getNodeColor(kind, options.isDark.value)
  }

  function nodeStrokeColor(): string {
    return resolveNodeStrokeColor(options.isDark.value)
  }

  function onFallbackNodeEnter(nodeId: string): void {
    hoveredNodeId.value = nodeId
  }

  function onFallbackNodeLeave(): void {
    hoveredNodeId.value = ''
  }

  function onFallbackNodeClick(nodeId: string, event: MouseEvent): void {
    event.stopPropagation()
    selectedNodeId.value = selectedNodeId.value === nodeId ? '' : nodeId
  }

  function onViewportDragEnd(moved: boolean): void {
    if (!moved)
      return

    ignoreBackgroundClickUntil.value = Date.now() + BACKGROUND_CLICK_GUARD_MS
  }

  function onFallbackBackgroundClick(): void {
    if (Date.now() <= ignoreBackgroundClickUntil.value)
      return

    hoveredNodeId.value = ''
    selectedNodeId.value = ''
  }

  return {
    zoomContainerRef,
    selectedNodeId,
    fallbackEdges,
    fallbackNodes,
    nodeColor,
    nodeStrokeColor,
    onFallbackNodeEnter,
    onFallbackNodeLeave,
    onFallbackNodeClick,
    onViewportDragEnd,
    onFallbackBackgroundClick,
  }
}
