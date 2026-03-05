import type { WorkflowEdge, WorkflowFallbackEdge, WorkflowFallbackNode, WorkflowNode } from '@/types/workflow'

export const KNOWLEDGE_GRAPH_NODE_WIDTH = 220
export const KNOWLEDGE_GRAPH_NODE_HEIGHT = 58
export const KNOWLEDGE_GRAPH_FALLBACK_NODE_WIDTH = 194
export const KNOWLEDGE_GRAPH_FALLBACK_NODE_HEIGHT = 44

export const KNOWLEDGE_GRAPH_KIND_LABELS: Record<string, string> = {
  plan: '总览',
  javascript: 'JavaScript',
  html: 'HTML',
  css: 'CSS',
  network: '计算机网络',
  browser: '浏览器原理',
  perf: '性能优化',
  build: '工程化',
  core: 'Vue',
  state: 'React',
  quality: '手写代码',
}

interface TopicDefinition {
  id: string
  title: string
  kind?: string
}

interface DomainDefinition {
  id: string
  title: string
  kind: string
  topics: TopicDefinition[]
  backbone: string[]
}

interface PositionedNode extends WorkflowNode {
  x: number
  y: number
}

function topic(id: string, title: string, kind?: string): TopicDefinition {
  return { id, title, kind }
}

const ROOT_NODE: PositionedNode = {
  id: 'frontend-interview-map',
  title: '前端面试知识图谱',
  kind: 'plan',
  stage: 0,
  lane: 0,
  x: 3200,
  y: 2200,
}

