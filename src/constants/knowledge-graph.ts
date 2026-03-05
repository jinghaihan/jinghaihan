import type { WorkflowEdge, WorkflowFallbackEdge, WorkflowFallbackNode, WorkflowNode } from '@/types/workflow'

export const FRONTEND_ENGINEERING_NODE_WIDTH = 214
export const FRONTEND_ENGINEERING_NODE_HEIGHT = 58
export const FRONTEND_ENGINEERING_FALLBACK_WIDTH = 2800
export const FRONTEND_ENGINEERING_FALLBACK_HEIGHT = 980
export const FRONTEND_ENGINEERING_FALLBACK_NODE_WIDTH = 190
export const FRONTEND_ENGINEERING_FALLBACK_NODE_HEIGHT = 44

export const FRONTEND_ENGINEERING_KIND_LABELS: Record<string, string> = {
  plan: '规划',
  build: '构建',
  quality: '质量',
  delivery: '交付',
  observe: '运维',
}

export const FRONTEND_ENGINEERING_NODES: WorkflowNode[] = [
  { id: 'requirement-freeze', title: '需求评审与方案冻结', kind: 'plan', stage: 0, lane: 2 },
  { id: 'repo-architecture', title: '仓库结构与分层约束', kind: 'plan', stage: 1, lane: 1 },
  { id: 'dependency-governance', title: '依赖治理与版本策略', kind: 'plan', stage: 1, lane: 3 },
  { id: 'build-bundle', title: '构建流水线与产物拆分', kind: 'build', stage: 2, lane: 2 },
  { id: 'performance-budget', title: '性能预算与体积预算', kind: 'quality', stage: 2, lane: 0 },
  { id: 'quality-gates', title: 'Lint/Test/Typecheck 门禁', kind: 'quality', stage: 3, lane: 1 },
  { id: 'cache-release-strategy', title: '缓存发布策略（指纹/TTL）', kind: 'delivery', stage: 3, lane: 3 },
  { id: 'ci-cd-delivery', title: 'CI/CD 发布流水线', kind: 'delivery', stage: 4, lane: 2 },
  { id: 'config-env-management', title: '配置中心与环境隔离', kind: 'delivery', stage: 4, lane: 4 },
  { id: 'gray-release-observe', title: '灰度放量与风险控制', kind: 'observe', stage: 5, lane: 1 },
  { id: 'observability-dashboard', title: '监控看板与告警联动', kind: 'observe', stage: 5, lane: 2 },
  { id: 'rollback-emergency', title: '回滚预案与应急响应', kind: 'observe', stage: 5, lane: 3 },
  { id: 'postmortem-governance', title: '复盘沉淀与规则固化', kind: 'observe', stage: 6, lane: 2 },
]

export const FRONTEND_ENGINEERING_EDGES: WorkflowEdge[] = [
  { source: 'requirement-freeze', target: 'repo-architecture', label: '冻结边界与职责', kind: 'normal' },
  { source: 'requirement-freeze', target: 'dependency-governance', label: '明确依赖引入原则', kind: 'normal' },
  { source: 'requirement-freeze', target: 'performance-budget', label: '定义预算目标', kind: 'guard' },
  { source: 'repo-architecture', target: 'build-bundle', label: '建立构建输入结构', kind: 'normal' },
  { source: 'dependency-governance', target: 'build-bundle', label: '减少构建与运行风险', kind: 'optimize' },
  { source: 'build-bundle', target: 'quality-gates', label: '产物进入质量校验', kind: 'normal' },
  { source: 'performance-budget', target: 'quality-gates', label: '预算超阈值即阻断', kind: 'guard' },
  { source: 'build-bundle', target: 'cache-release-strategy', label: '产物指纹与缓存策略', kind: 'optimize' },
  { source: 'quality-gates', target: 'ci-cd-delivery', label: '门禁通过后发布', kind: 'guard' },
  { source: 'cache-release-strategy', target: 'ci-cd-delivery', label: '发布前缓存校验', kind: 'guard' },
  { source: 'ci-cd-delivery', target: 'config-env-management', label: '按环境注入配置', kind: 'normal' },
  { source: 'ci-cd-delivery', target: 'gray-release-observe', label: '进入灰度放量', kind: 'normal' },
  { source: 'ci-cd-delivery', target: 'observability-dashboard', label: '发布后实时观测', kind: 'feedback' },
  { source: 'config-env-management', target: 'gray-release-observe', label: '环境差异风险控制', kind: 'optimize' },
  { source: 'gray-release-observe', target: 'observability-dashboard', label: '验证分位数与错误率', kind: 'normal' },
  { source: 'observability-dashboard', target: 'rollback-emergency', label: '异常触发回滚阈值', kind: 'risk' },
  { source: 'gray-release-observe', target: 'rollback-emergency', label: '灰度异常快速止损', kind: 'risk' },
  { source: 'rollback-emergency', target: 'postmortem-governance', label: '事故复盘与改进', kind: 'feedback' },
  { source: 'observability-dashboard', target: 'postmortem-governance', label: '沉淀规则到门禁', kind: 'feedback' },
]

