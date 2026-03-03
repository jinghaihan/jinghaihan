import type { SimulationLinkDatum, SimulationNodeDatum } from 'd3'
import type { Ref } from 'vue'
import type { Difficulty, Problem, Relation, Topic, TopicGroup } from '@/types'
import { useResizeObserver } from '@vueuse/core'
import * as d3 from 'd3'
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { ALGORITHM_GROUP_NODE_COLOR, ALGORITHM_TOPIC_NODE_COLOR, getAlgorithmDifficultyColor } from '@/constants/algorithm'

interface GraphNode extends SimulationNodeDatum {
  id: string
  entityId: string
  groupId: string
  label: string
  nodeType: 'group' | 'topic' | 'problem'
  difficulty?: Difficulty
  topicId?: string
  radius: number
}

interface GraphLink extends SimulationLinkDatum<GraphNode> {
  kind: 'belongs' | 'related' | 'contains'
}

interface LabelBox {
  left: number
  right: number
  top: number
  bottom: number
}

interface UseAlgorithmGraphOptions {
  groups: Ref<TopicGroup[]>
  topics: Ref<Topic[]>
  problems: Ref<Record<string, Problem>>
  relations: Ref<Relation[]>
  onNodeSelect: (label: string) => void
}

const UNGROUPED_ID = '__ungrouped__'

