<script setup lang="ts">
import type { SimulationLinkDatum, SimulationNodeDatum } from 'd3'
import type { Difficulty, Relation, Topic, TopicGroup } from '@/types'
import * as d3 from 'd3'
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'

interface Props {
  groups: TopicGroup[]
  topics: Topic[]
  relations: Relation[]
}

interface GraphNode extends SimulationNodeDatum {
  id: string
  label: string
  nodeType: 'group' | 'topic'
  difficulty?: Difficulty
  radius: number
}

interface GraphLink extends SimulationLinkDatum<GraphNode> {
  kind: 'belongs' | 'related'
}

interface LabelBox {
  left: number
  right: number
  top: number
  bottom: number
}

const props = defineProps<Props>()

const UNGROUPED_ID = '__ungrouped__'

const graphContainerRef = ref<HTMLElement | null>(null)
const graphSvgRef = ref<SVGSVGElement | null>(null)

let simulation: d3.Simulation<GraphNode, GraphLink> | null = null
let resizeObserver: ResizeObserver | null = null

const groupNodeIdSet = computed(() => new Set(props.groups.map(group => group.id)))

const graphNodes = computed<GraphNode[]>(() => {
  const groups = props.groups.map(group => ({
    id: `group:${group.id}`,
    label: group.title,
    nodeType: 'group' as const,
    radius: 8,
  }))

  const topics = props.topics.map(topic => ({
    id: `topic:${topic.id}`,
    label: topic.title,
    nodeType: 'topic' as const,
    difficulty: topic.difficulty,
    radius: 6.5,
  }))

  return [...groups, ...topics]
})

function difficultyColor(difficulty?: Difficulty): string {
  if (difficulty === 'easy')
    return '#86efac'
  if (difficulty === 'medium')
    return '#fcd34d'
  if (difficulty === 'hard')
    return '#fca5a5'
  return 'var(--muted)'
}