export const FRONTEND_FOUNDATIONS_NODE_WIDTH = 214
export const FRONTEND_FOUNDATIONS_NODE_HEIGHT = 58
export const FRONTEND_FOUNDATIONS_FALLBACK_WIDTH = 3000
export const FRONTEND_FOUNDATIONS_FALLBACK_HEIGHT = 980
export const FRONTEND_FOUNDATIONS_FALLBACK_NODE_WIDTH = 190
export const FRONTEND_FOUNDATIONS_FALLBACK_NODE_HEIGHT = 44

export const FRONTEND_FOUNDATIONS_KIND_LABELS: Record<string, string> = {
  html: 'HTML',
  css: 'CSS',
  javascript: 'JavaScript',
  browser: '浏览器',
  perf: '工程能力',
}

export const FRONTEND_FOUNDATIONS_NODES: WorkflowNode[] = [
  { id: 'html-semantic', title: 'HTML 语义结构与可访问性', kind: 'html', stage: 0, lane: 2 },
  { id: 'html-loading-blocking', title: 'HTML 加载与阻塞模型', kind: 'html', stage: 1, lane: 1 },
  { id: 'dom-event-model', title: 'DOM/BOM 与事件模型', kind: 'browser', stage: 1, lane: 3 },
  { id: 'css-cascade-specificity', title: 'CSS 层叠与优先级', kind: 'css', stage: 2, lane: 1 },
  { id: 'css-layout-system', title: 'CSS 布局系统（Flow/Flex/Grid）', kind: 'css', stage: 3, lane: 1 },
  { id: 'css-rendering-cost', title: 'CSS 渲染成本与动效策略', kind: 'css', stage: 4, lane: 1 },
  { id: 'js-scope-closure', title: 'JS 作用域、闭包与模块化', kind: 'javascript', stage: 2, lane: 3 },
  { id: 'js-event-loop', title: 'JS 事件循环与任务队列', kind: 'javascript', stage: 3, lane: 3 },
  { id: 'js-async-pattern', title: 'JS 异步模式与错误处理', kind: 'javascript', stage: 4, lane: 3 },
  { id: 'browser-storage-security', title: '浏览器存储与安全边界', kind: 'browser', stage: 5, lane: 2 },
  { id: 'network-request-pattern', title: '网络请求模式与重试治理', kind: 'browser', stage: 5, lane: 4 },
  { id: 'performance-debug-methodology', title: '性能调试与问题定位方法', kind: 'perf', stage: 6, lane: 2 },
]

export const FRONTEND_FOUNDATIONS_EDGES: WorkflowEdge[] = [
  { source: 'html-semantic', target: 'html-loading-blocking', label: '结构决定加载入口', kind: 'normal' },
  { source: 'html-semantic', target: 'dom-event-model', label: '结构决定交互语义', kind: 'practice' },
  { source: 'html-loading-blocking', target: 'css-cascade-specificity', label: '解析后进入样式系统', kind: 'normal' },
  { source: 'html-loading-blocking', target: 'js-scope-closure', label: '脚本加载与执行边界', kind: 'normal' },
  { source: 'css-cascade-specificity', target: 'css-layout-system', label: '层叠结果驱动布局', kind: 'normal' },
  { source: 'css-layout-system', target: 'css-rendering-cost', label: '布局进入绘制与合成', kind: 'normal' },
  { source: 'js-scope-closure', target: 'js-event-loop', label: '语言基础进入调度', kind: 'normal' },
  { source: 'dom-event-model', target: 'js-event-loop', label: '事件触发任务执行', kind: 'practice' },
  { source: 'js-event-loop', target: 'js-async-pattern', label: '异步控制流治理', kind: 'normal' },
  { source: 'dom-event-model', target: 'browser-storage-security', label: '状态落地与权限边界', kind: 'practice' },
  { source: 'js-async-pattern', target: 'network-request-pattern', label: '请求并发与重试策略', kind: 'optimize' },
  { source: 'css-rendering-cost', target: 'performance-debug-methodology', label: '渲染指标定位', kind: 'optimize' },
  { source: 'js-event-loop', target: 'performance-debug-methodology', label: '长任务与 INP 诊断', kind: 'optimize' },
  { source: 'browser-storage-security', target: 'performance-debug-methodology', label: '存储与安全问题定位', kind: 'risk' },
  { source: 'network-request-pattern', target: 'performance-debug-methodology', label: '网络瓶颈归因', kind: 'optimize' },
]