const DOMAIN_DEFINITIONS: DomainDefinition[] = [
  {
    id: 'js-runtime',
    title: 'JavaScript 体系',
    kind: 'javascript',
    topics: [
      topic('js-scope-closure', '作用域、闭包与模块化'),
      topic('js-event-loop', '事件循环与任务队列'),
      topic('js-async-pattern', '异步模式与错误处理'),
      topic('network-request-pattern', '请求模式与重试治理', 'browser'),
      topic('runtime-storage', '运行时与存储关联', 'perf'),
    ],
    backbone: ['js-scope-closure', 'js-event-loop', 'js-async-pattern', 'network-request-pattern'],
  },
  {
    id: 'html-strategy',
    title: 'HTML 体系',
    kind: 'html',
    topics: [
      topic('nav-start', '导航起点与文档入口'),
      topic('html-semantic', '语义化与可访问性'),
      topic('html-loading-blocking', '加载与阻塞模型'),
      topic('html-script-loading', 'script 加载策略（defer/async）'),
      topic('html-media-offline', '离线存储、Worker 与媒体能力'),
    ],
    backbone: ['nav-start', 'html-semantic', 'html-loading-blocking', 'html-script-loading', 'html-media-offline'],
  },
  {
    id: 'css-strategy',
    title: 'CSS 体系',
    kind: 'css',
    topics: [
      topic('css-cascade-specificity', '层叠与优先级'),
      topic('css-layout-system', '布局系统（Flow/Flex/Grid）'),
      topic('css-rendering-cost', '渲染成本与动画策略'),
      topic('forced-layout', '回流重绘与强制同步布局', 'perf'),
    ],
    backbone: ['css-cascade-specificity', 'css-layout-system', 'css-rendering-cost', 'forced-layout'],
  },
  {
    id: 'http-request',
    title: '计算机网络体系',
    kind: 'network',
    topics: [
      topic('dns-resolver', 'DNS 递归解析器'),
      topic('dns-root', '根域名服务器'),
      topic('dns-tld', '顶级域服务器'),
      topic('dns-authoritative', '权威 DNS 服务器'),
      topic('dns-result', '解析结果与缓存回写'),
      topic('tcp-tls', 'TCP/TLS 建连'),
      topic('http-evolution', 'HTTP 演进与连接复用'),
      topic('status-code-path', '状态码决策链'),
      topic('security-cors', '同源与跨域策略'),
      topic('realtime-channel', '实时通道（WebSocket/SSE）'),
    ],
    backbone: ['dns-resolver', 'dns-root', 'dns-tld', 'dns-authoritative', 'dns-result', 'tcp-tls', 'http-evolution', 'status-code-path', 'realtime-channel'],
  },
  {
    id: 'dom-event-model',
    title: '浏览器原理体系',
    kind: 'browser',
    topics: [
      topic('sw-check', 'Service Worker 拦截链'),
      topic('refresh-modes', '刷新模式与缓存判定'),
      topic('memory-cache', '内存缓存'),
      topic('disk-cache', '磁盘缓存'),
      topic('browser-storage-security', '浏览器存储与安全边界'),
      topic('html-parser', 'HTML 解析与 DOM 构建'),
      topic('cssom-js', 'CSSOM 与脚本执行'),
      topic('render-tree', '渲染树构建'),
      topic('layout', '布局计算（Layout）'),
      topic('paint', '绘制（Paint）'),
      topic('composite', '合成（Composite）'),
      topic('parse-blocking', '解析阻塞治理'),
    ],
    backbone: ['sw-check', 'memory-cache', 'disk-cache', 'html-parser', 'cssom-js', 'render-tree', 'layout', 'paint', 'composite'],
  },
  {
    id: 'perf-metrics',
    title: '性能优化体系',
    kind: 'perf',
    topics: [
      topic('performance-budget', '性能与体积预算'),
      topic('resource-hints', '资源预提示优化'),
      topic('render-opt', '渲染阶段优化'),
      topic('cache-policy', '缓存策略优化'),
      topic('performance-debug-methodology', '性能排障方法论'),
      topic('metrics-playbook', '指标异常排障动作库'),
      topic('cdn-edge', 'CDN 与边缘命中'),
      topic('webpack-optimization', '构建工具优化（Webpack/Vite）'),
      topic('image-optimization', '图片优化策略'),
      topic('lazyload-strategy', '懒加载与按需加载'),
      topic('throttle-debounce', '节流与防抖策略'),
      topic('release-gate', '发布回归与性能门禁'),
    ],
    backbone: ['performance-budget', 'resource-hints', 'render-opt', 'perf-metrics', 'metrics-playbook', 'release-gate'],
  },
  {
    id: 'build-bundle',
    title: '前端工程化体系',
    kind: 'build',
    topics: [
      topic('requirement-freeze', '需求评审与方案冻结'),
      topic('repo-architecture', '仓库结构与分层约束'),
      topic('dependency-governance', '依赖治理与版本策略'),
      topic('quality-gates', 'Lint/Test/Typecheck 门禁'),
      topic('cache-release-strategy', '缓存发布策略'),
      topic('ci-cd-delivery', 'CI/CD 发布流水线'),
      topic('config-env-management', '配置中心与环境隔离'),
      topic('gray-release-observe', '灰度放量与风险控制'),
      topic('observability-dashboard', '监控看板与告警联动'),
      topic('rollback-emergency', '回滚预案与应急响应'),
      topic('postmortem-governance', '复盘沉淀与规则固化'),
      topic('engineering-pipeline', '工程化与打包产物治理'),
    ],
    backbone: ['requirement-freeze', 'repo-architecture', 'dependency-governance', 'build-bundle', 'quality-gates', 'ci-cd-delivery', 'gray-release-observe', 'observability-dashboard', 'rollback-emergency', 'postmortem-governance'],
  },
  {
    id: 'vue-architecture',
    title: 'Vue 体系',
    kind: 'core',
    topics: [
      topic('vue-reactivity', '响应式核心（ref/reactive）'),
      topic('vue-sfc-template', 'SFC 与模板编译机制'),
      topic('vue-component-communication', '组件通信（props/emits/provide）'),
      topic('vue-routing', '路由设计与页面状态'),
      topic('vue-state-pinia', '状态管理（Pinia）'),
      topic('vue-async-data', '异步数据与请求治理'),
      topic('vue-render-scheduler', '渲染调度与更新批处理'),
      topic('vue-performance', 'Vue 性能优化'),
      topic('vue-testing-deploy', '测试、构建与发布策略'),
      topic('vue-governance', '团队规范与复盘闭环'),
    ],
    backbone: ['vue-reactivity', 'vue-component-communication', 'vue-routing', 'vue-async-data', 'vue-render-scheduler', 'vue-performance', 'vue-testing-deploy', 'vue-governance'],
  },
  {
    id: 'react-mental-model',
    title: 'React 体系',
    kind: 'state',
    topics: [
      topic('react-jsx-components', 'JSX 与组件抽象'),
      topic('react-state-props', 'State/Props 设计边界'),
      topic('react-hooks-rules', 'Hooks 规则与封装模式'),
      topic('react-effect-lifecycle', 'Effect 生命周期治理'),
      topic('react-routing-data', '路由与数据获取策略'),
      topic('react-state-management', '状态管理（Context/Store）'),
      topic('react-rendering-concurrent', '渲染阶段与并发能力'),
      topic('react-performance', '性能优化（memo/拆分）'),
      topic('react-testing-deploy', '测试、构建与发布策略'),
      topic('react-governance', '规范治理与复盘闭环'),
    ],
    backbone: ['react-jsx-components', 'react-hooks-rules', 'react-effect-lifecycle', 'react-routing-data', 'react-rendering-concurrent', 'react-performance', 'react-testing-deploy', 'react-governance'],
  },
  {
    id: 'handwrite-core',
    title: '手写代码体系',
    kind: 'quality',
    topics: [
      topic('handwrite-js-foundation', '手写 JS 基础能力'),
      topic('handwrite-data-processing', '手写数据处理题'),
      topic('handwrite-scenario-application', '手写场景应用题'),
      topic('code-output-analysis', '代码输出与执行结果分析'),
    ],
    backbone: ['handwrite-js-foundation', 'handwrite-data-processing', 'handwrite-scenario-application', 'code-output-analysis'],
  },
]