export function useAlgorithmGraph(options: UseAlgorithmGraphOptions) {
  const graphContainerRef = ref<HTMLElement | null>(null)
  const graphSvgRef = ref<SVGSVGElement | null>(null)
  const collapsedTopicIds = ref<Set<string>>(new Set())

  let simulation: d3.Simulation<GraphNode, GraphLink> | null = null

  const groupNodeIdSet = computed(() => new Set(options.groups.value.map(group => group.id)))

  function toggleTopicCollapsed(topicId: string): void {
    const next = new Set(collapsedTopicIds.value)
    if (next.has(topicId))
      next.delete(topicId)
    else
      next.add(topicId)
    collapsedTopicIds.value = next
  }

  const graphNodes = computed<GraphNode[]>(() => {
    const groups = options.groups.value.map(group => ({
      id: `group:${group.id}`,
      entityId: group.id,
      groupId: group.id,
      label: group.title,
      nodeType: 'group' as const,
      radius: 7.2,
    }))

    const topics = options.topics.value.map(topic => ({
      id: `topic:${topic.id}`,
      entityId: topic.id,
      groupId: topic.groupId || UNGROUPED_ID,
      label: topic.title,
      nodeType: 'topic' as const,
      difficulty: topic.difficulty,
      radius: 5.8,
    }))

    const problemNodeMap = new Map<string, GraphNode>()
    for (const topic of options.topics.value) {
      if (collapsedTopicIds.value.has(topic.id))
        continue

      for (const problemId of topic.problemIds) {
        if (problemNodeMap.has(problemId))
          continue

        const problem = options.problems.value[problemId]
        problemNodeMap.set(problemId, {
          id: `problem:${problemId}`,
          entityId: problemId,
          groupId: topic.groupId || UNGROUPED_ID,
          label: problem ? `${problem.number || problem.id} ${problem.title}` : problemId,
          nodeType: 'problem',
          topicId: topic.id,
          difficulty: problem?.difficulty ?? topic.difficulty,
          radius: 4.4,
        })
      }
    }

    return [...groups, ...topics, ...Array.from(problemNodeMap.values())]
  })

  const graphLinks = computed<GraphLink[]>(() => {
    const links: GraphLink[] = []

    for (const topic of options.topics.value) {
      const groupId = topic.groupId || UNGROUPED_ID

      links.push({
        source: `group:${groupId}`,
        target: `topic:${topic.id}`,
        kind: 'belongs',
      })

      if (collapsedTopicIds.value.has(topic.id))
        continue

      for (const problemId of topic.problemIds) {
        links.push({
          source: `topic:${topic.id}`,
          target: `problem:${problemId}`,
          kind: 'contains',
        })
      }
    }

    const groupIdSet = groupNodeIdSet.value
    const topicIdSet = new Set(options.topics.value.map(topic => topic.id))

    for (const relation of options.relations.value) {
      const sourceType = groupIdSet.has(relation.source) ? 'group' : topicIdSet.has(relation.source) ? 'topic' : null
      const targetType = groupIdSet.has(relation.target) ? 'group' : topicIdSet.has(relation.target) ? 'topic' : null

      if (!sourceType || !targetType)
        continue

      links.push({
        source: `${sourceType}:${relation.source}`,
        target: `${targetType}:${relation.target}`,
        kind: 'related',
      })
    }

    return links
  })

  function topicLabelWidth(text: string): number {
    return Math.max(18, text.length * 6.1)
  }

  function makeLabelBox(x: number, y: number, width: number, anchor: 'start' | 'middle' | 'end'): LabelBox {
    const height = 11
    const left = anchor === 'middle' ? x - width / 2 : anchor === 'start' ? x : x - width
    const right = left + width

    return {
      left,
      right,
      top: y - height + 2,
      bottom: y + 2,
    }
  }

  function overlaps(a: LabelBox, b: LabelBox): boolean {
    return !(a.right < b.left || a.left > b.right || a.bottom < b.top || a.top > b.bottom)
  }

  function baseFillOpacity(node: GraphNode): number {
    if (node.nodeType === 'group')
      return 0.82
    if (node.nodeType === 'topic')
      return 0.75
    return 0.56
  }

  function createClusterForce(
    clusterCenters: Map<string, { x: number, y: number }>,
  ): d3.Force<GraphNode, GraphLink> {
    let nodesRef: GraphNode[] = []

    const force = (alpha: number) => {
      for (const node of nodesRef) {
        const center = clusterCenters.get(node.groupId)
        if (!center)
          continue

        const strength = node.nodeType === 'group' ? 0.22 : node.nodeType === 'topic' ? 0.13 : 0.08
        node.vx = (node.vx || 0) + (center.x - (node.x || center.x)) * strength * alpha
        node.vy = (node.vy || 0) + (center.y - (node.y || center.y)) * strength * alpha
      }
    }

    force.initialize = (nextNodes: GraphNode[]) => {
      nodesRef = nextNodes
    }

    return force as d3.Force<GraphNode, GraphLink>
  }

  function createCircularBoundaryForce(
    centerX: number,
    centerY: number,
    radius: number,
  ): d3.Force<GraphNode, GraphLink> {
    let nodesRef: GraphNode[] = []

    const force = (alpha: number) => {
      for (const node of nodesRef) {
        const x = node.x || centerX
        const y = node.y || centerY
        const dx = x - centerX
        const dy = y - centerY
        const distance = Math.hypot(dx, dy)
        if (distance <= radius)
          continue

        const overflow = distance - radius
        const pull = overflow * 0.055 * alpha
        node.vx = (node.vx || 0) - (dx / distance) * pull
        node.vy = (node.vy || 0) - (dy / distance) * pull
      }
    }

    force.initialize = (nextNodes: GraphNode[]) => {
      nodesRef = nextNodes
    }

    return force as d3.Force<GraphNode, GraphLink>
  }

  function mountGraph(): void {
    const container = graphContainerRef.value
    const svgElement = graphSvgRef.value
    if (!container || !svgElement)
      return

    simulation?.stop()

    const width = Math.max(420, container.clientWidth)
    const height = Math.max(520, container.clientHeight)
    const centerX = width / 2
    const centerY = height / 2
    const outerRadius = Math.max(180, Math.min(width, height) * 0.45)

    const nodes = graphNodes.value.map(node => ({ ...node }))
    const links = graphLinks.value.map(link => ({ ...link }))

    const clusterCenters = new Map<string, { x: number, y: number }>()
    const groupCount = Math.max(options.groups.value.length, 1)
    const clusterRadius = outerRadius * 0.42

    options.groups.value.forEach((group, index) => {
      const angle = -Math.PI / 2 + (Math.PI * 2 * index) / groupCount
      clusterCenters.set(group.id, {
        x: centerX + Math.cos(angle) * clusterRadius,
        y: centerY + Math.sin(angle) * clusterRadius,
      })
    })

    if (!clusterCenters.has(UNGROUPED_ID))
      clusterCenters.set(UNGROUPED_ID, { x: centerX, y: centerY })

    for (const node of nodes) {
      const center = clusterCenters.get(node.groupId) || { x: centerX, y: centerY }
      node.x = center.x + (Math.random() - 0.5) * 52
      node.y = center.y + (Math.random() - 0.5) * 52
    }

    const svg = d3.select(svgElement)
    svg.selectAll('*').remove()
    svg
      .attr('viewBox', `0 0 ${width} ${height}`)
      .attr('width', width)
      .attr('height', height)

    const root = svg.append('g')

    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.45, 2.0])
      .on('zoom', (event) => {
        root.attr('transform', event.transform.toString())
      })
    svg.call(zoom)

    const initialScale = 1.23
    const initialTransform = d3.zoomIdentity
      .translate(centerX, centerY)
      .scale(initialScale)
      .translate(-centerX, -centerY)
    svg.call(zoom.transform, initialTransform)

    const link = root.append('g')
      .attr('stroke-linecap', 'round')
      .selectAll<SVGLineElement, GraphLink>('line')
      .data(links)
      .join('line')
      .attr('stroke', 'var(--border)')
      .attr('stroke-opacity', (d) => {
        if (d.kind === 'contains')
          return 0.3
        if (d.kind === 'belongs')
          return 0.4
        return 0.2
      })
      .attr('stroke-width', (d) => {
        if (d.kind === 'contains')
          return 1
        if (d.kind === 'belongs')
          return 1.1
        return 1
      })

    const node = root.append('g')
      .attr('stroke', 'var(--border)')
      .selectAll<SVGCircleElement, GraphNode>('circle')
      .data(nodes)
      .join('circle')
      .attr('stroke-opacity', d => d.nodeType === 'problem' ? 0.52 : 0.62)
      .attr('stroke-width', d => d.nodeType === 'problem' ? 1 : 1.5)
      .style('cursor', d => d.nodeType === 'problem' ? 'default' : 'pointer')
      .attr('r', d => d.radius)
      .attr('fill', (d) => {
        if (d.nodeType === 'group')
          return ALGORITHM_GROUP_NODE_COLOR
        if (d.nodeType === 'topic')
          return ALGORITHM_TOPIC_NODE_COLOR
        return getAlgorithmDifficultyColor(d.difficulty)
      })
      .attr('fill-opacity', d => baseFillOpacity(d))

    node.append('title')
      .text((d) => {
        if (d.nodeType === 'problem')
          return d.label
        if (d.nodeType === 'group')
          return d.label
        return d.difficulty ? `${d.label} (${d.difficulty})` : d.label
      })

    const groupNodes = nodes.filter(node => node.nodeType === 'group')
    const topicNodes = nodes.filter(node => node.nodeType === 'topic')

    const groupLabel = root.append('g')
      .selectAll<SVGTextElement, GraphNode>('text')
      .data(groupNodes)
      .join('text')
      .text(d => d.label)
      .attr('font-size', 12)
      .attr('font-weight', 600)
      .attr('fill', 'var(--foreground)')
      .attr('text-anchor', 'middle')
      .attr('dy', -23)
      .style('paint-order', 'stroke')
      .style('stroke', 'var(--background)')
      .style('stroke-width', 3.2)
      .style('stroke-linejoin', 'round')
      .style('pointer-events', 'none')

    const topicLabel = root.append('g')
      .selectAll<SVGTextElement, GraphNode>('text')
      .data(topicNodes)
      .join('text')
      .text(d => d.label)
      .attr('font-size', 12)
      .attr('font-weight', 500)
      .attr('fill', 'var(--foreground)')
      .style('paint-order', 'stroke')
      .style('stroke', 'var(--background)')
      .style('stroke-width', 2.6)
      .style('stroke-linejoin', 'round')
      .style('opacity', 0.82)
      .style('pointer-events', 'none')

    const problemHoverLabel = root.append('g')
      .style('display', 'none')
      .style('pointer-events', 'none')

    const problemHoverLabelBg = problemHoverLabel.append('rect')
      .attr('rx', 6)
      .attr('ry', 6)
      .attr('fill', 'var(--background)')
      .attr('fill-opacity', 0.93)
      .attr('stroke', 'var(--border)')
      .attr('stroke-opacity', 0.72)
      .attr('stroke-width', 0.95)

    const problemHoverLabelText = problemHoverLabel.append('text')
      .attr('font-size', 11)
      .attr('font-weight', 500)
      .attr('fill', 'var(--foreground)')
      .style('paint-order', 'stroke')
      .style('stroke', 'var(--background)')
      .style('stroke-width', 2)
      .style('stroke-linejoin', 'round')

    let hoveredProblemNode: GraphNode | null = null

    function updateProblemHoverLabel(): void {
      if (!hoveredProblemNode) {
        problemHoverLabel.style('display', 'none')
        return
      }

      const x = (hoveredProblemNode.x ?? centerX) + 10
      const y = (hoveredProblemNode.y ?? centerY) - 8

      problemHoverLabelText
        .text(hoveredProblemNode.label)
        .attr('x', x)
        .attr('y', y)

      const bbox = problemHoverLabelText.node()?.getBBox()
      if (!bbox)
        return

      problemHoverLabelBg
        .attr('x', bbox.x - 6)
        .attr('y', bbox.y - 4)
        .attr('width', bbox.width + 12)
        .attr('height', bbox.height + 8)

      problemHoverLabel.style('display', null)
    }

    function layoutTopicLabels(): void {
      const placed: LabelBox[] = []

      topicLabel.each(function (d) {
        const nodeX = d.x ?? centerX
        const nodeY = d.y ?? centerY

        const vx = nodeX - centerX
        const vy = nodeY - centerY
        const length = Math.hypot(vx, vy) || 1
        const ux = vx / length
        const uy = vy / length

        let x = nodeX + ux * 14
        let y = nodeY + uy * 14

        const anchor: 'start' | 'middle' | 'end' = Math.abs(ux) < 0.26 ? 'middle' : ux > 0 ? 'start' : 'end'
        const width = topicLabelWidth(d.label)

        let box = makeLabelBox(x, y, width, anchor)
        let attempt = 0
        while (placed.some(existing => overlaps(existing, box)) && attempt < 6) {
          x += ux * 4
          y += uy * 5
          box = makeLabelBox(x, y, width, anchor)
          attempt += 1
        }

        placed.push(box)

        d3.select<SVGTextElement, GraphNode>(this)
          .attr('x', x)
          .attr('y', y)
          .attr('text-anchor', anchor)
      })
    }

    const drag = d3.drag<SVGCircleElement, GraphNode>()
      .on('start', (event, d) => {
        if (!event.active)
          simulation?.alphaTarget(0.22).restart()
        d.fx = d.x
        d.fy = d.y
      })
      .on('drag', (event, d) => {
        d.fx = event.x
        d.fy = event.y
      })
      .on('end', (event, d) => {
        if (!event.active)
          simulation?.alphaTarget(0)
        d.fx = null
        d.fy = null
      })

    const interactiveNode = node.filter(d => d.nodeType !== 'problem')

    interactiveNode
      .on('click', (event, d) => {
        if (event.defaultPrevented)
          return

        if (d.nodeType === 'topic')
          toggleTopicCollapsed(d.entityId)

        options.onNodeSelect(d.label)
      })

    node
      .on('mouseenter', function (_event, d) {
        const hoverScale = d.nodeType === 'group' ? 1.2 : d.nodeType === 'topic' ? 1.16 : 1.2
        d3.select(this)
          .interrupt()
          .transition()
          .duration(130)
          .attr('r', d.radius * hoverScale)
          .attr('fill-opacity', d.nodeType === 'problem' ? 0.9 : 0.9)

        if (d.nodeType === 'problem') {
          hoveredProblemNode = d
          updateProblemHoverLabel()
        }
      })
      .on('mouseleave', function (_event, d) {
        d3.select(this)
          .interrupt()
          .transition()
          .duration(130)
          .attr('r', d.radius)
          .attr('fill-opacity', baseFillOpacity(d))

        if (d.nodeType === 'problem') {
          hoveredProblemNode = null
          updateProblemHoverLabel()
        }
      })

    interactiveNode.call(drag)

    simulation = d3.forceSimulation(nodes)
      .alpha(0.92)
      .alphaMin(0.02)
      .alphaDecay(0.022)
      .velocityDecay(0.38)
      .force('link', d3.forceLink<GraphNode, GraphLink>(links)
        .id(d => d.id)
        .distance((d) => {
          if (d.kind === 'contains')
            return 12
          if (d.kind === 'belongs')
            return 26
          return 58
        })
        .strength((d) => {
          if (d.kind === 'contains')
            return 0.44
          if (d.kind === 'belongs')
            return 0.34
          return 0.085
        }))
      .force('charge', d3.forceManyBody<GraphNode>().strength((d) => {
        if (d.nodeType === 'problem')
          return -18
        if (d.nodeType === 'topic')
          return -64
        return -96
      }))
      .force('center', d3.forceCenter(centerX, centerY))
      .force('x', d3.forceX(centerX).strength(0.03))
      .force('y', d3.forceY(centerY).strength(0.03))
      .force('cluster', createClusterForce(clusterCenters))
      .force('boundary', createCircularBoundaryForce(centerX, centerY, outerRadius))
      .force('collide', d3.forceCollide<GraphNode>().radius((d) => {
        if (d.nodeType === 'group')
          return d.radius + 4.4
        if (d.nodeType === 'topic')
          return d.radius + 2.9
        return d.radius + 0.85
      }).iterations(2))
      .on('tick', () => {
        link
          .attr('x1', d => (d.source as GraphNode).x || 0)
          .attr('y1', d => (d.source as GraphNode).y || 0)
          .attr('x2', d => (d.target as GraphNode).x || 0)
          .attr('y2', d => (d.target as GraphNode).y || 0)

        node
          .attr('cx', d => d.x || 0)
          .attr('cy', d => d.y || 0)

        groupLabel
          .attr('x', d => d.x || 0)
          .attr('y', d => d.y || 0)

        layoutTopicLabels()
        updateProblemHoverLabel()
      })
  }

  onMounted(() => {
    mountGraph()
  })

  useResizeObserver(graphContainerRef, () => {
    mountGraph()
  })

  onBeforeUnmount(() => {
    simulation?.stop()
  })

  watch([graphNodes, graphLinks], () => {
    mountGraph()
  })

  return {
    graphContainerRef,
    graphSvgRef,
  }
}