export const VUE_WORKFLOW_NODE_WIDTH = 214
export const VUE_WORKFLOW_NODE_HEIGHT = 58
export const VUE_WORKFLOW_FALLBACK_WIDTH = 2800
export const VUE_WORKFLOW_FALLBACK_HEIGHT = 980
export const VUE_WORKFLOW_FALLBACK_NODE_WIDTH = 190
export const VUE_WORKFLOW_FALLBACK_NODE_HEIGHT = 44

export const VUE_WORKFLOW_KIND_LABELS: Record<string, string> = {
  core: '核心',
  component: '组件',
  data: '数据',
  runtime: '运行时',
  quality: '质量',
}

export const VUE_WORKFLOW_NODES: WorkflowNode[] = [
  { id: 'vue-architecture', title: 'Vue 架构认知与项目分层', kind: 'core', stage: 0, lane: 2 },
  { id: 'vue-reactivity', title: '响应式核心（ref/reactive）', kind: 'core', stage: 1, lane: 2 },
  { id: 'vue-sfc-template', title: 'SFC 与模板编译机制', kind: 'core', stage: 1, lane: 4 },
  { id: 'vue-component-communication', title: '组件通信（props/emits/provide）', kind: 'component', stage: 2, lane: 1 },
  { id: 'vue-routing', title: '路由设计与页面状态', kind: 'component', stage: 2, lane: 3 },
  { id: 'vue-state-pinia', title: '状态管理（Pinia）', kind: 'data', stage: 3, lane: 1 },
  { id: 'vue-async-data', title: '异步数据与请求治理', kind: 'data', stage: 3, lane: 3 },
  { id: 'vue-render-scheduler', title: '渲染调度与更新批处理', kind: 'runtime', stage: 4, lane: 2 },
  { id: 'vue-performance', title: 'Vue 性能优化与场景治理', kind: 'runtime', stage: 5, lane: 1 },
  { id: 'vue-testing-deploy', title: '测试、构建与发布策略', kind: 'quality', stage: 5, lane: 3 },
  { id: 'vue-governance', title: '团队规范与复盘闭环', kind: 'quality', stage: 6, lane: 2 },
]

export const VUE_WORKFLOW_EDGES: WorkflowEdge[] = [
  { source: 'vue-architecture', target: 'vue-reactivity', label: '核心模型落地', kind: 'normal' },
  { source: 'vue-architecture', target: 'vue-sfc-template', label: '编译链路与工程约束', kind: 'practice' },
  { source: 'vue-reactivity', target: 'vue-component-communication', label: '响应式驱动组件通信', kind: 'normal' },
  { source: 'vue-sfc-template', target: 'vue-component-communication', label: '模板语义映射通信边界', kind: 'practice' },
  { source: 'vue-component-communication', target: 'vue-state-pinia', label: '状态上收与共享', kind: 'normal' },
  { source: 'vue-component-communication', target: 'vue-routing', label: '路由与组件协同', kind: 'normal' },
  { source: 'vue-routing', target: 'vue-async-data', label: '路由驱动数据请求', kind: 'normal' },
  { source: 'vue-state-pinia', target: 'vue-async-data', label: '统一状态与请求缓存', kind: 'optimize' },
  { source: 'vue-async-data', target: 'vue-render-scheduler', label: '数据变化进入更新队列', kind: 'normal' },
  { source: 'vue-render-scheduler', target: 'vue-performance', label: '长列表与交互优化', kind: 'optimize' },
  { source: 'vue-render-scheduler', target: 'vue-testing-deploy', label: '关键链路回归验证', kind: 'practice' },
  { source: 'vue-performance', target: 'vue-testing-deploy', label: '性能门禁接入发布', kind: 'optimize' },
  { source: 'vue-testing-deploy', target: 'vue-governance', label: '发布复盘沉淀规范', kind: 'practice' },
  { source: 'vue-performance', target: 'vue-governance', label: '性能问题经验沉淀', kind: 'risk' },
]

export const REACT_WORKFLOW_NODE_WIDTH = 214
export const REACT_WORKFLOW_NODE_HEIGHT = 58
export const REACT_WORKFLOW_FALLBACK_WIDTH = 2800
export const REACT_WORKFLOW_FALLBACK_HEIGHT = 980
export const REACT_WORKFLOW_FALLBACK_NODE_WIDTH = 190
export const REACT_WORKFLOW_FALLBACK_NODE_HEIGHT = 44

export const REACT_WORKFLOW_KIND_LABELS: Record<string, string> = {
  core: '核心',
  component: '组件',
  state: '状态',
  runtime: '运行时',
  quality: '质量',
}

