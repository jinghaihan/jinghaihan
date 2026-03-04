import type { EdgeKind, FallbackEdge, NodeKind } from '@/types/web-pipeline'
import { computed, ref } from 'vue'
import {
  WEB_PIPELINE_FALLBACK_EDGES,
  WEB_PIPELINE_FALLBACK_NODE_HEIGHT,
  WEB_PIPELINE_FALLBACK_NODE_WIDTH,
  WEB_PIPELINE_FALLBACK_NODES,
} from '@/constants/web-pipeline'
import { isDark } from '../use-reactive-dark'

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

interface FallbackEdgeViewModel {
  key: string
  id: string
  label: string
  kind: EdgeKind
  path: string
  labelTransform: string
  labelWidth: number
  visual: EdgeVisualState
}

interface FallbackNodeViewModel {
  id: string
  title: string
  kind: NodeKind
  x: number
  y: number
  visual: NodeVisualState
}

const EDGE_LABEL_HEIGHT = 18
const EDGE_LABEL_PADDING_X = 10
const EDGE_LABEL_OFFSETS = [0.5, 0.62, 0.38, 0.72, 0.28, 0.82, 0.18] as const
const BACKGROUND_CLICK_GUARD_MS = 220

function edgeKey(edge: FallbackEdge, index: number): string {
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

  // Keep near-vertical labels horizontal to avoid tall blocks covering nodes.
  if (Math.abs(angle) > 65)
    return 0

  return angle
}

function edgeBaseWidth(kind: EdgeKind): number {
  if (kind === 'hit')
    return 1.85
  if (kind === 'miss')
    return 1.8
  if (kind === 'validate')
    return 1.7
  if (kind === 'optimize')
    return 1.55
  return 1.65
}

function edgeCurve(edge: FallbackEdge): CubicCurve {
  const source = edge.sourceNode
  const target = edge.targetNode
  const halfWidth = WEB_PIPELINE_FALLBACK_NODE_WIDTH / 2 + 5
  const halfHeight = WEB_PIPELINE_FALLBACK_NODE_HEIGHT / 2 + 4
  const dx = target.x - source.x
  const dy = target.y - source.y

  if (Math.abs(dx) <= WEB_PIPELINE_FALLBACK_NODE_WIDTH * 0.35) {
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

function fallbackLabelGeometry(edge: FallbackEdge, curve: CubicCurve): Pick<EdgeLabelGeometry, 'labelTransform' | 'labelWidth'> {
  const center = cubicPointAt(curve, 0.5)
  const tangent = cubicDerivativeAt(curve, 0.5)
  const rawAngle = Math.atan2(tangent.y, tangent.x) * (180 / Math.PI)
  return {
    labelTransform: `translate(${center.x},${center.y}) rotate(${normalizeTextAngle(rawAngle)})`,
    labelWidth: estimateLabelWidth(edge.label),
  }
}

export function useWebPipeline() {
  const zoomContainerRef = ref<ZoomContainerExpose | null>(null)
  const selectedNodeId = ref('')
  const hoveredNodeId = ref('')
  const ignoreBackgroundClickUntil = ref(0)

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
    for (const edge of WEB_PIPELINE_FALLBACK_EDGES) {
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
    const nodeBoxes: Rect[] = WEB_PIPELINE_FALLBACK_NODES.map(node => ({
      left: node.x - WEB_PIPELINE_FALLBACK_NODE_WIDTH / 2 - 10,
      right: node.x + WEB_PIPELINE_FALLBACK_NODE_WIDTH / 2 + 10,
      top: node.y - WEB_PIPELINE_FALLBACK_NODE_HEIGHT / 2 - 8,
      bottom: node.y + WEB_PIPELINE_FALLBACK_NODE_HEIGHT / 2 + 8,
    }))

    const placedLabelBoxes: Rect[] = []
    const geometry = new Map<string, EdgeLabelGeometry>()

    WEB_PIPELINE_FALLBACK_EDGES.forEach((edge, index) => {
      const key = edgeKey(edge, index)
      const curve = edgeCurve(edge)
      const path = curvePath(curve)
      const directDistance = Math.hypot(curve.end.x - curve.start.x, curve.end.y - curve.start.y)
      const candidates = directDistance < 290
        ? [0.62, 0.38, 0.72, 0.28, 0.5, 0.82, 0.18]
        : EDGE_LABEL_OFFSETS

      let selectedOffset = 0.5
      let selectedWidth = estimateLabelWidth(edge.label)

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
        if (!hitNode && !hitLabel) {
          selectedOffset = offset
          selectedWidth = labelWidth
          placedLabelBoxes.push(labelBox)
          break
        }
      }

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

  const fallbackEdges = computed<FallbackEdgeViewModel[]>(() => {
    const { hasFocus, focusNodeId } = interactionState.value

    return WEB_PIPELINE_FALLBACK_EDGES.map((edge, index) => {
      const key = edgeKey(edge, index)
      const geometry = edgeGeometryMap.value.get(key) ?? (() => {
        const curve = edgeCurve(edge)
        return {
          path: curvePath(curve),
          ...fallbackLabelGeometry(edge, curve),
        }
      })()
      const related = hasFocus && (edge.source === focusNodeId || edge.target === focusNodeId)
      const baseWidth = edgeBaseWidth(edge.kind)

      return {
        key,
        id: `web-pipeline-edge-${key}`,
        label: edge.label,
        kind: edge.kind,
        path: geometry.path,
        labelTransform: geometry.labelTransform,
        labelWidth: geometry.labelWidth,
        visual: {
          opacity: !hasFocus ? 0.3 : related ? 0.98 : 0.08,
          width: !hasFocus ? baseWidth : related ? baseWidth + 1.35 : Math.max(1, baseWidth - 0.45),
          stroke: hasFocus && related ? 'var(--foreground)' : 'var(--border)',
          marker: hasFocus && related ? 'url(#fallback-arrow-focus)' : 'url(#fallback-arrow)',
          labelOpacity: !hasFocus ? 0.82 : related ? 1 : 0.16,
        },
      }
    })
  })

  const fallbackNodes = computed<FallbackNodeViewModel[]>(() => {
    const { hasFocus, focusNodeId, relatedNodeIdSet } = interactionState.value
    const dark = isDark.value

    return WEB_PIPELINE_FALLBACK_NODES.map((node) => {
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

  function nodeColor(kind: NodeKind): string {
    if (isDark.value) {
      if (kind === 'entry')
        return 'oklch(0.64 0.1 248)'
      if (kind === 'cache')
        return 'oklch(0.65 0.085 208)'
      if (kind === 'network')
        return 'oklch(0.61 0.12 230)'
      if (kind === 'server')
        return 'oklch(0.63 0.095 220)'
      if (kind === 'render')
        return 'oklch(0.66 0.08 188)'
      return 'oklch(0.62 0.11 268)'
    }

    if (kind === 'entry')
      return 'oklch(0.62 0.095 252)'
    if (kind === 'cache')
      return 'oklch(0.68 0.088 187)'
    if (kind === 'network')
      return 'oklch(0.6 0.1 224)'
    if (kind === 'server')
      return 'oklch(0.66 0.1 35)'
    if (kind === 'render')
      return 'oklch(0.62 0.085 152)'
    return 'oklch(0.66 0.075 300)'
  }

  function nodeStrokeColor(): string {
    if (isDark.value)
      return 'oklch(0.74 0.03 235)'
    return 'var(--muted-foreground)'
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