function topicLabelWidth(text: string): number {
  return Math.max(18, text.length * 6.2)
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

const graphLinks = computed<GraphLink[]>(() => {
  const links: GraphLink[] = []

  for (const topic of props.topics) {
    const groupId = topic.groupId || UNGROUPED_ID
    links.push({
      source: `group:${groupId}`,
      target: `topic:${topic.id}`,
      kind: 'belongs',
    })
  }

  const groupIdSet = groupNodeIdSet.value
  const topicIdSet = new Set(props.topics.map(topic => topic.id))

  for (const relation of props.relations) {
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

function mountGraph(): void {
  const container = graphContainerRef.value
  const svgElement = graphSvgRef.value
  if (!container || !svgElement)
    return

  simulation?.stop()

  const width = Math.max(420, container.clientWidth)
  const height = Math.max(520, container.clientHeight)
  const nodes = graphNodes.value.map(node => ({ ...node }))
  const links = graphLinks.value.map(link => ({ ...link }))
  const centerX = width / 2
  const centerY = height / 2
  const topicRingRadius = Math.max(148, Math.min(width, height) * 0.35)
  const groupRingRadius = topicRingRadius * 0.42

  // Seed node positions on concentric circles to keep the graph compact and round.
  const groupNodes = nodes.filter(node => node.nodeType === 'group')
  const topicNodes = nodes.filter(node => node.nodeType === 'topic')

  groupNodes.forEach((node, index) => {
    const angle = (Math.PI * 2 * index) / Math.max(groupNodes.length, 1)
    node.x = centerX + Math.cos(angle) * groupRingRadius
    node.y = centerY + Math.sin(angle) * groupRingRadius
  })
  topicNodes.forEach((node, index) => {
    const angle = (Math.PI * 2 * index) / Math.max(topicNodes.length, 1)
    node.x = centerX + Math.cos(angle) * topicRingRadius
    node.y = centerY + Math.sin(angle) * topicRingRadius
  })

  const svg = d3.select(svgElement)
  svg.selectAll('*').remove()
  svg
    .attr('viewBox', `0 0 ${width} ${height}`)
    .attr('width', width)
    .attr('height', height)

  const root = svg.append('g')

  const zoom = d3.zoom<SVGSVGElement, unknown>()
    .scaleExtent([0.45, 1.8])
    .on('zoom', (event) => {
      root.attr('transform', event.transform.toString())
    })
  svg.call(zoom)

  const initialScale = 1.225
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
    .attr('stroke-opacity', d => d.kind === 'belongs' ? 0.7 : 0.45)
    .attr('stroke-width', 1.2)

  const node = root.append('g')
    .attr('stroke', 'var(--background)')
    .attr('stroke-width', 1.4)
    .selectAll<SVGCircleElement, GraphNode>('circle')
    .data(nodes)
    .join('circle')
    .style('cursor', d => d.nodeType === 'topic' ? 'pointer' : 'grab')
    .attr('r', d => d.radius)
    .attr('fill', d => d.nodeType === 'group' ? 'var(--muted-foreground)' : difficultyColor(d.difficulty))
    .attr('fill-opacity', 0.7)

  node.append('title')
    .text((d) => {
      if (d.nodeType === 'group')
        return d.label
      return d.difficulty ? `${d.label} (${d.difficulty})` : d.label
    })

  const groupLabel = root.append('g')
    .selectAll<SVGTextElement, GraphNode>('text')
    .data(groupNodes)
    .join('text')
    .text(d => d.label)
    .attr('font-size', 12)
    .attr('font-weight', 600)
    .attr('fill', 'var(--foreground)')
    .attr('text-anchor', 'middle')
    .attr('dy', -24)
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
    .attr('dy', 0)
    .style('paint-order', 'stroke')
    .style('stroke', 'var(--background)')
    .style('stroke-width', 2.6)
    .style('stroke-linejoin', 'round')
    .style('opacity', 0.82)
    .style('transition', 'opacity 140ms ease')
    .style('pointer-events', 'none')

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

      let x = nodeX + ux * 16
      let y = nodeY + uy * 16

      const anchor: 'start' | 'middle' | 'end' = Math.abs(ux) < 0.26 ? 'middle' : ux > 0 ? 'start' : 'end'
      const width = topicLabelWidth(d.label)

      let box = makeLabelBox(x, y, width, anchor)
      let attempt = 0
      while (placed.some(existing => overlaps(existing, box)) && attempt < 8) {
        x += ux * 4
        y += uy * 6
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
        simulation?.alphaTarget(0.2).restart()
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

  node
    .on('mouseenter', function (_event, d) {
      const hoverScale = d.nodeType === 'group' ? 1.5 : 1.4
      d3.select(this)
        .interrupt()
        .transition()
        .duration(150)
        .attr('r', d.radius * hoverScale)
        .attr('fill-opacity', d.nodeType === 'group' ? 0.9 : 0.94)
    })
    .on('mouseleave', function (_event, d) {
      d3.select(this)
        .interrupt()
        .transition()
        .duration(150)
        .attr('r', d.radius)
        .attr('fill-opacity', 0.7)
    })

  node.call(drag)

  simulation = d3.forceSimulation(nodes)
    .force('link', d3.forceLink<GraphNode, GraphLink>(links)
      .id(d => d.id)
      .distance(d => d.kind === 'belongs' ? 86 : 128)
      .strength(d => d.kind === 'belongs' ? 0.68 : 0.22))
    .force('charge', d3.forceManyBody().strength(-215))
    .force('center', d3.forceCenter(centerX, centerY))
    .force('x', d3.forceX(centerX).strength(0.04))
    .force('y', d3.forceY(centerY).strength(0.04))
    .force('collision', d3.forceCollide<GraphNode>().radius(d => d.radius + (d.nodeType === 'group' ? 8 : 7)).strength(0.98))
    .force('ring', d3.forceRadial<GraphNode>(
      d => d.nodeType === 'group' ? groupRingRadius : topicRingRadius,
      centerX,
      centerY,
    ).strength(0.34))
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
    })
}

onMounted(() => {
  mountGraph()

  if (graphContainerRef.value) {
    resizeObserver = new ResizeObserver(() => {
      mountGraph()
    })
    resizeObserver.observe(graphContainerRef.value)
  }
})

onBeforeUnmount(() => {
  simulation?.stop()
  resizeObserver?.disconnect()
})

watch([graphNodes, graphLinks], () => {
  mountGraph()
})
</script>

<template>
  <section class="flex flex-col h-full min-h-0">
    <div ref="graphContainerRef" class="flex-1 min-h-0">
      <svg ref="graphSvgRef" class="size-full" />
    </div>
  </section>
</template>