export const REACT_WORKFLOW_NODES: WorkflowNode[] = [
  { id: 'react-mental-model', title: 'React 心智模型与数据流', kind: 'core', stage: 0, lane: 2 },
  { id: 'react-jsx-components', title: 'JSX 与组件抽象', kind: 'component', stage: 1, lane: 1 },
  { id: 'react-state-props', title: 'State/Props 设计边界', kind: 'state', stage: 1, lane: 3 },
  { id: 'react-hooks-rules', title: 'Hooks 规则与封装模式', kind: 'state', stage: 2, lane: 1 },
  { id: 'react-effect-lifecycle', title: 'Effect 生命周期治理', kind: 'runtime', stage: 2, lane: 3 },
  { id: 'react-routing-data', title: '路由与数据获取策略', kind: 'component', stage: 3, lane: 1 },
  { id: 'react-state-management', title: '状态管理（Context/Store）', kind: 'state', stage: 3, lane: 3 },
  { id: 'react-rendering-concurrent', title: '渲染阶段与并发能力', kind: 'runtime', stage: 4, lane: 2 },
  { id: 'react-performance', title: '性能优化（memo/拆分）', kind: 'runtime', stage: 5, lane: 1 },
  { id: 'react-testing-deploy', title: '测试、构建与发布', kind: 'quality', stage: 5, lane: 3 },
  { id: 'react-governance', title: '规范治理与复盘闭环', kind: 'quality', stage: 6, lane: 2 },
]

export const REACT_WORKFLOW_EDGES: WorkflowEdge[] = [
  { source: 'react-mental-model', target: 'react-jsx-components', label: '从声明式视图开始', kind: 'normal' },
  { source: 'react-mental-model', target: 'react-state-props', label: '确立单向数据流', kind: 'normal' },
  { source: 'react-jsx-components', target: 'react-hooks-rules', label: '组件抽象进入 Hook 封装', kind: 'practice' },
  { source: 'react-state-props', target: 'react-hooks-rules', label: '状态边界驱动 Hook 设计', kind: 'normal' },
  { source: 'react-hooks-rules', target: 'react-effect-lifecycle', label: '副作用与依赖治理', kind: 'normal' },
  { source: 'react-hooks-rules', target: 'react-routing-data', label: '路由页面组合策略', kind: 'practice' },
  { source: 'react-hooks-rules', target: 'react-state-management', label: '共享状态抽离', kind: 'normal' },
  { source: 'react-routing-data', target: 'react-rendering-concurrent', label: '数据加载影响渲染调度', kind: 'optimize' },
  { source: 'react-state-management', target: 'react-rendering-concurrent', label: '状态更新进入调度链路', kind: 'normal' },
  { source: 'react-effect-lifecycle', target: 'react-rendering-concurrent', label: 'Effect 触发重渲染约束', kind: 'risk' },
  { source: 'react-rendering-concurrent', target: 'react-performance', label: '并发与体验优化', kind: 'optimize' },
  { source: 'react-rendering-concurrent', target: 'react-testing-deploy', label: '关键路径回归验证', kind: 'practice' },
  { source: 'react-performance', target: 'react-testing-deploy', label: '性能门禁纳入发布', kind: 'optimize' },
  { source: 'react-testing-deploy', target: 'react-governance', label: '问题复盘沉淀规范', kind: 'practice' },
  { source: 'react-performance', target: 'react-governance', label: '高频回退场景治理', kind: 'risk' },
]

export const WEB_PIPELINE_NODE_WIDTH = 214
export const WEB_PIPELINE_NODE_HEIGHT = 58
export const WEB_PIPELINE_FALLBACK_WIDTH = 8400
export const WEB_PIPELINE_FALLBACK_HEIGHT = 980
export const WEB_PIPELINE_FALLBACK_NODE_WIDTH = 190
export const WEB_PIPELINE_FALLBACK_NODE_HEIGHT = 44

