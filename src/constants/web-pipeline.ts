import type { FallbackEdge, FallbackNode, NodeKind, WorkflowEdge, WorkflowNode } from '@/types/web-pipeline'

export const WEB_PIPELINE_NODE_WIDTH = 214
export const WEB_PIPELINE_NODE_HEIGHT = 58
export const WEB_PIPELINE_FALLBACK_WIDTH = 7400
export const WEB_PIPELINE_FALLBACK_HEIGHT = 980
export const WEB_PIPELINE_FALLBACK_NODE_WIDTH = 176
export const WEB_PIPELINE_FALLBACK_NODE_HEIGHT = 44

export const WEB_PIPELINE_KIND_LABELS: Record<NodeKind, string> = {
  entry: '入口',
  cache: '缓存',
  network: '网络',
  server: '服务端',
  render: '渲染',
  perf: '优化',
}

export const WEB_PIPELINE_NODES: WorkflowNode[] = [
  {
    id: 'nav-start',
    title: '导航开始',
    kind: 'entry',
    stage: 0,
    lane: 2,
    summary: '用户输入 URL 或点击链接后，浏览器启动主文档导航流程。',
    details: [
      '记录导航起点时间，后续性能指标都基于这个时刻。',
      '同文档跳转（hash/history）可能跳过完整网络请求链路。',
    ],
    metrics: [
      'Navigation Timing 起点',
      '首包时间（TTFB）统计起点',
    ],
    tips: [
      '减少首屏阻塞脚本，缩短首字节等待。',
      '核心链路建议配合预连接与预加载。',
    ],
  },
  {
    id: 'sw-check',
    title: 'Service Worker 拦截',
    kind: 'cache',
    stage: 1,
    lane: 2,
    summary: '已注册 Service Worker 时，请求先进入 fetch 事件处理。',
    details: [
      '命中 SW 缓存可直接返回响应，绕过后续网络链路。',
      '未命中时继续走浏览器默认缓存与网络请求流程。',
    ],
    metrics: [
      'SW 启动时间',
      'Fetch 处理耗时',
    ],
    tips: [
      'HTML 与静态资源应使用不同缓存策略。',
      '避免在 SW 内执行重逻辑导致延迟上升。',
    ],
  },
  {
    id: 'memory-cache',
    title: '内存缓存检查',
    kind: 'cache',
    stage: 2,
    lane: 1,
    summary: '浏览器先检查内存缓存，命中时读取速度最快。',
    details: [
      '常用于同标签页生命周期内资源复用。',
      '命中后可直接返回，跳过磁盘与网络请求。',
    ],
    metrics: [
      '内存缓存命中率',
      '资源读取延迟（通常 < 1ms）',
    ],
    tips: [
      '合理拆包提升复用度。',
      '避免不必要的缓存失效参数。',
    ],
  },
  {
    id: 'disk-cache',
    title: '磁盘缓存检查',
    kind: 'cache',
    stage: 3,
    lane: 3,
    summary: '内存未命中时，浏览器继续检查磁盘缓存。',
    details: [
      '新鲜命中可直接使用；过期资源通常走协商缓存校验。',
      '未命中或不可用时继续进入 CDN/源站链路。',
    ],
    metrics: [
      '磁盘缓存命中率',
      '304 协商缓存比例',
    ],
    tips: [
      '静态资源建议长缓存 + 文件指纹。',
      '合理配置 ETag 与 Last-Modified。',
    ],
  },
  {
    id: 'cdn-edge',
    title: 'CDN 边缘节点',
    kind: 'cache',
    stage: 4,
    lane: 2,
    summary: '请求到达 CDN 边缘节点，命中则就近返回。',
    details: [
      '边缘命中可显著降低 RTT 与 TTFB。',
      '边缘未命中时进入完整 DNS 与源站请求链路。',
    ],
    metrics: [
      'CDN 命中率',
      '边缘节点 TTFB',
    ],
    tips: [
      '启用分层缓存与就近调度。',
      '静态资源可使用 stale-while-revalidate。',
    ],
  },
  {
    id: 'dns-browser-cache',
    title: '浏览器 DNS 缓存',
    kind: 'network',
    stage: 5,
    lane: 1,
    summary: '边缘未命中后，先检查浏览器自身 DNS 缓存。',
    details: [
      '命中时可直接得到目标 IP，跳过后续 DNS 查询。',
      '未命中时继续检查系统 DNS 缓存。',
    ],
    metrics: [
      '浏览器 DNS 命中率',
      'DNS 缓存 TTL 命中情况',
    ],
    tips: [
      '关键域名可用 dns-prefetch 预热。',
      '减少首屏关键域名数量。',
    ],
  },
  {
    id: 'dns-os-cache',
    title: '系统 DNS 缓存',
    kind: 'network',
    stage: 6,
    lane: 1,
    summary: '浏览器缓存未命中时，查询操作系统 DNS 缓存。',
    details: [
      '系统缓存命中后可直接返回解析结果。',
      '未命中则继续检查 hosts 文件与递归解析。',
    ],
    metrics: [
      '系统 DNS 命中率',
      '系统缓存有效期',
    ],
    tips: [
      '保持系统 DNS 配置稳定，减少抖动。',
      '关键域名优先使用权威稳定解析服务。',
    ],
  },
  {
    id: 'dns-hosts',
    title: 'Hosts 文件匹配',
    kind: 'network',
    stage: 7,
    lane: 1,
    summary: '系统缓存未命中时检查 hosts 文件映射。',
    details: [
      '若存在静态映射则直接返回目标 IP。',
      '未命中时才会请求递归 DNS 解析器。',
    ],
    metrics: [
      'hosts 命中数量',
      '本地映射覆盖率',
    ],
    tips: [
      '测试环境可用 hosts 固定解析链路。',
      '生产环境避免错误 hosts 污染。',
    ],
  },
  {
    id: 'dns-resolver',
    title: '递归 DNS 解析器',
    kind: 'network',
    stage: 8,
    lane: 2,
    summary: '向递归 DNS 发起查询，请求继续向上游寻址。',
    details: [
      '递归解析器负责缓存与分步查询根、顶级、权威 DNS。',
      '命中递归缓存时可直接返回解析结果。',
    ],
    metrics: [
      '递归缓存命中率',
      '递归解析时延',
    ],
    tips: [
      '优选低延迟、高可用递归 DNS 服务。',
      '减少跨地域 DNS 解析抖动。',
    ],
  },
  {
    id: 'dns-root',
    title: '根域名服务器',
    kind: 'network',
    stage: 9,
    lane: 1,
    summary: '递归解析器先询问根域名服务器获取顶级域线索。',
    details: [
      '根 DNS 不返回最终 IP，只返回顶级域权威信息。',
      '例如先返回 .com 顶级域服务器地址。',
    ],
    metrics: [
      '根 DNS 查询次数',
      '根链路 RTT',
    ],
    tips: [
      '利用递归缓存可显著减少根查询频率。',
      '解析基础设施应支持多线路容灾。',
    ],
  },
  {
    id: 'dns-tld',
    title: '顶级域服务器',
    kind: 'network',
    stage: 10,
    lane: 1,
    summary: '再向顶级域服务器查询目标域名的权威 DNS。',
    details: [
      '顶级域服务器返回权威 DNS 的 NS 记录。',
      '继续将查询引导到最终权威解析服务。',
    ],
    metrics: [
      'TLD 查询耗时',
      'TLD 返回稳定性',
    ],
    tips: [
      '域名注册与 DNS 托管策略需保持一致。',
      '关注 NS 记录配置正确性。',
    ],
  },
  {
    id: 'dns-authoritative',
    title: '权威 DNS 服务器',
    kind: 'network',
    stage: 11,
    lane: 1,
    summary: '向权威 DNS 查询最终 A/AAAA/CNAME 记录。',
    details: [
      '权威 DNS 返回最终可用的目标地址记录。',
      '解析结果会被递归解析器与本地缓存保存。',
    ],
    metrics: [
      '权威解析耗时',
      '记录 TTL 分布',
    ],
    tips: [
      '合理设置 TTL，平衡更新速度与命中率。',
      '确保权威 DNS 多节点高可用。',
    ],
  },
  {
    id: 'dns-result',
    title: '返回 IP 并写入缓存',
    kind: 'network',
    stage: 12,
    lane: 2,
    summary: 'DNS 结果返回浏览器，并写入多级缓存供后续复用。',
    details: [
      '递归、系统、浏览器层缓存都会保存解析结果。',
      '后续请求可在 TTL 内直接复用 IP。',
    ],
    metrics: [
      '解析总耗时',
      '缓存写入成功率',
    ],
    tips: [
      '监控解析链路中每一跳耗时。',
      '对关键域名做持续可用性探测。',
    ],
  },
  {
    id: 'tcp-tls',
    title: 'TCP/TLS 建连',
    kind: 'network',
    stage: 13,
    lane: 2,
    summary: '获得 IP 后建立连接并完成 TLS 握手。',
    details: [
      'HTTPS 请求必须先完成 TLS 握手。',
      '连接复用可减少重复握手开销。',
    ],
    metrics: [
      'TCP 连接耗时',
      'TLS 握手耗时',
    ],
    tips: [
      '使用 preconnect 提前建立连接。',
      '开启会话复用降低握手成本。',
    ],
  },
  {
    id: 'http-request',
    title: '发送 HTTP 请求',
    kind: 'network',
    stage: 14,
    lane: 2,
    summary: '浏览器发送请求头与请求体，等待服务端响应。',
    details: [
      '协商缓存会附带 If-None-Match / If-Modified-Since。',
      '请求优先级会影响关键资源返回顺序。',
    ],
    metrics: [
      '请求排队时间',
      '首字节等待时间',
    ],
    tips: [
      '让关键资源具备更高请求优先级。',
      '控制阻塞型资源数量。',
    ],
  },
  {
    id: 'origin-response',
    title: '源站返回响应',
    kind: 'server',
    stage: 15,
    lane: 2,
    summary: '源站或网关返回 200/304/206 等响应状态。',
    details: [
      '304 仅返回头部，浏览器复用本地缓存实体。',
      '200/206 会携带响应体并进入流式接收。',
    ],
    metrics: [
      '源站响应延迟',
      '状态码分布（200/304/4xx/5xx）',
    ],
    tips: [
      '缓存可缓存内容，降低源站压力。',
      '监控高频慢接口并做后端优化。',
    ],
  },
  {
    id: 'response-stream',
    title: '响应流接收',
    kind: 'render',
    stage: 16,
    lane: 2,
    summary: '浏览器接收响应流，并并行触发解析与资源发现。',
    details: [
      'HTML 可边下载边解析，降低首屏等待。',
      '预加载扫描器可提前发现关键 CSS/JS。',
    ],
    metrics: [
      'TTFB',
      'FCP 前关键资源到达时间',
    ],
    tips: [
      '使用流式 HTML / SSR 提前出首屏骨架。',
      '关键资源尽量早返回。',
    ],
  },
  {
    id: 'html-parser',
    title: 'HTML 解析与 DOM',
    kind: 'render',
    stage: 17,
    lane: 1,
    summary: 'HTML 解析器将文档转换为 DOM 树。',
    details: [
      '同步脚本可能阻塞解析。',
      'DOM 结构复杂度会影响后续布局计算成本。',
    ],
    metrics: [
      'DOM 节点总数',
      '解析耗时',
    ],
    tips: [
      '避免不必要的深层嵌套。',
      '减少阻塞解析的同步脚本。',
    ],
  },
  {
    id: 'cssom-js',
    title: 'CSSOM 构建与脚本执行',
    kind: 'render',
    stage: 17,
    lane: 3,
    summary: '并行构建 CSSOM，并执行影响样式/布局的脚本。',
    details: [
      'CSS 是渲染阻塞资源，关键 CSS 应优先下载。',
      'JS 执行可能触发样式计算与布局失效。',
    ],
    metrics: [
      '主线程长任务',
      '脚本执行总时长',
    ],
    tips: [
      '拆分代码并延迟非关键 JS。',
      '控制样式计算频次与复杂度。',
    ],
  },
  {
    id: 'render-tree',
    title: '构建渲染树',
    kind: 'render',
    stage: 18,
    lane: 2,
    summary: '浏览器合并 DOM + CSSOM，构建可渲染节点树。',
    details: [
      'display:none 节点不会进入渲染树。',
      '样式继承与层叠规则在这一阶段生效。',
    ],
    metrics: [
      '样式重计算耗时',
      '渲染树节点规模',
    ],
    tips: [
      '减少会触发大范围样式失效的操作。',
      '控制复杂选择器使用。',
    ],
  },
  {
    id: 'layout',
    title: '布局计算（Layout）',
    kind: 'render',
    stage: 19,
    lane: 2,
    summary: '计算每个可见节点的几何信息与位置。',
    details: [
      '读取布局信息（offsetTop 等）可能导致强制同步布局。',
      '频繁布局会直接拉高交互延迟。',
    ],
    metrics: [
      'Layout 次数',
      'Layout 总耗时',
    ],
    tips: [
      '批量读写 DOM，避免 layout thrashing。',
      '善用 contain/content-visibility。',
    ],
  },
  {
    id: 'paint',
    title: '绘制（Paint）',
    kind: 'render',
    stage: 20,
    lane: 2,
    summary: '把布局结果绘制成位图记录。',
    details: [
      '复杂阴影/滤镜会增加绘制成本。',
      '大面积重绘会影响帧率。',
    ],
    metrics: [
      'Paint 次数',
      '单帧绘制耗时',
    ],
    tips: [
      '降低高成本样式特效使用频率。',
      '尽量缩小重绘区域。',
    ],
  },
  {
    id: 'composite',
    title: '合成（Composite）',
    kind: 'render',
    stage: 21,
    lane: 2,
    summary: 'GPU 合成各图层，输出最终帧并展示到屏幕。',
    details: [
      'transform/opacity 动画通常在合成阶段完成。',
      '图层过多也会增加内存与合成开销。',
    ],
    metrics: [
      'FPS',
      '合成线程耗时',
    ],
    tips: [
      '动画优先使用 transform/opacity。',
      '避免滥用 will-change 创建过多图层。',
    ],
  },
  {
    id: 'cache-policy',
    title: '缓存策略优化',
    kind: 'perf',
    stage: 2,
    lane: 0,
    summary: '缓存策略是网络性能优化的第一优先级。',
    details: [
      '通过 Cache-Control/ETag 定义资源新鲜度与验证方式。',
      '可同时影响内存缓存、磁盘缓存和 CDN 命中效果。',
    ],
    metrics: [
      '命中率提升幅度',
      '回源率变化',
    ],
    tips: [
      '静态资源建议 immutable + hash。',
      '业务 API 根据场景配置短缓存与重验证。',
    ],
  },
  {
    id: 'resource-hints',
    title: '资源预提示优化',
    kind: 'perf',
    stage: 10,
    lane: 0,
    summary: '通过 dns-prefetch / preconnect / preload 把等待前移。',
    details: [
      'dns-prefetch 提前完成 DNS 解析。',
      'preconnect 可提前完成 TCP/TLS 建连。',
    ],
    metrics: [
      '关键资源启动时间',
      '连接建立提前量',
    ],
    tips: [
      '仅对高价值关键域名添加 hints。',
      '避免过量 preload 导致带宽竞争。',
    ],
  },
  {
    id: 'render-opt',
    title: '渲染阶段优化',
    kind: 'perf',
    stage: 19,
    lane: 4,
    summary: '针对布局与绘制阶段做稳定帧率优化。',
    details: [
      '减少强制同步布局和大面积重绘。',
      '提升交互过程中的动画流畅度。',
    ],
    metrics: [
      'INP',
      '掉帧比例',
    ],
    tips: [
      '把昂贵计算搬离关键交互路径。',
      '将高频动画限制在合成层。',
    ],
  },
]