const MAINLINE_EDGES: WorkflowEdge[] = [
  { source: 'nav-start', target: 'refresh-modes', label: '导航触发刷新策略判定', kind: 'spine' },
  { source: 'refresh-modes', target: 'sw-check', label: '先经过 Service Worker 拦截链', kind: 'spine' },
  { source: 'sw-check', target: 'memory-cache', label: '未命中 SW 时回到浏览器缓存层', kind: 'spine' },
  { source: 'memory-cache', target: 'disk-cache', label: '内存缓存未命中则检查磁盘缓存', kind: 'spine' },
  { source: 'disk-cache', target: 'dns-resolver', label: '本地缓存未命中进入网络解析', kind: 'spine' },
  { source: 'dns-result', target: 'tcp-tls', label: '拿到目标地址后建立传输连接', kind: 'spine' },
  { source: 'tcp-tls', target: 'http-request', label: '连接就绪后发起 HTTP 请求', kind: 'spine' },
  { source: 'http-request', target: 'status-code-path', label: '响应状态码决定后续处理分支', kind: 'spine' },
  { source: 'status-code-path', target: 'html-parser', label: '文档响应进入浏览器解析阶段', kind: 'spine' },
  { source: 'html-parser', target: 'cssom-js', label: '解析 HTML 时同步构建 CSSOM/执行脚本', kind: 'spine' },
  { source: 'cssom-js', target: 'render-tree', label: 'DOM 与 CSSOM 形成渲染树', kind: 'spine' },
  { source: 'render-tree', target: 'layout', label: '渲染树进入布局计算', kind: 'spine' },
  { source: 'layout', target: 'paint', label: '布局结果进入绘制阶段', kind: 'spine' },
  { source: 'paint', target: 'composite', label: '绘制图层最终合成输出', kind: 'spine' },
  { source: 'composite', target: 'render-opt', label: '合成结果回流到渲染优化策略', kind: 'spine' },
  { source: 'render-opt', target: 'perf-metrics', label: '优化效果通过指标体系验证', kind: 'spine' },
]

const MAINLINE_PAIR_SET = new Set(MAINLINE_EDGES.map(edge => `${edge.source}->${edge.target}`))

const CROSS_DOMAIN_EDGES: WorkflowEdge[] = [
  { source: 'html-loading-blocking', target: 'cssom-js', label: '阻塞脚本与样式会推迟渲染', kind: 'optimize' },
  { source: 'js-event-loop', target: 'cssom-js', label: '宏微任务时机会干扰渲染时序', kind: 'practice' },
  { source: 'js-event-loop', target: 'layout', label: '读写 DOM 交错会触发布局抖动', kind: 'practice' },
  { source: 'layout', target: 'forced-layout', label: '强制同步布局通常出现在这一阶段', kind: 'risk' },
  { source: 'forced-layout', target: 'render-opt', label: '回流重绘治理是渲染优化核心', kind: 'optimize' },
  { source: 'status-code-path', target: 'cache-policy', label: '状态码策略会影响缓存复用路径', kind: 'optimize' },
  { source: 'cache-policy', target: 'memory-cache', label: '缓存头策略直接影响内存命中', kind: 'optimize' },
  { source: 'cache-policy', target: 'disk-cache', label: '协商缓存决定磁盘副本是否可用', kind: 'optimize' },
  { source: 'build-bundle', target: 'resource-hints', label: '产物拆分策略决定预加载粒度', kind: 'optimize' },
  { source: 'build-bundle', target: 'cache-policy', label: '指纹与分包影响长期缓存稳定性', kind: 'optimize' },
  { source: 'ci-cd-delivery', target: 'release-gate', label: '发布流水线以性能门禁为出口', kind: 'guard' },
  { source: 'security-cors', target: 'browser-storage-security', label: '跨域约束与本地存储边界联动', kind: 'risk' },
  { source: 'js-event-loop', target: 'vue-render-scheduler', label: '事件循环节奏影响 Vue 批处理', kind: 'practice' },
  { source: 'js-event-loop', target: 'react-rendering-concurrent', label: '任务调度直接影响 React 渲染并发', kind: 'practice' },
  { source: 'handwrite-js-foundation', target: 'js-scope-closure', label: '手写基础题用于验证作用域模型', kind: 'practice' },
  { source: 'code-output-analysis', target: 'js-event-loop', label: '输出题最常映射事件循环机制', kind: 'practice' },
  { source: 'vue-governance', target: 'react-governance', label: '跨框架规范治理经验可复用', kind: 'feedback' },
]