export const WEB_PIPELINE_KIND_LABELS: Record<string, string> = {
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
  },
  {
    id: 'sw-check',
    title: 'Service Worker 拦截',
    kind: 'cache',
    stage: 1,
    lane: 2,
  },
  {
    id: 'memory-cache',
    title: '内存缓存检查',
    kind: 'cache',
    stage: 2,
    lane: 1,
  },
  {
    id: 'disk-cache',
    title: '磁盘缓存检查',
    kind: 'cache',
    stage: 3,
    lane: 3,
  },
  {
    id: 'cdn-edge',
    title: 'CDN 边缘节点',
    kind: 'cache',
    stage: 4,
    lane: 2,
  },
  {
    id: 'dns-browser-cache',
    title: '浏览器 DNS 缓存',
    kind: 'network',
    stage: 5,
    lane: 1,
  },
  {
    id: 'dns-os-cache',
    title: '系统 DNS 缓存',
    kind: 'network',
    stage: 6,
    lane: 1,
  },
  {
    id: 'dns-hosts',
    title: 'Hosts 文件匹配',
    kind: 'network',
    stage: 7,
    lane: 1,
  },
  {
    id: 'dns-resolver',
    title: '递归 DNS 解析器',
    kind: 'network',
    stage: 8,
    lane: 2,
  },
  {
    id: 'dns-root',
    title: '根域名服务器',
    kind: 'network',
    stage: 9,
    lane: 1,
  },
  {
    id: 'dns-tld',
    title: '顶级域服务器',
    kind: 'network',
    stage: 10,
    lane: 1,
  },
  {
    id: 'dns-authoritative',
    title: '权威 DNS 服务器',
    kind: 'network',
    stage: 11,
    lane: 1,
  },
  {
    id: 'dns-result',
    title: '返回 IP 并写入缓存',
    kind: 'network',
    stage: 12,
    lane: 2,
  },
  {
    id: 'tcp-tls',
    title: 'TCP/TLS 建连',
    kind: 'network',
    stage: 13,
    lane: 2,
  },
  {
    id: 'http-request',
    title: '发送 HTTP 请求',
    kind: 'network',
    stage: 14,
    lane: 2,
  },
  {
    id: 'origin-response',
    title: '源站返回响应',
    kind: 'server',
    stage: 15,
    lane: 2,
  },
  {
    id: 'response-stream',
    title: '响应流接收',
    kind: 'render',
    stage: 16,
    lane: 2,
  },
  {
    id: 'html-parser',
    title: 'HTML 解析与 DOM',
    kind: 'render',
    stage: 17,
    lane: 1,
  },
  {
    id: 'cssom-js',
    title: 'CSSOM 构建与脚本执行',
    kind: 'render',
    stage: 17,
    lane: 3,
  },
  {
    id: 'render-tree',
    title: '构建渲染树',
    kind: 'render',
    stage: 18,
    lane: 2,
  },
  {
    id: 'layout',
    title: '布局计算（Layout）',
    kind: 'render',
    stage: 19,
    lane: 2,
  },
  {
    id: 'paint',
    title: '绘制（Paint）',
    kind: 'render',
    stage: 20,
    lane: 2,
  },
  {
    id: 'composite',
    title: '合成（Composite）',
    kind: 'render',
    stage: 21,
    lane: 2,
  },
  {
    id: 'cache-policy',
    title: '缓存策略优化',
    kind: 'perf',
    stage: 2,
    lane: 0,
  },
  {
    id: 'resource-hints',
    title: '资源预提示优化',
    kind: 'perf',
    stage: 10,
    lane: 0,
  },
  {
    id: 'render-opt',
    title: '渲染阶段优化',
    kind: 'perf',
    stage: 19,
    lane: 4,
  },
  {
    id: 'parse-blocking',
    title: '解析阻塞治理',
    kind: 'perf',
    stage: 17,
    lane: 5,
  },
  {
    id: 'forced-layout',
    title: '强制布局与回流治理',
    kind: 'perf',
    stage: 20,
    lane: 5,
  },
  {
    id: 'perf-metrics',
    title: '性能监控指标体系',
    kind: 'perf',
    stage: 22,
    lane: 0,
  },
  {
    id: 'engineering-pipeline',
    title: '前端工程化实践',
    kind: 'perf',
    stage: 23,
    lane: 1,
  },
  {
    id: 'html-strategy',
    title: 'HTML 加载与语义策略',
    kind: 'perf',
    stage: 23,
    lane: 2,
  },
  {
    id: 'css-strategy',
    title: 'CSS 架构与渲染策略',
    kind: 'perf',
    stage: 23,
    lane: 3,
  },
  {
    id: 'js-runtime',
    title: 'JavaScript 执行与调度',
    kind: 'perf',
    stage: 23,
    lane: 4,
  },
  {
    id: 'refresh-modes',
    title: '刷新模式与缓存判定',
    kind: 'perf',
    stage: 1,
    lane: 5,
  },
  {
    id: 'http-evolution',
    title: 'HTTP 协议演进与连接复用',
    kind: 'network',
    stage: 14,
    lane: 0,
  },
  {
    id: 'status-code-path',
    title: '状态码决策链（200/206/304）',
    kind: 'server',
    stage: 15,
    lane: 4,
  },
  {
    id: 'realtime-channel',
    title: '实时通道分支（WebSocket/SSE）',
    kind: 'network',
    stage: 16,
    lane: 5,
  },
  {
    id: 'security-cors',
    title: '同源与跨域安全策略',
    kind: 'network',
    stage: 14,
    lane: 5,
  },
  {
    id: 'runtime-storage',
    title: '运行时与存储关联',
    kind: 'perf',
    stage: 18,
    lane: 5,
  },
  {
    id: 'metrics-playbook',
    title: '指标异常排障动作库',
    kind: 'perf',
    stage: 22,
    lane: 5,
  },
  {
    id: 'release-gate',
    title: '发布回归与性能门禁',
    kind: 'perf',
    stage: 24,
    lane: 0,
  },
]