export const WEB_PIPELINE_EDGES: WorkflowEdge[] = [
  { source: 'nav-start', target: 'sw-check', label: '发起导航请求', kind: 'normal' },
  { source: 'sw-check', target: 'response-stream', label: '命中 SW 缓存', kind: 'hit' },
  { source: 'sw-check', target: 'memory-cache', label: 'SW 未命中', kind: 'miss' },
  { source: 'memory-cache', target: 'response-stream', label: '命中内存缓存', kind: 'hit' },
  { source: 'memory-cache', target: 'disk-cache', label: '内存缓存未命中', kind: 'miss' },
  { source: 'disk-cache', target: 'response-stream', label: '命中磁盘缓存 / 304 复用', kind: 'hit' },
  { source: 'disk-cache', target: 'cdn-edge', label: '磁盘缓存未命中', kind: 'miss' },
  { source: 'cdn-edge', target: 'response-stream', label: '命中 CDN 边缘缓存', kind: 'hit' },
  { source: 'cdn-edge', target: 'dns-browser-cache', label: 'CDN 未命中，进入 DNS', kind: 'miss' },
  { source: 'dns-browser-cache', target: 'tcp-tls', label: '浏览器 DNS 命中', kind: 'hit' },
  { source: 'dns-browser-cache', target: 'dns-os-cache', label: '浏览器 DNS 未命中', kind: 'miss' },
  { source: 'dns-os-cache', target: 'tcp-tls', label: '系统 DNS 命中', kind: 'hit' },
  { source: 'dns-os-cache', target: 'dns-hosts', label: '系统 DNS 未命中', kind: 'miss' },
  { source: 'dns-hosts', target: 'tcp-tls', label: '命中 hosts 映射', kind: 'hit' },
  { source: 'dns-hosts', target: 'dns-resolver', label: 'hosts 未命中', kind: 'miss' },
  { source: 'dns-resolver', target: 'dns-root', label: '递归查询开始', kind: 'normal' },
  { source: 'dns-root', target: 'dns-tld', label: '返回顶级域线索', kind: 'normal' },
  { source: 'dns-tld', target: 'dns-authoritative', label: '返回权威 DNS', kind: 'normal' },
  { source: 'dns-authoritative', target: 'dns-result', label: '返回最终记录', kind: 'validate' },
  { source: 'dns-result', target: 'tcp-tls', label: '拿到目标 IP', kind: 'normal' },
  { source: 'tcp-tls', target: 'http-request', label: '连接建立完成', kind: 'normal' },
  { source: 'http-request', target: 'origin-response', label: '请求已发送', kind: 'normal' },
  { source: 'origin-response', target: 'response-stream', label: '200 / 304 / 206', kind: 'validate' },
  { source: 'response-stream', target: 'html-parser', label: '流式解析 HTML', kind: 'normal' },
  { source: 'response-stream', target: 'cssom-js', label: '预加载扫描', kind: 'normal' },
  { source: 'html-parser', target: 'render-tree', label: 'DOM 就绪', kind: 'normal' },
  { source: 'cssom-js', target: 'render-tree', label: 'CSSOM 与脚本就绪', kind: 'normal' },
  { source: 'render-tree', target: 'layout', label: '计算布局几何', kind: 'normal' },
  { source: 'layout', target: 'paint', label: '生成绘制指令', kind: 'normal' },
  { source: 'paint', target: 'composite', label: '图层合成输出', kind: 'normal' },
  { source: 'cache-policy', target: 'memory-cache', label: 'Cache-Control / ETag', kind: 'optimize' },
  { source: 'cache-policy', target: 'disk-cache', label: '协商缓存策略', kind: 'optimize' },
  { source: 'cache-policy', target: 'cdn-edge', label: 'CDN TTL 与回源策略', kind: 'optimize' },
  { source: 'resource-hints', target: 'dns-browser-cache', label: 'dns-prefetch', kind: 'optimize' },
  { source: 'resource-hints', target: 'tcp-tls', label: 'preconnect', kind: 'optimize' },
  { source: 'resource-hints', target: 'response-stream', label: 'preload 关键资源', kind: 'optimize' },
  { source: 'render-opt', target: 'layout', label: 'contain / content-visibility', kind: 'optimize' },
  { source: 'render-opt', target: 'paint', label: '缩小重绘区域', kind: 'optimize' },
]

export const WEB_PIPELINE_FALLBACK_NODES: FallbackNode[] = WEB_PIPELINE_NODES.map(node => ({
  id: node.id,
  title: node.title,
  kind: node.kind,
  x: 96 + node.stage * 308 + WEB_PIPELINE_FALLBACK_NODE_WIDTH / 2,
  y: 72 + node.lane * 154 + WEB_PIPELINE_FALLBACK_NODE_HEIGHT / 2,
}))

const fallbackNodeMap = new Map(WEB_PIPELINE_FALLBACK_NODES.map(node => [node.id, node]))

export const WEB_PIPELINE_FALLBACK_EDGES: FallbackEdge[] = WEB_PIPELINE_EDGES.flatMap((edge) => {
  const sourceNode = fallbackNodeMap.get(edge.source)
  const targetNode = fallbackNodeMap.get(edge.target)
  if (!sourceNode || !targetNode)
    return []
  return [{ ...edge, sourceNode, targetNode }]
})

export const WEB_PIPELINE_NODE_MAP = new Map(WEB_PIPELINE_NODES.map(node => [node.id, node]))