const CENTER_X = 3200
const CENTER_Y = 2200
const DOMAIN_RADIUS_X = 2500
const DOMAIN_RADIUS_Y = 1650
const TOPIC_RING_SIZE = 4
const TOPIC_BASE_RADIUS = 500
const TOPIC_RING_GAP = 200
const TOPIC_ANGULAR_SPREAD = 1.78

function pairwiseEdges(sequence: string[], kind: string): WorkflowEdge[] {
  const edges: WorkflowEdge[] = []
  for (let index = 0; index < sequence.length - 1; index += 1) {
    edges.push({
      source: sequence[index],
      target: sequence[index + 1],
      label: '',
      kind,
    })
  }
  return edges
}

function buildGraph(): { nodes: PositionedNode[], edges: WorkflowEdge[] } {
  const positionedNodes: PositionedNode[] = [{ ...ROOT_NODE }]
  const edges: WorkflowEdge[] = []
  const idSet = new Set<string>([ROOT_NODE.id])
  const domainCount = DOMAIN_DEFINITIONS.length

  DOMAIN_DEFINITIONS.forEach((domain, domainIndex) => {
    const angle = -Math.PI / 2 + (Math.PI * 2 * domainIndex) / domainCount
    const domainX = CENTER_X + Math.cos(angle) * DOMAIN_RADIUS_X
    const domainY = CENTER_Y + Math.sin(angle) * DOMAIN_RADIUS_Y
    const domainStage = (domainIndex + 1) * 100

    if (idSet.has(domain.id)) {
      throw new Error(`Duplicate node id: ${domain.id}`)
    }

    positionedNodes.push({
      id: domain.id,
      title: domain.title,
      kind: domain.kind,
      stage: domainStage,
      lane: 0,
      x: domainX,
      y: domainY,
    })
    idSet.add(domain.id)

    edges.push({
      source: ROOT_NODE.id,
      target: domain.id,
      label: '',
      kind: 'practice',
    })

    domain.topics.forEach((item, topicIndex) => {
      if (idSet.has(item.id)) {
        throw new Error(`Duplicate node id: ${item.id}`)
      }

      const ringIndex = Math.floor(topicIndex / TOPIC_RING_SIZE)
      const ringStart = ringIndex * TOPIC_RING_SIZE
      const ringCount = Math.min(TOPIC_RING_SIZE, domain.topics.length - ringStart)
      const indexInRing = topicIndex - ringStart
      const offset = ringCount === 1 ? 0 : (indexInRing / (ringCount - 1) - 0.5)
      const topicAngle = angle + offset * TOPIC_ANGULAR_SPREAD
      const topicRadius = TOPIC_BASE_RADIUS + ringIndex * TOPIC_RING_GAP

      positionedNodes.push({
        id: item.id,
        title: item.title,
        kind: item.kind ?? domain.kind,
        stage: domainStage + topicIndex + 1,
        lane: ringIndex + 1,
        x: domainX + Math.cos(topicAngle) * topicRadius,
        y: domainY + Math.sin(topicAngle) * topicRadius * 0.82,
      })
      idSet.add(item.id)

      edges.push({
        source: domain.id,
        target: item.id,
        label: '',
        kind: 'normal',
      })
    })

    edges.push(...pairwiseEdges(domain.backbone, 'normal'))
  })

  edges.push(...MAINLINE_EDGES)
  edges.push(...CROSS_DOMAIN_EDGES)

  const deduped: WorkflowEdge[] = []
  const seen = new Set<string>()
  for (const edge of edges) {
    if (edge.kind !== 'spine' && MAINLINE_PAIR_SET.has(`${edge.source}->${edge.target}`))
      continue

    const key = `${edge.source}->${edge.target}->${edge.kind}->${edge.label}`
    if (seen.has(key))
      continue
    seen.add(key)
    deduped.push(edge)
  }

  for (const edge of deduped) {
    if (!idSet.has(edge.source) || !idSet.has(edge.target)) {
      throw new Error(`Invalid edge: ${edge.source} -> ${edge.target}`)
    }
  }

  return {
    nodes: positionedNodes,
    edges: deduped,
  }
}