export const WEB_PIPELINE_EDGES: WorkflowEdge[] = [
  { source: 'nav-start', target: 'sw-check', label: '发起导航请求', kind: 'normal' },
  { source: 'nav-start', target: 'refresh-modes', label: '触发普通/强制刷新', kind: 'normal' },
  { source: 'sw-check', target: 'response-stream', label: '命中 SW 缓存', kind: 'hit' },
  { source: 'sw-check', target: 'memory-cache', label: 'SW 未命中', kind: 'miss' },
  { source: 'refresh-modes', target: 'memory-cache', label: '普通刷新优先复用缓存', kind: 'optimize' },
  { source: 'refresh-modes', target: 'disk-cache', label: '强制刷新绕过部分缓存', kind: 'optimize' },
  { source: 'refresh-modes', target: 'cache-policy', label: '刷新行为影响命中', kind: 'optimize' },
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
  { source: 'http-evolution', target: 'tcp-tls', label: '连接复用策略', kind: 'optimize' },
  { source: 'http-evolution', target: 'http-request', label: '协议版本影响传输', kind: 'optimize' },
  { source: 'http-evolution', target: 'perf-metrics', label: '协议指标对比', kind: 'optimize' },
  { source: 'tcp-tls', target: 'http-request', label: '连接建立完成', kind: 'normal' },
  { source: 'http-request', target: 'security-cors', label: '同源策略与预检', kind: 'optimize' },
  { source: 'security-cors', target: 'origin-response', label: 'CORS 校验与响应头', kind: 'optimize' },
  { source: 'security-cors', target: 'perf-metrics', label: '安全策略异常监控', kind: 'optimize' },
  { source: 'http-request', target: 'realtime-channel', label: '升级到实时通道', kind: 'optimize' },
  { source: 'realtime-channel', target: 'js-runtime', label: '事件流进入运行时', kind: 'optimize' },
  { source: 'realtime-channel', target: 'perf-metrics', label: '连接稳定性指标', kind: 'optimize' },
  { source: 'http-request', target: 'origin-response', label: '请求已发送', kind: 'normal' },
  { source: 'origin-response', target: 'status-code-path', label: '响应状态码分流', kind: 'optimize' },
  { source: 'status-code-path', target: 'response-stream', label: '200 内容流返回', kind: 'validate' },
  { source: 'status-code-path', target: 'response-stream', label: '206 分段传输', kind: 'validate' },
  { source: 'status-code-path', target: 'disk-cache', label: '304 复用本地副本', kind: 'validate' },
  { source: 'origin-response', target: 'response-stream', label: '200 / 304 / 206', kind: 'validate' },
  { source: 'response-stream', target: 'html-parser', label: '流式解析 HTML', kind: 'normal' },
  { source: 'response-stream', target: 'cssom-js', label: '预加载扫描', kind: 'normal' },
  { source: 'html-parser', target: 'runtime-storage', label: 'Cookie/Storage 读取影响', kind: 'optimize' },
  { source: 'js-runtime', target: 'runtime-storage', label: '存储访问与主线程', kind: 'optimize' },
  { source: 'runtime-storage', target: 'perf-metrics', label: '存储与运行时观测', kind: 'optimize' },
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
  { source: 'parse-blocking', target: 'response-stream', label: '预加载扫描治理', kind: 'optimize' },
  { source: 'parse-blocking', target: 'html-parser', label: 'HTML 解析阻塞治理', kind: 'optimize' },
  { source: 'parse-blocking', target: 'cssom-js', label: 'CSS/JS 阻塞治理', kind: 'optimize' },
  { source: 'render-opt', target: 'layout', label: 'contain / content-visibility', kind: 'optimize' },
  { source: 'render-opt', target: 'paint', label: '缩小重绘区域', kind: 'optimize' },
  { source: 'forced-layout', target: 'cssom-js', label: '批量读写 DOM', kind: 'optimize' },
  { source: 'forced-layout', target: 'layout', label: '避免强制同步布局', kind: 'optimize' },
  { source: 'forced-layout', target: 'paint', label: '减少回流重绘', kind: 'optimize' },
  { source: 'perf-metrics', target: 'tcp-tls', label: '网络阶段指标', kind: 'optimize' },
  { source: 'perf-metrics', target: 'origin-response', label: '服务端与 TTFB', kind: 'optimize' },
  { source: 'perf-metrics', target: 'layout', label: 'CWV 与渲染指标', kind: 'optimize' },
  { source: 'perf-metrics', target: 'composite', label: '帧率与长任务', kind: 'optimize' },
  { source: 'perf-metrics', target: 'metrics-playbook', label: '指标触发排障动作', kind: 'optimize' },
  { source: 'metrics-playbook', target: 'cache-policy', label: '缓存类异常修复', kind: 'optimize' },
  { source: 'metrics-playbook', target: 'forced-layout', label: '渲染类异常修复', kind: 'optimize' },
  { source: 'metrics-playbook', target: 'engineering-pipeline', label: '构建发布类异常修复', kind: 'optimize' },
  { source: 'engineering-pipeline', target: 'cache-policy', label: '构建产物可缓存性', kind: 'optimize' },
  { source: 'engineering-pipeline', target: 'resource-hints', label: '资源拆分与预加载', kind: 'optimize' },
  { source: 'engineering-pipeline', target: 'perf-metrics', label: 'CI 性能门禁与监控', kind: 'optimize' },
  { source: 'engineering-pipeline', target: 'release-gate', label: '发布前性能门禁', kind: 'optimize' },
  { source: 'perf-metrics', target: 'release-gate', label: '回归指标比对', kind: 'optimize' },
  { source: 'release-gate', target: 'cache-policy', label: '异常回滚与策略修复', kind: 'optimize' },
  { source: 'release-gate', target: 'resource-hints', label: '回归后资源策略校准', kind: 'optimize' },
  { source: 'html-strategy', target: 'nav-start', label: '语义结构与可访问性', kind: 'optimize' },
  { source: 'html-strategy', target: 'html-parser', label: '减少解析阻塞点', kind: 'optimize' },
  { source: 'html-strategy', target: 'parse-blocking', label: '首屏关键 HTML 组织', kind: 'optimize' },
  { source: 'css-strategy', target: 'cssom-js', label: '样式架构与选择器成本', kind: 'optimize' },
  { source: 'css-strategy', target: 'layout', label: '布局策略与稳定性', kind: 'optimize' },
  { source: 'css-strategy', target: 'paint', label: '重绘区域治理', kind: 'optimize' },
  { source: 'js-runtime', target: 'cssom-js', label: '脚本执行时机治理', kind: 'optimize' },
  { source: 'js-runtime', target: 'forced-layout', label: '避免读写交错', kind: 'optimize' },
  { source: 'js-runtime', target: 'perf-metrics', label: '长任务与交互延迟', kind: 'optimize' },
]

export const WEB_PIPELINE_FALLBACK_NODES: WorkflowFallbackNode[] = WEB_PIPELINE_NODES.map(node => ({
  id: node.id,
  title: node.title,
  kind: node.kind,
  x: 96 + node.stage * 308 + WEB_PIPELINE_FALLBACK_NODE_WIDTH / 2,
  y: 72 + node.lane * 154 + WEB_PIPELINE_FALLBACK_NODE_HEIGHT / 2,
}))

const fallbackNodeMap = new Map(WEB_PIPELINE_FALLBACK_NODES.map(node => [node.id, node]))

export const WEB_PIPELINE_FALLBACK_EDGES: WorkflowFallbackEdge[] = WEB_PIPELINE_EDGES.flatMap((edge) => {
  const sourceNode = fallbackNodeMap.get(edge.source)
  const targetNode = fallbackNodeMap.get(edge.target)
  if (!sourceNode || !targetNode)
    return []
  return [{ ...edge, sourceNode, targetNode }]
})

export const WEB_PIPELINE_NODE_MAP = new Map(WEB_PIPELINE_NODES.map(node => [node.id, node]))

export const WEB_PIPELINE_ALL_NODE_WIDTH = 214
export const WEB_PIPELINE_ALL_NODE_HEIGHT = 58
export const WEB_PIPELINE_ALL_FALLBACK_NODE_WIDTH = 190
export const WEB_PIPELINE_ALL_FALLBACK_NODE_HEIGHT = 44

const STAGE_GAP = 6
const STAGE_SPACING = 296
const LANE_SPACING = 160
const CANVAS_PADDING_X = 120
const CANVAS_PADDING_Y = 88

interface WorkflowSectionDefinition {
  nodes: WorkflowNode[]
  edges: WorkflowEdge[]
  kindLabels: Record<string, string>
}

const workflowSections: WorkflowSectionDefinition[] = [
  {
    nodes: WEB_PIPELINE_NODES,
    edges: WEB_PIPELINE_EDGES,
    kindLabels: WEB_PIPELINE_KIND_LABELS,
  },
  {
    nodes: FRONTEND_ENGINEERING_NODES,
    edges: FRONTEND_ENGINEERING_EDGES,
    kindLabels: FRONTEND_ENGINEERING_KIND_LABELS,
  },
  {
    nodes: FRONTEND_FOUNDATIONS_NODES,
    edges: FRONTEND_FOUNDATIONS_EDGES,
    kindLabels: FRONTEND_FOUNDATIONS_KIND_LABELS,
  },
  {
    nodes: VUE_WORKFLOW_NODES,
    edges: VUE_WORKFLOW_EDGES,
    kindLabels: VUE_WORKFLOW_KIND_LABELS,
  },
  {
    nodes: REACT_WORKFLOW_NODES,
    edges: REACT_WORKFLOW_EDGES,
    kindLabels: REACT_WORKFLOW_KIND_LABELS,
  },
]

function getMaxStage(nodes: WorkflowNode[]): number {
  return nodes.reduce((max, node) => Math.max(max, node.stage), 0)
}