function buildFallbackNodes(positionedNodes: PositionedNode[]) {
  const xs = positionedNodes.map(node => node.x)
  const ys = positionedNodes.map(node => node.y)
  const minX = Math.min(...xs)
  const minY = Math.min(...ys)
  const maxX = Math.max(...xs)
  const maxY = Math.max(...ys)

  const paddingX = 220
  const paddingY = 160
  const shiftX = paddingX - minX
  const shiftY = paddingY - minY

  const fallbackNodes: WorkflowFallbackNode[] = positionedNodes.map(node => ({
    id: node.id,
    title: node.title,
    kind: node.kind,
    x: node.x + shiftX,
    y: node.y + shiftY,
  }))

  const width = Math.ceil(maxX - minX + paddingX * 2 + KNOWLEDGE_GRAPH_FALLBACK_NODE_WIDTH)
  const height = Math.ceil(maxY - minY + paddingY * 2 + KNOWLEDGE_GRAPH_FALLBACK_NODE_HEIGHT)

  return {
    fallbackNodes,
    width,
    height,
  }
}

const graph = buildGraph()

export const KNOWLEDGE_GRAPH_NODES: WorkflowNode[] = graph.nodes.map(({ x: _x, y: _y, ...node }) => node)
export const KNOWLEDGE_GRAPH_EDGES: WorkflowEdge[] = graph.edges

const fallbackLayout = buildFallbackNodes(graph.nodes)

export const KNOWLEDGE_GRAPH_FALLBACK_NODES: WorkflowFallbackNode[] = fallbackLayout.fallbackNodes
export const KNOWLEDGE_GRAPH_FALLBACK_WIDTH = fallbackLayout.width
export const KNOWLEDGE_GRAPH_FALLBACK_HEIGHT = fallbackLayout.height

const fallbackNodeMap = new Map(KNOWLEDGE_GRAPH_FALLBACK_NODES.map(node => [node.id, node]))

export const KNOWLEDGE_GRAPH_FALLBACK_EDGES: WorkflowFallbackEdge[] = KNOWLEDGE_GRAPH_EDGES.flatMap((edge) => {
  const sourceNode = fallbackNodeMap.get(edge.source)
  const targetNode = fallbackNodeMap.get(edge.target)
  if (!sourceNode || !targetNode)
    return []

  return [{ ...edge, sourceNode, targetNode }]
})

export const KNOWLEDGE_GRAPH_NODE_MAP = new Map(KNOWLEDGE_GRAPH_NODES.map(node => [node.id, node]))

export const KNOWLEDGE_GRAPH = {
  nodeWidth: KNOWLEDGE_GRAPH_NODE_WIDTH,
  nodeHeight: KNOWLEDGE_GRAPH_NODE_HEIGHT,
  fallbackNodeWidth: KNOWLEDGE_GRAPH_FALLBACK_NODE_WIDTH,
  fallbackNodeHeight: KNOWLEDGE_GRAPH_FALLBACK_NODE_HEIGHT,
  fallbackWidth: KNOWLEDGE_GRAPH_FALLBACK_WIDTH,
  fallbackHeight: KNOWLEDGE_GRAPH_FALLBACK_HEIGHT,
  nodes: KNOWLEDGE_GRAPH_NODES,
  edges: KNOWLEDGE_GRAPH_EDGES,
  kindLabels: KNOWLEDGE_GRAPH_KIND_LABELS,
  fallbackNodes: KNOWLEDGE_GRAPH_FALLBACK_NODES,
  fallbackEdges: KNOWLEDGE_GRAPH_FALLBACK_EDGES,
  nodeMap: KNOWLEDGE_GRAPH_NODE_MAP,
} as const