const sectionStageOffsets: number[] = []
let stageCursor = 0
for (const section of workflowSections) {
  sectionStageOffsets.push(stageCursor)
  stageCursor += getMaxStage(section.nodes) + STAGE_GAP + 1
}

function offsetNodes(nodes: WorkflowNode[], stageOffset: number): WorkflowNode[] {
  return nodes.map(node => ({
    ...node,
    stage: node.stage + stageOffset,
  }))
}

export const WEB_PIPELINE_ALL_NODES: WorkflowNode[] = workflowSections.flatMap((section, index) =>
  offsetNodes(section.nodes, sectionStageOffsets[index]),
)

const connectorEdges: WorkflowEdge[] = [
  {
    source: 'release-gate',
    target: 'requirement-freeze',
    label: '进入工程化交付链',
    kind: 'optimize',
  },
  {
    source: 'postmortem-governance',
    target: 'html-semantic',
    label: '复盘经验回流基础能力',
    kind: 'feedback',
  },
  {
    source: 'performance-debug-methodology',
    target: 'vue-architecture',
    label: '框架实践承接基础能力',
    kind: 'practice',
  },
  {
    source: 'vue-governance',
    target: 'react-mental-model',
    label: '跨框架能力迁移',
    kind: 'practice',
  },
]

export const WEB_PIPELINE_ALL_EDGES: WorkflowEdge[] = [
  ...workflowSections.flatMap(section => section.edges),
  ...connectorEdges,
]

export const WEB_PIPELINE_ALL_KIND_LABELS: Record<string, string> = Object.assign(
  {},
  ...workflowSections.map(section => section.kindLabels),
)

export const WEB_PIPELINE_ALL_FALLBACK_NODES: WorkflowFallbackNode[] = WEB_PIPELINE_ALL_NODES.map(node => ({
  id: node.id,
  title: node.title,
  kind: node.kind,
  x: CANVAS_PADDING_X + node.stage * STAGE_SPACING + WEB_PIPELINE_ALL_FALLBACK_NODE_WIDTH / 2,
  y: CANVAS_PADDING_Y + node.lane * LANE_SPACING + WEB_PIPELINE_ALL_FALLBACK_NODE_HEIGHT / 2,
}))

const maxNodeX = Math.max(0, ...WEB_PIPELINE_ALL_FALLBACK_NODES.map(node => node.x))
const maxNodeY = Math.max(0, ...WEB_PIPELINE_ALL_FALLBACK_NODES.map(node => node.y))

export const WEB_PIPELINE_ALL_FALLBACK_WIDTH = Math.ceil(
  maxNodeX + WEB_PIPELINE_ALL_FALLBACK_NODE_WIDTH / 2 + CANVAS_PADDING_X,
)

export const WEB_PIPELINE_ALL_FALLBACK_HEIGHT = Math.ceil(
  maxNodeY + WEB_PIPELINE_ALL_FALLBACK_NODE_HEIGHT / 2 + CANVAS_PADDING_Y,
)

const allFallbackNodeMap = new Map(WEB_PIPELINE_ALL_FALLBACK_NODES.map(node => [node.id, node]))

export const WEB_PIPELINE_ALL_FALLBACK_EDGES: WorkflowFallbackEdge[] = WEB_PIPELINE_ALL_EDGES.flatMap((edge) => {
  const sourceNode = allFallbackNodeMap.get(edge.source)
  const targetNode = allFallbackNodeMap.get(edge.target)
  if (!sourceNode || !targetNode)
    return []

  return [{ ...edge, sourceNode, targetNode }]
})

export const WEB_PIPELINE_ALL_NODE_MAP = new Map(WEB_PIPELINE_ALL_NODES.map(node => [node.id, node]))

export const KNOWLEDGE_GRAPH = {
  nodeWidth: WEB_PIPELINE_ALL_NODE_WIDTH,
  nodeHeight: WEB_PIPELINE_ALL_NODE_HEIGHT,
  fallbackNodeWidth: WEB_PIPELINE_ALL_FALLBACK_NODE_WIDTH,
  fallbackNodeHeight: WEB_PIPELINE_ALL_FALLBACK_NODE_HEIGHT,
  fallbackWidth: WEB_PIPELINE_ALL_FALLBACK_WIDTH,
  fallbackHeight: WEB_PIPELINE_ALL_FALLBACK_HEIGHT,
  nodes: WEB_PIPELINE_ALL_NODES,
  edges: WEB_PIPELINE_ALL_EDGES,
  kindLabels: WEB_PIPELINE_ALL_KIND_LABELS,
  fallbackNodes: WEB_PIPELINE_ALL_FALLBACK_NODES,
  fallbackEdges: WEB_PIPELINE_ALL_FALLBACK_EDGES,
  nodeMap: WEB_PIPELINE_ALL_NODE_MAP,
} as const
