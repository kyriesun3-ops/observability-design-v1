import { useState, useEffect, createContext, useContext } from 'react';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import { ThunderboltOutlined, WarningOutlined, SafetyCertificateOutlined,
  DashboardOutlined, PlaySquareOutlined, DesktopOutlined,
  SyncOutlined, SearchOutlined, CalendarOutlined, DownOutlined,
  AppstoreOutlined, RightOutlined, FullscreenOutlined,
  CreditCardOutlined, UserOutlined, InfoCircleOutlined, GlobalOutlined } from '@ant-design/icons';
import { Table, Tooltip as ATooltip, Select, Modal, DatePicker } from 'antd';
import dayjs from 'dayjs';

// --- 格式化工具 ---
const rand = (min, max) => Math.floor(Math.random() * (max - min)) + min;
// 人民币金额：¥ 前缀 + 千分位 + 两位小数
const fmtCNY = (n) => '¥' + Number(n).toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
// Token 大数字按百万 (M) 计：不足 1M 也展示两位小数
const fmtM = (n) => (n / 1_000_000).toFixed(2) + 'M';

// --- MOCK DATA ---

const generateTimeSeries = () => {
  const dates = ['05月03日', '05月08日', '05月13日', '05月18日', '05月23日', '05月28日', '06月01日'];
  return dates.map((date) => ({
    date,
    // Overview
    requests: Math.floor(Math.random() * 2000) + 5000,
    errors: Math.floor(Math.random() * 150) + 50,
    cost: Math.floor(Math.random() * 500) + 800,
    tokens: Math.floor(Math.random() * 10) + 15,
    // Cost 消耗分析 - token 分项 (单位: 个) 与消费金额 (单位: ¥)
    inputTokens: rand(1_200_000, 2_400_000),
    cacheTokens: rand(400_000, 1_000_000),
    outputTokens: rand(600_000, 1_400_000),
    spend: rand(600, 1600),
    // Cache
    simpleHits: Math.floor(Math.random() * 500) + 100,
    semanticHits: Math.floor(Math.random() * 300) + 50,
    cacheHitTokens: rand(300_000, 900_000), // 缓存命中节省的 token 数 (单位: 个)
    hitRate: Math.floor(Math.random() * 40) + 40,
    speedupPercent: Math.floor(Math.random() * 30) + 50,
    savings: Math.floor(Math.random() * 200) + 50,
    cacheAvgLatency: Math.floor(Math.random() * 60) + 140, // 缓存加速后的平均延迟 (ms)
    // Errors
    errorRate: Math.floor(Math.random() * 10) + 1,
    err429: Math.floor(Math.random() * 50) + 10,
    err500: Math.floor(Math.random() * 20) + 2,
    err401: Math.floor(Math.random() * 10) + 1,
    rescued: Math.floor(Math.random() * 30),
    // Risk
    intercepts: Math.floor(Math.random() * 100) + 20,
    interceptRate: Math.floor(Math.random() * 5) + 1,
    // Latency (ms)
    p50: Math.floor(Math.random() * 200) + 800,
    p95: Math.floor(Math.random() * 500) + 1500,
    p99: Math.floor(Math.random() * 1000) + 2500,
    ttft: Math.floor(Math.random() * 100) + 300,
    avgLatency: Math.floor(Math.random() * 200) + 900,
    networkLatency: Math.floor(Math.random() * 100) + 200,
    inferenceLatency: Math.floor(Math.random() * 100) + 300,
    queueLatency: Math.floor(Math.random() * 100) + 150,
    // Desk
    deskSessions: Math.floor(Math.random() * 1000) + 500,
    activeDeskUsers: Math.floor(Math.random() * 200) + 100,
    // Desk MVP - 成本按规格 (单位: $)
    deskCostStandard: rand(80, 180),
    deskCostGpu: rand(200, 520),
    deskCostHighmem: rand(60, 140),
    // Desk MVP - 资源利用率 (%)
    deskCpuUtil: rand(30, 80),
    deskMemUtil: rand(30, 80),
    deskDiskUtil: rand(30, 80),
    deskGpuUtil: rand(30, 80),
    // Desk MVP - 桌面状态分布 (单位: 台, 对接系统真实状态)
    deskRunning: rand(160, 240),   // 运行中
    deskStopped: rand(40, 110),    // 已关机 (占用未释放, 可能仍计存储费)
    // Desk MVP - 连接质量 RTT (单位: ms)
    deskRttP50: rand(45, 90),
    deskRttP95: rand(110, 210),
    // Multimodal
    imageGen: Math.floor(Math.random() * 500) + 100,
    audioMin: Math.floor(Math.random() * 200) + 50,
    // Multimodal MVP - 调用量 (按模态, 单位: 次)
    mmImageReq: rand(200, 600),
    mmAudioReq: rand(150, 450),
    mmVideoReq: rand(40, 160),
    // Multimodal MVP - 成本 (按模态, 单位: $)
    mmImageCost: rand(20, 80),
    mmAudioCost: rand(15, 55),
    mmVideoCost: rand(60, 220),
    // Multimodal MVP - 异步任务状态 (单位: 个)
    taskSucceeded: rand(300, 700),
    taskProcessing: rand(20, 80),
    taskFailed: rand(5, 40),
    taskTimeout: rand(2, 25),
    // Multimodal MVP - 处理时长 (单位: s)
    mmP50: rand(4, 9),
    mmP95: rand(12, 22),
    mmP99: rand(25, 45),
    // Per-modality processing time percentiles (单位: s)
    mmImageP50: rand(3, 7),
    mmImageP95: rand(10, 18),
    mmImageP99: rand(20, 35),
    mmAudioP50: rand(4, 9),
    mmAudioP95: rand(12, 22),
    mmAudioP99: rand(25, 45),
    mmVideoP50: rand(5, 10),
    mmVideoP95: rand(15, 30),
    mmVideoP99: rand(30, 60),
    // Desk
    deskSessions: Math.floor(Math.random() * 1000) + 500,
    activeDeskUsers: Math.floor(Math.random() * 200) + 100,
    // Desk - 成本按规格 ($)
    deskCostStandard: rand(80, 180),
    deskCostGpu: rand(200, 520),
    deskCostHighmem: rand(60, 140),
    // Desk - 资源利用率 (%)
    deskCpuUtil: rand(30, 80),
    deskMemUtil: rand(30, 80),
    deskDiskUtil: rand(30, 80),
    deskGpuUtil: rand(30, 80),
    // Desk - 桌面状态分布 (台)
    deskRunning: rand(160, 240),
    deskStopped: rand(40, 110),
    // Desk - 连接质量 RTT (ms)
    deskRttP50: rand(45, 90),
    deskRttP95: rand(110, 210),
  }));
};

const dailyData = generateTimeSeries();

const deskDetailData = [
  { id: 'desk_rd_001', user: 'usr_rd_01', spec: 'GPU 型', hours: '186 h', util: '82%', status: 'running' },
  { id: 'desk_rd_007', user: 'usr_rd_07', spec: 'GPU 型', hours: '142 h', util: '63%', status: 'running' },
  { id: 'desk_mkt_03', user: 'usr_mkt_05', spec: '标准型', hours: '98 h', util: '44%', status: 'running' },
  { id: 'desk_ops_11', user: 'usr_ops_12', spec: '高内存型', hours: '12 h', util: '6%', status: 'stopped' },
  { id: 'desk_hr_004', user: 'usr_hr_02', spec: '标准型', hours: '0 h', util: '0%', status: 'released' },
];


const errorTypesData = [
  { name: '429 Rate Limit', value: 350 },
  { name: '500 Internal', value: 120 },
  { name: '401 Unauthorized', value: 80 },
  { name: '400 Bad Request', value: 50 },
  { name: '503 Unavailable', value: 25 },
];

// --- 消耗分析: 按服务商分布 (费用 ¥ / token 个 可切换) ---
// --- 消耗分析: 按服务商分布 (费用 ¥ / token 个 可切换) ---
const providerSpendData = [
  { name: 'OpenAI', cost: 8420.50, tokens: 142_800_000 },
  { name: 'Anthropic', cost: 5120.80, tokens: 98_200_000 },
  { name: 'Google', cost: 2840.20, tokens: 64_100_000 },
  { name: 'Meta (Groq)', cost: 450.60, tokens: 31_000_000 },
  { name: '通义千问', cost: 1280.40, tokens: 52_300_000 },
];

// --- 消耗分析: 按模型分布 (费用 ¥ / token 个 可切换) ---
const modelSpendData = [
  { name: 'gpt-4o', cost: 8420.50, tokens: 124_500_000 },
  { name: 'claude-3-5-sonnet', cost: 5120.80, tokens: 78_200_000 },
  { name: 'gemini-1.5-pro', cost: 2840.20, tokens: 32_100_000 },
  { name: 'qwen-max', cost: 1280.40, tokens: 52_300_000 },
  { name: 'llama-3.1-70b', cost: 450.60, tokens: 11_000_000 },
];

// --- 消耗分析: 消耗排行数据 ---
// 层级关系均为多对一: 部门 ⊃ 用户 ⊃ API Key (1 个 Key 仅归属 1 个用户, 1 个用户归属 1 个部门)。
// 每行附 model / provider 维度, 使排行可被全局筛选 (model/apiKey/user/provider) 联动过滤。
const consumeRankData = [
  { key: 'k1', apiKey: 'sk-...a1b2', user: 'usr_rd_01', dept: '研发', model: 'gpt-4o', provider: 'OpenAI', tokens: 28_000_000, cost: 2100.30 },
  { key: 'k2', apiKey: 'sk-...a1f9', user: 'usr_rd_01', dept: '研发', model: 'claude-3-5-sonnet', provider: 'Anthropic', tokens: 14_800_000, cost: 1320.20 },
  { key: 'k3', apiKey: 'sk-...c3d4', user: 'usr_rd_07', dept: '研发', model: 'gpt-4o-mini', provider: 'OpenAI', tokens: 31_200_000, cost: 2510.80 },
  { key: 'k4', apiKey: 'sk-...e5f6', user: 'usr_mkt_05', dept: '市场', model: 'gemini-1.5-pro', provider: 'Google', tokens: 18_600_000, cost: 1980.20 },
  { key: 'k5', apiKey: 'sk-...k1l2', user: 'usr_mkt_05', dept: '市场', model: 'qwen-max', provider: '通义千问', tokens: 9_200_000, cost: 740.60 },
  { key: 'k6', apiKey: 'sk-...g7h8', user: 'usr_ops_12', dept: '运营', model: 'claude-3-haiku', provider: 'Anthropic', tokens: 12_100_000, cost: 920.60 },
  { key: 'k7', apiKey: 'sk-...i9j0', user: 'usr_hr_02', dept: '人力', model: 'llama-3.1-70b', provider: 'Meta (Groq)', tokens: 6_400_000, cost: 480.40 },
  { key: 'k8', apiKey: 'sk-...m2n4', user: 'usr_fin_03', dept: '财务', model: 'gpt-4o', provider: 'OpenAI', tokens: 16_300_000, cost: 1610.50 },
  { key: 'k9', apiKey: 'sk-...p5q6', user: 'usr_dsn_08', dept: '设计', model: 'gemini-1.5-flash', provider: 'Google', tokens: 7_800_000, cost: 540.70 },
  { key: 'k10', apiKey: 'sk-...r7s8', user: 'usr_dat_11', dept: '数据', model: 'deepseek-v3', provider: '通义千问', tokens: 22_400_000, cost: 1340.90 },
  { key: 'k11', apiKey: 'sk-...t9u0', user: 'usr_dat_11', dept: '数据', model: 'qwen-plus', provider: '通义千问', tokens: 5_100_000, cost: 360.20 },
];


const COLORS = {
  blue: '#1677ff',
  green: '#52c41a',
  orange: '#faad14',
  red: '#ff4d4f',
  purple: '#722ed1',
  cyan: '#13c2c2',
  gray: '#e2e8f0',
  textLight: '#94a3b8',
  textMain: '#1e293b'
};

const PIE_COLORS = [COLORS.red, COLORS.orange, COLORS.blue, COLORS.purple, COLORS.cyan];

// 部门配色 (消耗排行：部门/用户/Key 三维度统一按部门着色)
const DEPT_COLORS = { '研发': COLORS.blue, '市场': COLORS.purple, '运营': COLORS.cyan, '人力': COLORS.orange, '财务': COLORS.green, '设计': COLORS.red, '数据': '#0ea5e9' };

// OpenRouter 风格：鼠标跟随的垂直参考线 (细实线) 与折线高亮圆点
const CROSSHAIR = { stroke: '#cbd5e1', strokeWidth: 1 };
const ACTIVE_DOT = { r: 4, strokeWidth: 2, stroke: '#fff' };

// 坐标轴极简化：X 轴仅显示首尾日期刻度，中间不显示文本/数字，保持界面干爽；
// Y 轴统一精简为 2 个刻度 (起点/终点)，与 X 轴保持一致的 UI 逻辑。
const AXIS_END_TICKS = ['05月03日', '06月01日'];

// 模态配色：图像/音频/视频 与任务状态统一色板
const MODAL_COLORS = { image: COLORS.purple, audio: COLORS.cyan, video: COLORS.blue };

// Mock generation counts for multimodal media
const imageGenCount = 4320; // 图片生成数
const videoGenCount = 1280; // 视频生成数
const audioGenCount = 860; // 音频生成数

// Data for generation type distribution chart
const generationData = [
  { name: '图片', value: imageGenCount },
  { name: '视频', value: videoGenCount },
  { name: '音频', value: audioGenCount },
];

const GEN_MODAL_COLORS = {
  '图片': COLORS.purple,
  '视频': COLORS.orange,
  '音频': COLORS.cyan,
};

// --- REUSABLE COMPONENTS ---
// 当前时间窗口文案，由全局时间筛选驱动，所有卡片副标题跟随
const TimeRangeContext = createContext('数据来自 05月03日 至 06月01日');
// 全局筛选：当前生效的「模型」筛选值列表 (空 = 未筛选)，驱动各指标卡的按模型联动
const FilterContext = createContext([]);
// 全局筛选：完整 chip 列表 [{key,value}]，驱动消耗排行等按 model/user/apiKey/provider 过滤
const FiltersContext = createContext([]);

// --- 模态图标 (单色扁平，继承文字色)：浮窗内「涉及模型」改为图标呈现 ---
const M_GLYPH = {
  T: <path d="M4 7h16M12 7v11" />,
  I: <g><rect x="3" y="4.5" width="18" height="15" rx="2" /><circle cx="8.5" cy="10" r="1.5" /><path d="M3 16.5l5-4 4 3 3-2 6 5" /></g>,
  A: <g><path d="M4 9.5v5h3.5L12 18V6L7.5 9.5H4z" /><path d="M16 9.2a4 4 0 010 5.6" /></g>,
  V: <g><rect x="2.5" y="6.5" width="13" height="11" rx="2" /><path d="M15.5 10l6-2.5v9l-6-2.5" /></g>,
};
const MIcon = ({ type, size = 15 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ verticalAlign: 'text-bottom' }} aria-hidden="true">
    {M_GLYPH[type]}
  </svg>
);
// value: ['T','I','A','V'] (覆盖范围) 或 { in:['T'], out:'I' } (输入 → 输出)
const Modalities = ({ value }) => {
  const arrow = <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ color: '#94a3b8', verticalAlign: 'text-bottom' }} aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6" /></svg>;
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '2px' }}>
      <span style={{ color: '#64748b', fontSize: '12px' }}>涉及</span>
      {Array.isArray(value)
        ? value.map(k => <MIcon key={k} type={k} />)
        : <>{value.in.map(k => <MIcon key={k} type={k} />)}{arrow}<MIcon type={value.out} /></>}
    </div>
  );
};

const XCard = ({ title, value, subtitle, tip, modalities, extra, control, children }) => {
  const rangeLabel = useContext(TimeRangeContext);
  const hasHint = tip || modalities;
  const hintContent = hasHint ? (
    <div style={{ fontSize: '12px', lineHeight: 1.6, maxWidth: '260px' }}>
      {tip && <div style={{ marginBottom: modalities ? '8px' : 0 }}>{tip}</div>}
      {modalities && <Modalities value={modalities} />}
    </div>
  ) : null;
  return (
    <div className="portkey-card">
      <div className="card-header">
        {/* 标题行：标题(hover 浮显说明) + 右侧展开图标，与标题对齐 */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
          <div className="card-title" style={{ marginBottom: 0 }}>
            {hasHint ? (
              <ATooltip title={hintContent} placement="top">
                <span className="card-title-hint">{title}</span>
              </ATooltip>
            ) : (
              <span>{title}</span>
            )}
          </div>
          {extra}
        </div>
        {/* 数值行：大数字 + 右侧控件(总览/按模型 等)，与数字中间对齐 */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', margin: '6px 0 2px' }}>
          <div className="card-value" style={{ marginBottom: 0 }}>{value}</div>
          {control}
        </div>
        {/* 副标题：数据来源时间区间，或卡片自定义副标题 */}
        <div className="card-subtitle">{subtitle || rangeLabel}</div>
      </div>
      <div className="card-body">
        {children}
      </div>
    </div>
  );
};

const CustomTooltip = ({ active, payload, label, unit }) => {
  if (active && payload && payload.length) {
    return (
      <div className="or-tooltip">
        {label && <div className="or-tooltip-date">{label}</div>}
        <div className="or-tooltip-rows">
          {payload.map((entry, i) => (
            <div key={i} className="or-tooltip-row">
              <span className="or-tooltip-dot" style={{ background: entry.color }} />
              <span className="or-tooltip-name">{entry.name}</span>
              <span className="or-tooltip-value">
                {typeof entry.value === 'number' ? entry.value.toLocaleString() : entry.value}{unit || ''}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  }
  return null;
};

// --- TIME FILTER COMPONENT ---
const timeOptions = [
  { label: '近1小时', value: '1h' },
  { label: '近1天', value: '24h' },
  { label: '近3天', value: '3d' },
  { label: '近7天', value: '7d' },
  { label: '近1个月', value: '30d' },
  { label: '自定义', value: 'custom' },
];

const TimeFilter = ({ selected, setSelected, customRange, setCustomRange }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
    <div className="date-filter" style={{ display: 'inline-flex', alignItems: 'center', cursor: 'pointer' }}>
      <CalendarOutlined style={{ color: '#64748b' }} />
      <select
        value={selected}
        onChange={e => setSelected(e.target.value)}
        style={{ border: 'none', background: 'transparent', fontSize: '14px', color: COLORS.textMain, marginLeft: '4px', outline: 'none', cursor: 'pointer' }}
      >
        {timeOptions.map(opt => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
      <DownOutlined style={{ fontSize: '10px', marginLeft: '4px', color: COLORS.textLight }} />
    </div>
    {selected === 'custom' && (
      <DatePicker.RangePicker
        showTime={{ format: 'HH:mm' }}
        format="YYYY-MM-DD HH:mm"
        placeholder={['开始时间', '结束时间']}
        value={customRange}
        onChange={(dates) => setCustomRange(dates)}
        size="small"
        style={{ borderRadius: '6px', border: '1px solid #cbd5e1' }}
      />
    )}
  </div>
);


// --- 0. Cost / Spend Analytics (消耗分析) ---
// 账户额度 KPI 卡片 (模块级, 供消耗分析复用)
const KpiCard = ({ label, value, icon, color, hint, hideRange }) => {
  const rangeLabel = useContext(TimeRangeContext);
  return (
    <div className="portkey-card" style={{ height: 'auto', padding: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
        {hint ? (
          <ATooltip title={hint} placement="top">
            <span className="card-title-hint" style={{ fontSize: '13px', fontWeight: 500, color: COLORS.textLight }}>{label}</span>
          </ATooltip>
        ) : (
          <span style={{ fontSize: '13px', fontWeight: 500, color: COLORS.textLight }}>{label}</span>
        )}
        {icon}
      </div>
      <div style={{ fontSize: '28px', fontWeight: 600, color }}>{value}</div>
      {/* 全局额度类指标不随时间筛选变化，隐藏时间区间副标题 */}
      {!hideRange && <div style={{ fontSize: '12px', color: COLORS.textLight, marginTop: '4px' }}>{rangeLabel}</div>}
    </div>
  );
};

// --- 总览 (Overview) ---
// 总览 = 完整「消耗分析」Tab 的全部卡片 (原样粘贴) + 下方追加其他 Tab 的关键指标卡 (原样)
const OverviewView = () => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
    {/* 1) 消耗分析 Tab 的全部卡片，原样粘贴 */}
    <CostView />
    {/* 2) 其他 Tab 的关键指标卡，原样追加于下方 */}
    <div className="dashboard-grid">
      <CacheHitCard />
      <CacheSavingsCard />
      <RescuedCard />
      <LatencyCard />
      <TtftCard />
      <GenTypeCard />
      <MmCostCard />
      <GenTimeCard />
    </div>
  </div>
);


const CostView = () => {
  const rangeLabel = useContext(TimeRangeContext);
  const [provMetric, setProvMetric] = useState('cost'); // cost | tokens
  const [modelMetric, setModelMetric] = useState('cost');
  const [rankLevel, setRankLevel] = useState('dept'); // dept | member | apiKey —— 当前粒度
  const [rankParent, setRankParent] = useState(null); // 下钻上下文 {type:'dept'|'member', value, dept?}
  const [rankMetric, setRankMetric] = useState('cost'); // cost | tokens
  const activeFilters = useContext(FiltersContext);  // 全局筛选 chip，驱动排行联动过滤

  // 消耗概览聚合
  const totalReq = dailyData.reduce((s, d) => s + d.requests, 0);
  const totalInput = dailyData.reduce((s, d) => s + d.inputTokens, 0);
  const totalCache = dailyData.reduce((s, d) => s + d.cacheTokens, 0);
  const totalOutput = dailyData.reduce((s, d) => s + d.outputTokens, 0);
  const totalToken = totalInput + totalCache + totalOutput;
  const totalSpend = dailyData.reduce((s, d) => s + d.spend, 0);

  // 图片 / 视频生成 (成功 / 失败) —— 对齐 OneLink 总览口径
  const imgSuccess = 4320, imgFailed = 86;
  const videoSuccess = 1280, videoFailed = 23;
  const totalImg = imgSuccess + imgFailed;
  const totalVideo = videoSuccess + videoFailed;

  // 账户额度 (mock)
  const cumRecharge = 50000;   // 累计充值
  const bonus = 2000;          // 赠金
  const cumConsume = 38680.50; // 累计消费
  const available = cumRecharge + bonus - cumConsume; // 可用额度

  // 服务商 / 模型分布按当前指标排序
  const provData = [...providerSpendData].sort((a, b) => b[provMetric] - a[provMetric]);
  const modelData = [...modelSpendData].sort((a, b) => b[modelMetric] - a[modelMetric]);

  // 消耗排行：可下钻探索 —— 部门 → 用户 → API Key（严格层级，均多对一）。
  // 受全局筛选联动：按 model / user / apiKey / provider 过滤参与排行的记录 (同维度 OR，跨维度 AND)。
  const RANK_FIELDS = { model: 'model', user: 'user', apiKey: 'apiKey', provider: 'provider' };
  const filterGroups = activeFilters.reduce((m, f) => {
    if (RANK_FIELDS[f.key]) (m[f.key] = m[f.key] || []).push(f.value);
    return m;
  }, {});
  const rankFiltered = Object.keys(filterGroups).length > 0;
  const scopedRows = consumeRankData.filter(r =>
    Object.entries(filterGroups).every(([k, vals]) => vals.includes(r[RANK_FIELDS[k]])));

  // 下钻上下文：进一步限定到某部门 / 某用户
  const parentRows = scopedRows.filter(r => {
    if (!rankParent) return true;
    if (rankParent.type === 'dept') return r.dept === rankParent.value;
    if (rankParent.type === 'member') return r.user === rankParent.value;
    return true;
  });
  const aggRank = (idFn) => Object.values(parentRows.reduce((m, r) => {
    const id = idFn(r);
    if (!m[id]) m[id] = { id, name: id, dept: r.dept, tokens: 0, cost: 0, _keys: new Set(), _users: new Set() };
    const o = m[id];
    o.tokens += r.tokens; o.cost += r.cost; o._keys.add(r.apiKey); o._users.add(r.user);
    return m;
  }, {})).map(o => ({ ...o, keyCount: o._keys.size, userCount: o._users.size }));
  const rankSrc = rankLevel === 'dept' ? aggRank(r => r.dept)
    : rankLevel === 'member' ? aggRank(r => r.user)
    : parentRows.map(r => ({ id: r.apiKey, name: r.apiKey, dept: r.dept, user: r.user, tokens: r.tokens, cost: r.cost }));
  const rankData = [...rankSrc].sort((a, b) => b[rankMetric] - a[rankMetric]);
  const RANK_TOP_N = 5;
  const rankMax = rankData.length ? rankData[0][rankMetric] : 1;
  const rankTotal = rankData.reduce((s, d) => s + d[rankMetric], 0) || 1;
  const metricFmt = (v) => rankMetric === 'cost' ? fmtCNY(v) : fmtM(v);
  const deptColor = (d) => DEPT_COLORS[d] || COLORS.blue;
  const dimLabel = { dept: '部门', member: '用户', apiKey: 'API Key' }[rankLevel];
  const canDrill = rankLevel !== 'apiKey';
  // 选择起始层级 = 回到该粒度的扁平排行
  const jumpLevel = (lv) => { setRankLevel(lv); setRankParent(null); };
  // 点击某行下钻到其子层级
  const drillInto = (d) => {
    if (rankLevel === 'dept') { setRankParent({ type: 'dept', value: d.name }); setRankLevel('member'); }
    else if (rankLevel === 'member') { setRankParent({ type: 'member', value: d.name, dept: d.dept }); setRankLevel('apiKey'); }
  };
  // 面包屑
  const crumbs = [{ label: '全部', go: () => jumpLevel('dept') }];
  if (rankParent?.type === 'dept') crumbs.push({ label: rankParent.value });
  if (rankParent?.type === 'member') {
    crumbs.push({ label: rankParent.dept, go: () => { setRankParent({ type: 'dept', value: rankParent.dept }); setRankLevel('member'); } });
    crumbs.push({ label: rankParent.value });
  }
  const segmented = (opts, val, set, ac = COLORS.blue) => (
    <div style={{ display: 'flex', border: `1px solid ${COLORS.gray}`, borderRadius: '6px', overflow: 'hidden', fontSize: '12px' }}>
      {opts.map(([k, lbl]) => (
        <span key={k} onClick={() => set(k)} style={{ padding: '3px 10px', cursor: 'pointer', whiteSpace: 'nowrap', background: val === k ? ac : '#fff', color: val === k ? '#fff' : '#64748b' }}>{lbl}</span>
      ))}
    </div>
  );
  // deepseek API platform 风格：概览卡内嵌迷你趋势图所需的逐日序列 (图片/视频按 成功·失败 拆分)
  const imgDaily = dailyData.map(d => ({ date: d.date, ok: d.mmImageReq, fail: Math.max(1, Math.round(d.mmImageReq * 0.02)) }));
  const videoDaily = dailyData.map(d => ({ date: d.date, ok: d.mmVideoReq, fail: Math.max(1, Math.round(d.mmVideoReq * 0.05)) }));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* 账户额度 KPI 行 */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '24px' }}>
        <KpiCard label="可用额度" value={fmtCNY(available)} color={COLORS.green} hideRange
          icon={<CreditCardOutlined style={{ fontSize: '20px', color: COLORS.green }} />}
          hint="可继续消费的实时余额。" />
        <KpiCard label="累计充值" value={fmtCNY(cumRecharge)} color={COLORS.textMain} hideRange
          icon={<ThunderboltOutlined style={{ fontSize: '20px', color: COLORS.blue }} />}
          hint="账户开通至今的付费充值到账总额（不含赠金）。" />
        <KpiCard label="累计消费" value={fmtCNY(cumConsume)} color={COLORS.textMain} hideRange
          icon={<DashboardOutlined style={{ fontSize: '20px', color: COLORS.purple }} />}
          hint="账户开通至今的累计扣费总额。" />
        <KpiCard label="赠金" value={fmtCNY(bonus)} color={COLORS.orange} hideRange
          icon={<SafetyCertificateOutlined style={{ fontSize: '20px', color: COLORS.orange }} />}
          hint="平台赠送的代金余额，消费时优先于充值余额抵扣。" />
      </div>

      {/* 消耗概览：请求数 / 总Token / 图片生成 / 视频生成 —— 卡内文案改为迷你趋势图 (deepseek API platform 风格) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '24px' }}>
        {/* 请求数 —— 面积迷你趋势 */}
        <div className="portkey-card overview-stat">
          <div className="overview-stat-head">
            <ATooltip title={<div style={{ fontSize: '12px', lineHeight: 1.6 }}>API 请求总数。<div style={{ marginTop: '8px' }}><Modalities value={['T', 'I', 'A', 'V']} /></div></div>} placement="top">
              <span className="overview-stat-label card-title-hint">请求数</span>
            </ATooltip>
            <span className="overview-stat-value">{totalReq.toLocaleString()}</span>
          </div>
          <div className="overview-stat-chart">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={dailyData} margin={{ top: 2, right: 0, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="spkReq" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={COLORS.blue} stopOpacity={0.25} />
                    <stop offset="100%" stopColor={COLORS.blue} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" hide />
                <Tooltip content={<CustomTooltip unit=" 次" />} cursor={CROSSHAIR} />
                <Area type="monotone" dataKey="requests" name="请求数" stroke={COLORS.blue} strokeWidth={1.8} fill="url(#spkReq)" activeDot={ACTIVE_DOT} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="overview-stat-sub">{rangeLabel}</div>
        </div>
        {/* 总 Token —— 输入/缓存/输出 堆叠迷你柱，明细见浮窗 */}
        <div className="portkey-card overview-stat">
          <div className="overview-stat-head">
            <ATooltip title={<div style={{ fontSize: '12px', lineHeight: 1.6 }}>Token 消耗总量，分输入/缓存/输出。<div style={{ marginTop: '8px' }}><Modalities value={['T', 'I', 'A', 'V']} /></div></div>} placement="top">
              <span className="overview-stat-label card-title-hint">总 token</span>
            </ATooltip>
            <span className="overview-stat-value">{fmtM(totalToken)}</span>
          </div>
          <div className="overview-stat-chart">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dailyData} margin={{ top: 2, right: 0, left: 0, bottom: 0 }}>
                <XAxis dataKey="date" hide />
                <Tooltip content={<CustomTooltip unit=" 个" />} cursor={{ fill: '#f1f5f9' }} />
                <Bar dataKey="inputTokens" name="输入" stackId="t" fill={COLORS.blue} maxBarSize={14} />
                <Bar dataKey="cacheTokens" name="缓存" stackId="t" fill={COLORS.cyan} maxBarSize={14} />
                <Bar dataKey="outputTokens" name="输出" stackId="t" fill={COLORS.purple} maxBarSize={14} radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="overview-stat-sub">{rangeLabel}</div>
        </div>
        {/* 图片生成 —— 成功/失败 堆叠迷你柱 */}
        <div className="portkey-card overview-stat">
          <div className="overview-stat-head">
            <ATooltip title={<div style={{ fontSize: '12px', lineHeight: 1.6 }}>图片生成任务数，分成功/失败。<div style={{ marginTop: '8px' }}><Modalities value={{ in: ['T'], out: 'I' }} /></div></div>} placement="top">
              <span className="overview-stat-label card-title-hint">图片生成</span>
            </ATooltip>
            <span className="overview-stat-value">{totalImg.toLocaleString()}</span>
          </div>
          <div className="overview-stat-chart">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={imgDaily} margin={{ top: 2, right: 0, left: 0, bottom: 0 }}>
                <XAxis dataKey="date" hide />
                <Tooltip content={<CustomTooltip unit=" 个" />} cursor={{ fill: '#f1f5f9' }} />
                <Bar dataKey="ok" name="成功" stackId="g" fill={COLORS.purple} maxBarSize={14} />
                <Bar dataKey="fail" name="失败" stackId="g" fill={COLORS.red} maxBarSize={14} radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="overview-stat-sub">{rangeLabel}</div>
        </div>
        {/* 视频生成 —— 成功/失败 堆叠迷你柱 */}
        <div className="portkey-card overview-stat">
          <div className="overview-stat-head">
            <ATooltip title={<div style={{ fontSize: '12px', lineHeight: 1.6 }}>视频生成任务数，分成功/失败。<div style={{ marginTop: '8px' }}><Modalities value={{ in: ['T'], out: 'V' }} /></div></div>} placement="top">
              <span className="overview-stat-label card-title-hint">视频生成</span>
            </ATooltip>
            <span className="overview-stat-value">{totalVideo.toLocaleString()}</span>
          </div>
          <div className="overview-stat-chart">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={videoDaily} margin={{ top: 2, right: 0, left: 0, bottom: 0 }}>
                <XAxis dataKey="date" hide />
                <Tooltip content={<CustomTooltip unit=" 个" />} cursor={{ fill: '#f1f5f9' }} />
                <Bar dataKey="ok" name="成功" stackId="g" fill={COLORS.cyan} maxBarSize={14} />
                <Bar dataKey="fail" name="失败" stackId="g" fill={COLORS.red} maxBarSize={14} radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="overview-stat-sub">{rangeLabel}</div>
        </div>
      </div>

      {/* 用量汇总 + 消费汇总 */}
      <div className="dashboard-grid">
        <XCard title="用量汇总" value={fmtM(totalToken)} subtitle="时间段内 Token 用量走势 (输入/缓存/输出)"
          tip="Token 用量的走势，分输入/缓存/输出。"
          modalities={['T', 'I', 'A', 'V']}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={dailyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: COLORS.textLight, fontSize: 11 }} dy={10} ticks={AXIS_END_TICKS} interval={0} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: COLORS.textLight, fontSize: 11 }} tickCount={2} tickFormatter={v => (v / 1_000_000).toFixed(0) + 'M'} />
              <Tooltip content={<CustomTooltip unit=" 个" />} cursor={{ fill: '#f1f5f9' }} />
              <Legend iconType="circle" wrapperStyle={{ fontSize: '12px' }} />
              <Bar dataKey="inputTokens" name="输入" stackId="t" fill={COLORS.blue} maxBarSize={30} />
              <Bar dataKey="cacheTokens" name="缓存" stackId="t" fill={COLORS.cyan} maxBarSize={30} />
              <Bar dataKey="outputTokens" name="输出" stackId="t" fill={COLORS.purple} maxBarSize={30} radius={[2, 2, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </XCard>

        <XCard title="消费汇总" value={fmtCNY(totalSpend)} subtitle="时间段内消费金额走势"
          tip="消费金额的走势。"
          modalities={['T', 'I', 'A', 'V']}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={dailyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorSpend" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={COLORS.green} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={COLORS.green} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: COLORS.textLight, fontSize: 11 }} dy={10} ticks={AXIS_END_TICKS} interval={0} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: COLORS.textLight, fontSize: 11 }} tickCount={2} tickFormatter={v => '¥' + v} />
              <Tooltip content={<CustomTooltip unit=" 元" />} cursor={CROSSHAIR} />
              <Area type="monotone" dataKey="spend" name="消费金额" stroke={COLORS.green} strokeWidth={2} fillOpacity={1} fill="url(#colorSpend)" />
            </AreaChart>
          </ResponsiveContainer>
        </XCard>
      </div>

      {/* 按服务商分布 + 按模型分布 (费用/token 切换) */}
      <div className="dashboard-grid">
        <DistributionCard
          title="按服务商分布" metric={provMetric} setMetric={setProvMetric} data={provData}
          tip="消耗按上游服务商归因，可切换费用/Token 口径。"
          modalities={['T', 'I', 'A', 'V']} />
        <DistributionCard
          title="按模型分布" metric={modelMetric} setMetric={setModelMetric} data={modelData}
          tip="消耗按具体模型归因，可切换费用/Token 口径。"
          modalities={['T', 'I', 'A', 'V']} />
      </div>

      {/* 消耗排行 —— 可下钻 (部门 → 用户 → API Key) · 费用/Token */}
      <div className="portkey-card" style={{ height: 'auto', padding: '20px 24px 24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <ATooltip title={<div style={{ fontSize: '12px', lineHeight: 1.6 }}>按部门 / 用户 / API Key 三个层级看消耗排行，可切换费用/Token 口径。<div style={{ marginTop: '8px' }}><Modalities value={['T', 'I', 'A', 'V']} /></div></div>} placement="top">
            <span className="card-title-hint" style={{ fontSize: '13px', fontWeight: 500, color: '#64748b' }}>消耗排行</span>
          </ATooltip>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {segmented([['dept', '部门'], ['member', '用户'], ['apiKey', 'API Key']], rankLevel, jumpLevel)}
            {segmented([['cost', '费用'], ['tokens', 'Token']], rankMetric, setRankMetric)}
          </div>
        </div>
        {/* 时间戳：跟随全局时间筛选 */}
        <div style={{ fontSize: '11px', color: COLORS.textLight, marginTop: '4px' }}>{rangeLabel}</div>

        {/* 面包屑 + 当前粒度 + 筛选提示 */}
        <div style={{ fontSize: '12px', margin: '10px 0 0', display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          {crumbs.map((c, i) => (
            <span key={i} style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
              {i > 0 && <span style={{ color: COLORS.textLight }}>›</span>}
              {c.go
                ? <span onClick={c.go} style={{ color: COLORS.blue, cursor: 'pointer' }}>{c.label}</span>
                : <span style={{ color: COLORS.textMain, fontWeight: 600 }}>{c.label}</span>}
            </span>
          ))}
          <span style={{ color: COLORS.textLight }}>· 当前按{dimLabel} · {rankData.length} 项{canDrill ? '（点击条目可下钻）' : ''}</span>
          {rankFiltered && (
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '1px 8px', borderRadius: '10px', background: '#eff6ff', border: '1px solid #bfdbfe', color: COLORS.blue, fontSize: '11px' }}>
              已按筛选过滤 · {scopedRows.length} 条
            </span>
          )}
        </div>

        {rankData.length === 0 ? (
          <div style={{ padding: '40px 0', textAlign: 'center', color: COLORS.textLight, fontSize: '13px' }}>当前筛选条件下暂无消耗数据</div>
        ) : (
          <div className={rankData.length > RANK_TOP_N ? 'rank-list rank-list--scroll' : 'rank-list'}
            style={{ display: 'flex', flexDirection: 'column', gap: '11px',
              ...(rankData.length > RANK_TOP_N
                ? { maxHeight: '236px', overflowY: 'auto', overflowX: 'hidden', margin: '16px -8px 0', padding: '0 8px' }
                : { marginTop: '16px' }) }}>
            {rankData.map((d, i) => {
              const v = d[rankMetric];
              const pct = rankMax ? (v / rankMax) * 100 : 0;
              const share = (v / rankTotal) * 100;
              const col = deptColor(d.dept);
              const isKey = rankLevel === 'apiKey';
              const sub = rankLevel === 'dept' ? `${d.userCount} 名用户 · ${d.keyCount} 个 Key`
                : rankLevel === 'member' ? `${d.dept} · ${d.keyCount} 个 Key`
                : `${d.dept} · ${d.user}`;
              return (
                <div key={d.id} className={'rank-row' + (canDrill ? ' drillable' : '')} onClick={canDrill ? () => drillInto(d) : undefined}
                  style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span style={{ width: '22px', height: '22px', borderRadius: '50%', flexShrink: 0, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 700, background: i < 3 ? col : '#f1f5f9', color: i < 3 ? '#fff' : COLORS.textLight }}>{i + 1}</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '5px', gap: '12px' }}>
                      <span style={{ fontSize: '13px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        <span style={isKey ? { fontFamily: 'monospace', color: COLORS.blue } : { color: COLORS.textMain, fontWeight: 600 }}>{d.name}</span>
                        <span style={{ fontSize: '11px', color: COLORS.textLight, marginLeft: '8px' }}>{sub}</span>
                      </span>
                      <span style={{ fontSize: '13px', fontWeight: 600, color: COLORS.textMain, whiteSpace: 'nowrap' }}>{metricFmt(v)}<span style={{ fontSize: '11px', color: COLORS.textLight, fontWeight: 400, marginLeft: '6px' }}>{share.toFixed(0)}%</span></span>
                    </div>
                    <div style={{ height: '8px', borderRadius: '4px', background: '#f1f5f9', overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${pct}%`, borderRadius: '4px', background: col, transition: 'width .3s' }} />
                    </div>
                  </div>
                  {canDrill && <span style={{ flexShrink: 0, color: COLORS.textLight, fontSize: '16px', lineHeight: 1 }}>›</span>}
                </div>
              );
            })}
          </div>
        )}

        {/* 底部：部门图例 + 总数提示（超出 Top5 时列表内滚动查看全部，不再弹窗） */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginTop: '18px' }}>
          <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
            {Object.entries(DEPT_COLORS).map(([d, c]) => (
              <span key={d} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: COLORS.textLight }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '2px', background: c }} />{d}
              </span>
            ))}
          </div>
          {rankData.length > RANK_TOP_N && (
            <span style={{ fontSize: '12px', color: COLORS.textLight }}>
              共 {rankData.length} 项 · 向下滚动查看全部
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

// 分布卡片：服务商/模型通用,支持费用(¥)/Token 切换
const DistributionCard = ({ title, metric, setMetric, data, tip, modalities }) => {
  const rangeLabel = useContext(TimeRangeContext);
  const total = data.reduce((s, d) => s + d[metric], 0);
  const fmtVal = (v) => metric === 'cost' ? fmtCNY(v) : fmtM(v);
  return (
    <div className="portkey-card">
      <div className="card-header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div className="card-title">
            <ATooltip title={<div style={{ fontSize: '12px', lineHeight: 1.6, maxWidth: '260px' }}>{tip}{modalities && <div style={{ marginTop: '8px' }}><Modalities value={modalities} /></div>}</div>} placement="top">
              <span className="card-title-hint">{title}</span>
            </ATooltip>
          </div>
          <div style={{ display: 'flex', border: `1px solid ${COLORS.gray}`, borderRadius: '6px', overflow: 'hidden', fontSize: '12px' }}>
            {[['cost', '费用'], ['tokens', 'Token']].map(([k, lbl]) => (
              <span key={k} onClick={() => setMetric(k)}
                style={{ padding: '3px 10px', cursor: 'pointer', background: metric === k ? COLORS.blue : '#fff', color: metric === k ? '#fff' : COLORS.textMuted }}>
                {lbl}
              </span>
            ))}
          </div>
        </div>
        <div className="card-value">{fmtVal(total)}</div>
        <div className="card-subtitle">{rangeLabel}</div>
      </div>
      <div className="card-body">
        <div style={{ display: 'flex', height: '100%', alignItems: 'center' }}>
          <div style={{ flex: 1, position: 'relative', height: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={data} cx="50%" cy="50%" innerRadius="50%" outerRadius="80%" paddingAngle={2} dataKey={metric} nameKey="name" stroke="none">
                  {data.map((entry, idx) => (
                    <Cell key={idx} fill={PIE_COLORS[idx % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip unit={metric === 'cost' ? ' 元' : ' 个'} />} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div style={{ width: '160px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            {data.map((item, idx) => (
              <div key={item.name} style={{ marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: PIE_COLORS[idx % PIE_COLORS.length] }}></div>
                <div style={{ fontSize: '11px', color: COLORS.textMain }}>{item.name}</div>
                <div style={{ fontSize: '11px', color: COLORS.textLight, marginLeft: 'auto' }}>{((item[metric] / total) * 100).toFixed(0)}%</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// --- 1. Cache Analytics ---
// 缓存命中token数卡 (抽为组件，供缓存命中 Tab 与总览复用，样式完全一致)
const CacheHitCard = () => {
  const chartData = dailyData.map(d => ({ ...d, cacheHits: d.simpleHits + d.semanticHits }));
  const totalHitTokens = dailyData.reduce((s, d) => s + d.cacheHitTokens, 0);
  const hitRate = 65.4; // 命中率 (mock)
  const hits = useBreakdown({
    totalData: chartData,
    totalKey: 'cacheHits',
    totalName: '缓存命中token数',
    totalColor: COLORS.blue,
    byModel: cacheHitsByModel,
    agg: 'sum',
    unit: 'k tokens',
    yTickFormatter: v => v + 'k',
    modalTitle: '缓存命中token数 · 按模型明细',
    valueFmt: v => Math.round(v).toLocaleString() + 'k',
    pctColumnTitle: '缓存命中率',
    pctColumnRender: (_t, r) => MODEL_CACHE_HIT_RATES[r.model] || '65.4%'
  });
  return (
    <XCard
      title="缓存命中token数"
      value={
        <span style={{ display: 'flex', alignItems: 'baseline', gap: '16px' }}>
          <span>{fmtM(totalHitTokens)}</span>
          <span style={{ fontSize: '14px', fontWeight: 500, color: COLORS.textLight }}>命中率 {hitRate}%</span>
        </span>
      }
      tip="缓存命中Input Token数。"
      modalities={['T']}
      extra={hits.extra} control={hits.control}>
      {hits.chart}
      {hits.modal}
    </XCard>
  );
};

// 缓存节省成本卡
const CacheSavingsCard = () => {
  const totalSavings = dailyData.reduce((s, d) => s + d.savings, 0);
  const savings = useBreakdown({ totalData: dailyData, totalKey: 'savings', totalName: '节省成本', totalColor: COLORS.green, byModel: cacheSavingsByModel, agg: 'sum', unit: ' 元', yTickFormatter: v => '¥' + v, modalTitle: '缓存节省成本 · 按模型明细', valueFmt: v => fmtCNY(v) });
  return (
    <XCard title="缓存节省成本" value={fmtCNY(totalSavings)}
      tip="命中缓存免去真实模型调用所估算的累计节省金额。"
      modalities={['T']}
      extra={savings.extra} control={savings.control}>
      {savings.chart}
      {savings.modal}
    </XCard>
  );
};

const CacheView = () => (
  <div className="dashboard-grid">
    <CacheHitCard />
    <CacheSavingsCard />
  </div>
);
// --- 2. Error Analytics ---
const ErrorsView = () => {
  const rate = useBreakdown({ totalData: dailyData, totalKey: 'errorRate', totalName: '报错率', totalColor: COLORS.red, byModel: errorRateByModel, agg: 'avg', unit: '%', modalTitle: '报错率 · 按模型明细', valueFmt: v => v.toFixed(1) + '%' });
  return (
  <div className="dashboard-grid">
    <XCard title="报错率" value="4.2%"
      tip="服务报错的请求占比。"
      modalities={['T', 'I', 'A', 'V']}
      extra={rate.extra} control={rate.control}>
      {rate.chart}
      {rate.modal}
    </XCard>
    <XCard title="报错数量" value="850"
      tip="报错请求数，按 HTTP 状态码（429 限流/500 服务端/401 鉴权）拆分。计算：按状态码分别累加报错请求数。"
      modalities={['T', 'I', 'A', 'V']}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={dailyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
          <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: COLORS.textLight, fontSize: 11 }} dy={10} ticks={AXIS_END_TICKS} interval={0} />
          <YAxis axisLine={false} tickLine={false} tick={{ fill: COLORS.textLight, fontSize: 11 }} tickCount={2} />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: '#f1f5f9' }} />
          <Legend iconType="circle" wrapperStyle={{ fontSize: '12px' }} />
          <Bar dataKey="err429" name="429 限流" stackId="a" fill={COLORS.orange} maxBarSize={30} />
          <Bar dataKey="err500" name="500 服务端" stackId="a" fill={COLORS.red} maxBarSize={30} />
          <Bar dataKey="err401" name="401 鉴权" stackId="a" fill={COLORS.purple} maxBarSize={30} />
        </BarChart>
      </ResponsiveContainer>
    </XCard>
    <XCard title="报错类型分布" value="5 类"
      tip="报错请求按错误类型归类，定位主要故障来源。计算：按类型统计报错请求数并计算占比。"
      modalities={['T', 'I', 'A', 'V']}>
      <div style={{ display: 'flex', height: '100%' }}>
        <div style={{ flex: 1, position: 'relative' }}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={errorTypesData} cx="50%" cy="50%" innerRadius="50%" outerRadius="80%" paddingAngle={2} dataKey="value" stroke="none">
                {errorTypesData.map((entry, idx) => (
                  <Cell key={idx} fill={PIE_COLORS[idx % PIE_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div style={{ width: '120px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          {errorTypesData.map((item, idx) => (
            <div key={item.name} style={{ marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: PIE_COLORS[idx % PIE_COLORS.length] }}></div>
              <div style={{ fontSize: '11px', color: COLORS.textMain }}>{item.name}</div>
            </div>
          ))}
        </div>
      </div>
    </XCard>
    <RescuedCard />
  </div>
  );
};

// 挽救请求数卡 (抽为组件，供报错分析 Tab 与总览复用)
const RescuedCard = () => (
  <XCard title="挽救请求数" value="120"
    tip="经自动重试/故障转移最终成功的原报错请求数，反映容错能力。计算：累加重试或转移后转为成功的请求数。"
    modalities={['T', 'I', 'A', 'V']}>
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={dailyData.map(d => ({ ...d, rescued: 0 }))} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
        <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: COLORS.textLight, fontSize: 11 }} dy={10} ticks={AXIS_END_TICKS} interval={0} />
        <YAxis axisLine={false} tickLine={false} tick={{ fill: COLORS.textLight, fontSize: 11 }} tickCount={2} />
        <Tooltip content={<CustomTooltip />} cursor={CROSSHAIR} />
        <Line type="monotone" dataKey="rescued" name="挽救请求数" stroke={COLORS.green} strokeWidth={2} dot={false} activeDot={ACTIVE_DOT} />
      </LineChart>
    </ResponsiveContainer>
  </XCard>
);

// --- 4. Latency Analytics ---
// 平均延迟卡 (含分位切换，抽为组件供延迟分析 Tab 与总览复用)
const LatencyCard = () => {
  const [percentile, setPercentile] = useState('p50');
  const pSelect = (
    <select value={percentile} onChange={e => setPercentile(e.target.value)} style={{ padding: '3px 6px', borderRadius: '4px', border: `1px solid ${COLORS.gray}`, fontSize: '12px' }}>
      <option value="p50">P50</option>
      <option value="p95">P95</option>
      <option value="p99">P99</option>
    </select>
  );
  const lat = useBreakdown({ totalData: dailyData, totalKey: percentile, totalName: `${percentile.toUpperCase()} 延迟`, totalColor: COLORS.blue, byModel: latByModel[percentile], agg: 'avg', unit: ' ms', modalTitle: '端到端延迟 · 按模型明细', valueFmt: v => Math.round(v) + ' ms', controlExtra: pSelect });
  return (
    <XCard title="平均延迟" value={`${percentile.toUpperCase()}: 1.2s`}
      tip="请求端到端总耗时的分位数（P50/P95/P99），可切换分位看长尾。计算：对区间内各请求耗时取所选分位。"
      modalities={['T']}
      extra={lat.extra} control={lat.control}>
      {lat.chart}
      {lat.modal}
    </XCard>
  );
};

// 平均首字延迟 (TTFT) 卡
const TtftCard = () => {
  const ttft = useBreakdown({ totalData: dailyData, totalKey: 'ttft', totalName: '首字延迟', totalColor: COLORS.green, byModel: ttftByModel, agg: 'avg', unit: ' ms', modalTitle: '首字延迟 TTFT · 按模型明细', valueFmt: v => Math.round(v) + ' ms' });
  return (
    <XCard title="平均首字延迟 (TTFT)" value="350 ms"
      tip="从发起请求到首个 Token 返回的耗时（TTFT），衡量流式初始体验。计算：对区间内各请求 TTFT 取平均。"
      modalities={['T']}
      extra={ttft.extra} control={ttft.control}>
      {ttft.chart}
      {ttft.modal}
    </XCard>
  );
};

const LatencyView = () => (
  <div className="dashboard-grid">
    <LatencyCard />
    <TtftCard />
  </div>
);

// --- 5. Multimodal Analytics ---
// 文本分段切换控件：用于「按模态趋势/模型排行」「模态标签」等卡内视图切换
const Seg = ({ options, value, onChange }) => (
  <div style={{ display: 'inline-flex', background: '#f1f5f9', borderRadius: '6px', padding: '2px' }}>
    {options.map(o => {
      const active = value === o.value;
      return (
        <span key={o.value} onClick={() => onChange(o.value)}
          style={{ padding: '3px 10px', fontSize: '12px', borderRadius: '4px', cursor: 'pointer',
            color: active ? COLORS.blue : '#64748b', background: active ? '#fff' : 'transparent',
            fontWeight: active ? 600 : 400, boxShadow: active ? '0 1px 2px rgba(0,0,0,0.06)' : 'none',
            display: 'inline-flex', alignItems: 'center', gap: '4px', transition: 'all .15s' }}>
          {o.dot && <span style={{ width: 7, height: 7, borderRadius: '50%', background: o.dot }} />}
          {o.label}
        </span>
      );
    })}
  </div>
);

// 整合卡片①：多模态调用量 + 跨模态模型调用排行（按模态趋势 ⇄ 模型排行，排行可展开看全量）
const MmCallCard = () => (
  <XCard title="多模态调用量" value="12,480 次"
    tip="多模态请求次数，按模态（图像/音频/视频）拆分，统一以「次」计。计算：按模态分别累加请求次数。"
    modalities={['I', 'A', 'V']}>
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={dailyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
        <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: COLORS.textLight, fontSize: 11 }} dy={10} ticks={AXIS_END_TICKS} interval={0} />
        <YAxis axisLine={false} tickLine={false} tick={{ fill: COLORS.textLight, fontSize: 11 }} tickCount={2} />
        <Tooltip content={<CustomTooltip unit=" 次" />} cursor={{ fill: '#f1f5f9' }} />
        <Legend iconType="circle" wrapperStyle={{ fontSize: '12px' }} />
        <Bar dataKey="mmImageReq" name="图像" stackId="a" fill={MODAL_COLORS.image} maxBarSize={30} />
        <Bar dataKey="mmAudioReq" name="音频" stackId="a" fill={MODAL_COLORS.audio} maxBarSize={30} />
        <Bar dataKey="mmVideoReq" name="视频" stackId="a" fill={MODAL_COLORS.video} maxBarSize={30} radius={[2, 2, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  </XCard>
);

// 整合卡片②：平均生成时长 —— 图像/视频/音频 标签切换(默认视频) + 总览/按模型(useBreakdown) + 分位
const GenTimeCard = () => {
  const [modality, setModality] = useState('video');
  const [p, setP] = useState('p50');
  const meta = MM_MODALITY_META[modality];
  const prefix = { image: 'mmImage', audio: 'mmAudio', video: 'mmVideo' }[modality];
  const dk = `${prefix}${p.toUpperCase()}`;
  const modalityTabs = (
    <Seg value={modality} onChange={setModality}
      options={['image', 'video', 'audio'].map(k => ({ value: k, label: MM_MODALITY_META[k].label, dot: MM_MODALITY_META[k].color }))} />
  );
  const pSel = (
    <select value={p} onChange={e => setP(e.target.value)} style={{ padding: '3px 6px', borderRadius: '4px', border: `1px solid ${COLORS.gray}`, fontSize: '12px' }}>
      <option value="p50">P50</option>
      <option value="p95">P95</option>
      <option value="p99">P99</option>
    </select>
  );
  const mb = useBreakdown({
    totalData: dailyData, totalKey: dk, totalName: `${meta.label} ${p.toUpperCase()}`, totalColor: meta.color,
    byModel: genByModel[modality][p], agg: 'avg', unit: ' s',
    modalTitle: `${meta.label}生成时长 · 按模型明细`, valueFmt: v => v.toFixed(1) + ' s',
    controlExtra: <>{modalityTabs}{pSel}</>,
  });
  return (
    <XCard title="平均生成时长" value={`${meta.label} ${p.toUpperCase()}: ${dailyData.at(-1)[dk]}s`}
      tip="多模态生成任务从提交到产物完成的处理时长分位数（P50/P95/P99），可按模态切换（默认视频）。计算：对所选模态任务的处理时长取所选分位。"
      modalities={['I', 'A', 'V']}
      extra={mb.extra} control={mb.control}>
      {mb.chart}
      {mb.modal}
    </XCard>
  );
};

// 生成类型分布卡 (抽为组件，供多媒体 Tab 与总览复用)
const GenTypeCard = () => (
  <XCard title="生成类型分布"
    tip="产物数量按生成媒体类型（图片/视频/音频）的占比。计算：按类型统计产物数量并计算占比。"
    modalities={['I', 'A', 'V']}>
    <div style={{ display: 'flex', height: '100%' }}>
      <div style={{ flex: 1, position: 'relative' }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={generationData} cx="50%" cy="50%" innerRadius="50%" outerRadius="80%" paddingAngle={2} dataKey="value" nameKey="name" stroke="none">
              {generationData.map((entry, idx) => (
                <Cell key={idx} fill={GEN_MODAL_COLORS[entry.name] || COLORS.gray} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div style={{ width: '130px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        {generationData.map((item) => (
          <div key={item.name} style={{ marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: GEN_MODAL_COLORS[item.name] || COLORS.gray }}></div>
            <div style={{ fontSize: '11px', color: COLORS.textMain }}>{item.name}: {item.value}次</div>
          </div>
        ))}
      </div>
    </div>
  </XCard>
);

// 多模态成本卡
const MmCostCard = () => (
  <XCard title="多模态成本" value="¥1,860.00"
    tip="消费金额按模态（图像/音频/视频）归因。计算：各模态生成请求的实际扣费按日累加并堆叠。"
    modalities={['I', 'A', 'V']}>
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={dailyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
        <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: COLORS.textLight, fontSize: 11 }} dy={10} ticks={AXIS_END_TICKS} interval={0} />
        <YAxis axisLine={false} tickLine={false} tick={{ fill: COLORS.textLight, fontSize: 11 }} tickCount={2} tickFormatter={v => '¥' + v} />
        <Tooltip content={<CustomTooltip unit=" 元" />} cursor={{ fill: '#f1f5f9' }} />
        <Legend iconType="circle" wrapperStyle={{ fontSize: '12px' }} />
        <Bar dataKey="mmImageCost" name="图像" stackId="c" fill={MODAL_COLORS.image} maxBarSize={30} />
        <Bar dataKey="mmAudioCost" name="音频" stackId="c" fill={MODAL_COLORS.audio} maxBarSize={30} />
        <Bar dataKey="mmVideoCost" name="视频" stackId="c" fill={MODAL_COLORS.video} maxBarSize={30} radius={[2, 2, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  </XCard>
);

const MultimodalView = () => (
  <div className="dashboard-grid">
    <MmCallCard />
    <GenTypeCard />
    <MmCostCard />
    <GenTimeCard />
  </div>
);

// =====================================================================
// 按模型维度的呈现 (方案 B, 分层) —— 图内「总览 ⇄ 按模型」切换 + 「展开详情」全量弹窗
//   · 切换 = 轻量快览：聚合 ⇄ 细分；高基数自动收敛为 Top5 + 其他
//   · 展开 = 深查：弹窗内放 Top5 大图 + 全量模型可排序表
// =====================================================================
const MODEL_DATES = ['05月03日', '05月08日', '05月13日', '05月18日', '05月23日', '05月28日', '06月01日'];

// 全量模型池 (12 个, 演示高基数下的 Top N + 其他 收敛)
const ALL_MODELS = [
  { name: 'gpt-4o', hits: 420, savings: 90, errorRate: 4.2, ttft: 340, lat: 1820, calls: 142800 },
  { name: 'gpt-4o-mini', hits: 520, savings: 60, errorRate: 2.1, ttft: 180, lat: 900, calls: 188400 },
  { name: 'claude-3-5-sonnet', hits: 300, savings: 70, errorRate: 3.2, ttft: 380, lat: 1610, calls: 98200 },
  { name: 'claude-3-haiku', hits: 380, savings: 45, errorRate: 2.8, ttft: 160, lat: 850, calls: 76500 },
  { name: 'gemini-1.5-pro', hits: 175, savings: 40, errorRate: 5.4, ttft: 420, lat: 2240, calls: 64100 },
  { name: 'gemini-1.5-flash', hits: 300, savings: 35, errorRate: 3.9, ttft: 150, lat: 780, calls: 71200 },
  { name: 'qwen-max', hits: 240, savings: 55, errorRate: 3.5, ttft: 300, lat: 1490, calls: 52300 },
  { name: 'qwen-plus', hits: 160, savings: 30, errorRate: 3.1, ttft: 240, lat: 1200, calls: 41800 },
  { name: 'deepseek-v3', hits: 210, savings: 50, errorRate: 4.6, ttft: 260, lat: 1700, calls: 48600 },
  { name: 'llama-3.1-70b', hits: 90, savings: 20, errorRate: 9.0, ttft: 210, lat: 980, calls: 31000 },
  { name: 'mistral-large', hits: 120, savings: 25, errorRate: 6.2, ttft: 300, lat: 1600, calls: 28400 },
  { name: 'glm-4', hits: 80, savings: 15, errorRate: 5.0, ttft: 280, lat: 1400, calls: 22700 },
];

// 生成某指标的逐日 by-model 序列 (每行: {date, '<model>': v, ...})
const buildMetricSeries = (metric, jitter = 0.3, decimals = 0) =>
  MODEL_DATES.map(date => {
    const row = { date };
    ALL_MODELS.forEach(m => {
      const v = m[metric] * (1 - jitter / 2 + Math.random() * jitter);
      row[m.name] = decimals ? +v.toFixed(decimals) : Math.round(v);
    });
    return row;
  });

const cacheHitsByModel = buildMetricSeries('hits');
const cacheSavingsByModel = buildMetricSeries('savings');
const errorRateByModel = buildMetricSeries('errorRate', 0.5, 1);
const ttftByModel = buildMetricSeries('ttft');

// 延迟按模型 × 分位 (p95 为基准，p50≈0.6×、p99≈1.6×)
const buildLatSeries = (factor) => MODEL_DATES.map(date => {
  const row = { date };
  ALL_MODELS.forEach(m => { row[m.name] = Math.round(m.lat * factor * (0.85 + Math.random() * 0.3)); });
  return row;
});
const latByModel = { p50: buildLatSeries(0.6), p95: buildLatSeries(1), p99: buildLatSeries(1.6) };

// 多模态生成模型池 (按模态)，用于生成时长的「按模型」细分；与文本模型同属全局 Model 筛选
const GEN_MODELS = {
  image: [
    { name: 'flux-1.1-pro', t: 6, c: 1360 }, { name: 'sd-3.5-large', t: 8, c: 1140 }, { name: 'dall-e-3', t: 12, c: 800 },
    { name: 'flux-schnell', t: 3, c: 1740 }, { name: 'ideogram-v2', t: 9, c: 660 }, { name: 'recraft-v3', t: 7, c: 540 },
  ],
  audio: [
    { name: 'tts-1', t: 4, c: 1500 }, { name: 'tts-1-hd', t: 6, c: 900 }, { name: 'whisper-large-v3', t: 5, c: 1140 },
    { name: 'elevenlabs-v2', t: 7, c: 440 }, { name: 'azure-tts', t: 5, c: 700 },
  ],
  video: [
    { name: 'sora', t: 38, c: 140 }, { name: 'kling-1.5', t: 30, c: 290 }, { name: 'runway-gen3', t: 26, c: 330 },
    { name: 'luma-dream', t: 22, c: 240 }, { name: 'minimax-video', t: 28, c: 200 }, { name: 'pika-1.5', t: 18, c: 360 },
  ],
};
const buildGenSeries = (models, factor) => MODEL_DATES.map(date => {
  const row = { date };
  models.forEach(m => { row[m.name] = +(m.t * factor * (0.85 + Math.random() * 0.3)).toFixed(1); });
  return row;
});
const buildGenByModel = (models) => ({ p50: buildGenSeries(models, 0.7), p95: buildGenSeries(models, 1), p99: buildGenSeries(models, 1.5) });
const genByModel = { image: buildGenByModel(GEN_MODELS.image), audio: buildGenByModel(GEN_MODELS.audio), video: buildGenByModel(GEN_MODELS.video) };
const ALL_GEN_MODEL_NAMES = [...GEN_MODELS.image, ...GEN_MODELS.audio, ...GEN_MODELS.video].map(m => m.name);

// 多模态生成模型：模态映射 + 窗口内累计调用量（用于「多模态模型调用排行」）
const MM_MODALITY_META = {
  image: { label: '图像', color: MODAL_COLORS.image },
  audio: { label: '音频', color: MODAL_COLORS.audio },
  video: { label: '视频', color: MODAL_COLORS.video },
};
const MM_GEN_MODELS = ['image', 'audio', 'video'].flatMap(
  mod => GEN_MODELS[mod].map(m => ({ name: m.name, modality: mod, calls: m.c }))
);

const LINE_PALETTE = [COLORS.blue, COLORS.purple, COLORS.cyan, COLORS.orange, COLORS.green, COLORS.red];

// 取 Top N 模型 (按窗口内累计排序)，其余聚合为「其他」一条；avg 指标的「其他」取均值
const topNWithOther = (series, n = 5, agg = 'sum') => {
  const models = Object.keys(series[0]).filter(k => k !== 'date');
  const totals = models.map(m => [m, series.reduce((s, r) => s + r[m], 0)]).sort((a, b) => b[1] - a[1]);
  const top = totals.slice(0, n).map(t => t[0]);
  const rest = totals.slice(n).map(t => t[0]);
  const data = series.map(r => {
    const row = { date: r.date };
    top.forEach(m => { row[m] = r[m]; });
    if (rest.length) {
      const s = rest.reduce((a, m) => a + r[m], 0);
      row['其他'] = +(agg === 'avg' ? s / rest.length : s).toFixed(1);
    }
    return row;
  });
  return { data, keys: rest.length ? [...top, '其他'] : top };
};

const renderKeyedLines = (keys) => keys.map((k, i) => (
  <Line key={k} type="monotone" dataKey={k} name={k}
    stroke={k === '其他' ? COLORS.textLight : LINE_PALETTE[i % LINE_PALETTE.length]}
    strokeWidth={1.8} dot={false} activeDot={ACTIVE_DOT} />
));

// 各模型的缓存命中率 (mock 数据)
const MODEL_CACHE_HIT_RATES = {
  'gpt-4o-mini': '74.5%',
  'gpt-4o': '68.2%',
  'claude-3-haiku': '65.4%',
  'claude-3-5-sonnet': '70.1%',
  'gemini-1.5-flash': '62.8%',
  'qwen-max': '59.2%',
  'gemini-1.5-pro': '58.5%',
  'qwen-plus': '55.1%',
  'deepseek-v3': '66.3%',
  'llama-3.1-70b': '52.4%',
  'mistral-large': '54.2%',
  'glm-4': '48.9%',
};

// 指标卡片图表逻辑(hook)：返回 标题行展开图标 / 数值行切换控件 / 图表 / 弹窗
// 总览 ⇄ 按模型(Top5+其他) 切换 + 展开详情(全量弹窗) + 按筛选模型联动
const useBreakdown = ({ totalData, totalKey, totalName, totalColor, byModel, agg = 'sum', unit, yTickFormatter, modalTitle, valueFmt, controlExtra, pctColumnTitle = '占比', pctColumnRender }) => {
  const activeModels = useContext(FilterContext);
  const [mode, setMode] = useState('total');
  const [open, setOpen] = useState(false);

  const allModels = Object.keys(byModel[0]).filter(k => k !== 'date');
  const scoped = activeModels.filter(m => allModels.includes(m)); // 生效的模型筛选
  const singleModel = scoped.length === 1;
  const effMode = singleModel ? 'total' : mode; // 单模型筛选时"按模型"无意义，强制总览

  // 受筛选影响的"总览"数据：未筛选→全量聚合(传入)；筛选→由选中模型按 agg 再聚合
  const scopedTotalData = scoped.length === 0 ? totalData : byModel.map(r => {
    const s = scoped.reduce((a, m) => a + r[m], 0);
    return { date: r.date, _v: +(agg === 'avg' ? s / scoped.length : s).toFixed(1) };
  });
  const scopedTotalKey = scoped.length === 0 ? totalKey : '_v';
  const scopedTotalName = scoped.length === 0 ? totalName : (singleModel ? scoped[0] : `已选 ${scoped.length} 个模型合计`);

  // "按模型"数据：未筛选→Top5 + 其他；筛选→只画选中的模型
  const modelView = scoped.length === 0
    ? topNWithOther(byModel, 5, agg)
    : { data: byModel.map(r => { const row = { date: r.date }; scoped.forEach(m => { row[m] = r[m]; }); return row; }), keys: scoped };

  // 详情表：筛选时只列选中模型，否则全量
  const tableModels = scoped.length === 0 ? allModels : scoped;
  const aggVal = (m) => {
    const s = byModel.reduce((acc, r) => acc + r[m], 0);
    return agg === 'avg' ? s / byModel.length : s;
  };
  const tableRows = tableModels.map(m => ({ key: m, model: m, value: aggVal(m) })).sort((a, b) => b.value - a.value);
  const grandTotal = tableRows.reduce((s, r) => s + r.value, 0);
  const tableColumns = [
    { title: '排名', key: 'rank', width: 56, render: (_t, _r, i) => <span style={{ fontWeight: 600, color: i < 5 ? COLORS.orange : COLORS.textMain }}>{i + 1}</span> },
    { title: '模型', dataIndex: 'model', key: 'model', render: t => <span style={{ fontFamily: 'monospace', color: COLORS.blue }}>{t}</span> },
    { title: agg === 'avg' ? '平均值' : '累计值', dataIndex: 'value', key: 'value', align: 'right', sorter: (a, b) => a.value - b.value, defaultSortOrder: 'descend', render: v => valueFmt(v) },
    ...(agg === 'sum' ? [{ title: pctColumnTitle, key: 'pct', align: 'right', render: pctColumnRender || ((_t, r) => ((r.value / grandTotal) * 100).toFixed(1) + '%') }] : []),
  ];

  const extra = (
    <span onClick={() => setOpen(true)} title="展开详情"
      style={{ cursor: 'pointer', color: COLORS.textLight, fontSize: '15px', lineHeight: 1, display: 'inline-flex' }}>
      <FullscreenOutlined />
    </span>
  );

  const control = (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
      {controlExtra}
      {/* 文案式分段切换：总览 / 按模型，与「费用 / Token」切换保持一致的设计 */}
      <div style={{ display: 'flex', border: `1px solid ${COLORS.gray}`, borderRadius: '6px', overflow: 'hidden', fontSize: '12px' }}>
        {[['total', '总览'], ['model', '按模型']].map(([k, lbl]) => {
          const disabled = singleModel && k === 'model';
          const isActive = effMode === k;
          return (
            <ATooltip key={k} title={disabled ? '已按单个模型筛选，无需再拆分' : ''} placement="top">
              <span
                onClick={() => { if (!disabled) setMode(k); }}
                style={{
                  padding: '3px 10px',
                  cursor: disabled ? 'not-allowed' : 'pointer',
                  background: isActive ? COLORS.blue : '#fff',
                  color: disabled ? '#cbd5e1' : (isActive ? '#fff' : '#64748b'),
                  whiteSpace: 'nowrap',
                  transition: 'all 0.2s'
                }}>
                {lbl}
              </span>
            </ATooltip>
          );
        })}
      </div>
    </div>
  );

  const chart = (
    <>
      {scoped.length > 0 && (
        <div style={{ position: 'absolute', top: '6px', left: '24px', fontSize: '12px', color: COLORS.textLight, zIndex: 5 }}>
          范围: <b style={{ color: COLORS.textMain }}>{singleModel ? scoped[0] : scoped.length + ' 个模型'}</b>
        </div>
      )}
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={effMode === 'model' ? modelView.data : scopedTotalData} margin={{ top: 20, right: 10, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
          <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: COLORS.textLight, fontSize: 11 }} dy={10} ticks={AXIS_END_TICKS} interval={0} />
          <YAxis axisLine={false} tickLine={false} tick={{ fill: COLORS.textLight, fontSize: 11 }} tickCount={2} tickFormatter={yTickFormatter} />
          <Tooltip content={<CustomTooltip unit={unit} />} cursor={CROSSHAIR} />
          {effMode === 'model' && <Legend iconType="circle" wrapperStyle={{ fontSize: '12px' }} />}
          {effMode === 'model'
            ? renderKeyedLines(modelView.keys)
            : <Line type="monotone" dataKey={scopedTotalKey} name={scopedTotalName} stroke={totalColor} strokeWidth={2} dot={false} activeDot={ACTIVE_DOT} />}
        </LineChart>
      </ResponsiveContainer>
    </>
  );

  const modal = (
    <Modal open={open} onCancel={() => setOpen(false)} footer={null} width={920} title={modalTitle}>
      <div style={{ fontSize: '12px', color: COLORS.textLight, margin: '4px 0 12px' }}>
        {scoped.length === 0
          ? <>图表为 Top 5 模型 + 其他聚合；下表为全部 {tableRows.length} 个模型（{agg === 'avg' ? '窗口内平均' : '窗口内累计'}，可点表头排序）。</>
          : <>已按筛选锁定 {tableRows.length} 个模型（{agg === 'avg' ? '窗口内平均' : '窗口内累计'}）。</>}
      </div>
      <div style={{ height: '280px', marginBottom: '16px' }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={modelView.data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: COLORS.textLight, fontSize: 11 }} dy={10} ticks={AXIS_END_TICKS} interval={0} />
            <YAxis axisLine={false} tickLine={false} tick={{ fill: COLORS.textLight, fontSize: 11 }} tickCount={2} tickFormatter={yTickFormatter} />
            <Tooltip content={<CustomTooltip unit={unit} />} cursor={CROSSHAIR} />
            <Legend iconType="circle" wrapperStyle={{ fontSize: '12px' }} />
            {renderKeyedLines(modelView.keys)}
          </LineChart>
        </ResponsiveContainer>
      </div>
      <Table columns={tableColumns} dataSource={tableRows} pagination={false} rowKey="key" size="small" scroll={{ y: 240 }} />
    </Modal>
  );

  return { extra, control, chart, modal };
};

// --- MAIN APP COMPONENT ---
// 时间筛选 -> 卡片副标题文案 (mock: 真实环境按所选窗口的起止日期动态生成)
const RANGE_LABELS = {
  '1h': '数据来自最近1小时',
  '24h': '数据来自最近24小时',
  '3d': '数据来自最近3天',
  '7d': '数据来自 05月26日 至 06月01日',
  '30d': '数据来自 05月03日 至 06月01日',
  'custom': '数据来自自定义范围',
};

// 全局筛选维度 (参考 Portkey, 新增 Resource)。可叠加, 一次加一个
const FILTER_DIMENSIONS = [
  { key: 'model', label: 'Model' },
  { key: 'user', label: 'User' },
  { key: 'apiKey', label: 'API Key' },
  { key: 'provider', label: 'Provider' },
];

// 各维度的可选值：预设项走「可搜索下拉」，取代原来的手动输入 (方案 A)
const FILTER_VALUE_OPTIONS = {
  model: [...ALL_MODELS.map(m => m.name), ...ALL_GEN_MODEL_NAMES],
  provider: ['OpenAI', 'Anthropic', 'Google', '通义千问', 'Meta (Groq)'],
  apiKey: ['sk-...a1b2', 'sk-...a1f9', 'sk-...c3d4', 'sk-...e5f6', 'sk-...k1l2', 'sk-...g7h8', 'sk-...i9j0', 'sk-...m2n4', 'sk-...p5q6', 'sk-...r7s8', 'sk-...t9u0'],
  user: ['usr_rd_01', 'usr_rd_07', 'usr_mkt_05', 'usr_ops_12', 'usr_hr_02', 'usr_fin_03', 'usr_dsn_08', 'usr_dat_11'],
  status: ['200 成功', '429 限流', '500 服务端', '401 鉴权'],
  cache: ['命中', '未命中'],
  resource: ['Desk · GPU 型', 'Desk · 标准型', 'Desk · 高内存型'],
};

// 可叠加筛选：选维度 -> 选/填值 -> 加为 chip。预设维度走可搜索下拉，开放维度回退文本输入
const FilterBar = ({ filters, setFilters }) => {
  const [draftDim, setDraftDim] = useState('');
  const [draftVal, setDraftVal] = useState('');

  const commit = (val) => {
    const v = (val ?? draftVal).toString().trim();
    if (!draftDim || !v) return;
    const label = FILTER_DIMENSIONS.find(d => d.key === draftDim)?.label || draftDim;
    setFilters(prev => [...prev, { id: Date.now(), key: draftDim, label, value: v }]);
    setDraftDim('');
    setDraftVal('');
  };
  const removeFilter = (id) => setFilters(filters.filter(f => f.id !== id));

  // 已选维度不再重复出现在下拉里；model 允许多选 (可叠加多个模型做对比)
  const available = FILTER_DIMENSIONS.filter(d => d.key === 'model' || !filters.some(f => f.key === d.key));
  const dimLabel = FILTER_DIMENSIONS.find(d => d.key === draftDim)?.label;
  const usedVals = filters.filter(f => f.key === draftDim).map(f => f.value);
  const presetVals = FILTER_VALUE_OPTIONS[draftDim];
  const valueOptions = presetVals ? presetVals.filter(v => !usedVals.includes(v)) : undefined;

  return (
    <div className="search-input-wrapper" style={{ flexWrap: 'wrap', gap: '6px' }}>
      <SearchOutlined style={{ color: '#94a3b8' }} />
      {filters.map(f => (
        <span key={f.id} style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '4px', padding: '2px 8px', fontSize: '13px', color: '#1e293b' }}>
          <span style={{ color: '#64748b' }}>{f.label}:</span> {f.value}
          <span onClick={() => removeFilter(f.id)} style={{ cursor: 'pointer', color: '#94a3b8', marginLeft: '2px', fontWeight: 600 }}>×</span>
        </span>
      ))}
      {/* 1) 选维度 */}
      <Select
        size="small"
        variant="borderless"
        placeholder="+ 添加筛选"
        value={draftDim || undefined}
        onChange={(v) => { setDraftDim(v); setDraftVal(''); }}
        options={available.map(d => ({ value: d.key, label: d.label }))}
        style={{ minWidth: 104 }}
        popupMatchSelectWidth={false}
      />
      {/* 2) 选值：预设维度走可搜索下拉；开放维度回退文本输入 */}
      {draftDim && (valueOptions ? (
        <Select
          size="small"
          showSearch
          autoFocus
          defaultOpen
          placeholder={`选择 ${dimLabel}`}
          options={valueOptions.map(v => ({ value: v, label: v }))}
          onChange={(v) => commit(v)}
          style={{ minWidth: 180 }}
          popupMatchSelectWidth={false}
          filterOption={(input, opt) => opt.label.toLowerCase().includes(input.toLowerCase())}
        />
      ) : (
        <input
          type="text"
          autoFocus
          value={draftVal}
          onChange={e => setDraftVal(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && commit()}
          onBlur={() => commit()}
          placeholder={`输入 ${dimLabel} 值，回车添加`}
          style={{ border: 'none', outline: 'none', fontSize: '14px', color: '#1e293b', flex: 1, minWidth: '160px' }}
        />
      ))}
    </div>
  );
};

const App = () => {
  // tab / 时间窗口默认保留：从 localStorage 恢复，手动刷新不会重置选中的 tab
  const [activeTab, setActiveTab] = useState(() => localStorage.getItem('ob_activeTab') || 'overview');
  const [timeRange, setTimeRange] = useState(() => localStorage.getItem('ob_timeRange') || '30d');
  const [customRange, setCustomRange] = useState(() => {
    const stored = localStorage.getItem('ob_customRange');
    if (stored) {
      try {
        const arr = JSON.parse(stored);
        return [dayjs(arr[0]), dayjs(arr[1])];
      } catch {
        return null;
      }
    }
    return null;
  });
  const rangeLabel = timeRange === 'custom' && customRange && customRange[0] && customRange[1]
    ? `数据来自 ${customRange[0].format('YYYY年MM月DD日 HH:mm')} 至 ${customRange[1].format('YYYY年MM月DD日 HH:mm')}`
    : (RANGE_LABELS[timeRange] || '数据来自 05月03日 至 06月01日');

  useEffect(() => { localStorage.setItem('ob_activeTab', activeTab); }, [activeTab]);
  useEffect(() => { localStorage.setItem('ob_timeRange', timeRange); }, [timeRange]);
  useEffect(() => {
    if (customRange && customRange[0] && customRange[1]) {
      localStorage.setItem('ob_customRange', JSON.stringify([
        customRange[0].format('YYYY-MM-DD HH:mm'),
        customRange[1].format('YYYY-MM-DD HH:mm')
      ]));
    } else {
      localStorage.removeItem('ob_customRange');
    }
  }, [customRange]);

  // 全局筛选条件 (lifted)；其中 model 维度驱动各指标卡的「按模型」联动
  const [filters, setFilters] = useState([]);
  const activeModels = [...new Set(filters.filter(f => f.key === 'model').map(f => f.value))];

  // 组件更新提醒：有新版本时提示用户，且不会覆盖用户的自定义排版
  const [showUpdateNotice, setShowUpdateNotice] = useState(true);

  const [collapsedGroups, setCollapsedGroups] = useState({
    apiRouter: false,
    userCenter: true,
    billing: true,
    desk: true,
  });
  const [activeMenu, setActiveMenu] = useState('dashboard');

  const toggleGroup = (key) => {
    setCollapsedGroups(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const getMenuLabel = (key) => {
    const mapping = {
      api_overview: 'API Router > 总览',
      api_keys: 'API Router > API 密钥',
      api_logs: 'API Router > 调用记录',
      user_list: '用户中心 > 用户列表',
      user_dept: '用户中心 > 部门管理',
      billing_overview: '费用 > 账单总览',
      billing_deposit: '费用 > 充值记录',
      desk_list: '云电脑管理 > 桌面列表',
      desk_policy: '云电脑管理 > 策略模板',
      dashboard: '仪表盘',
      org_info: '组织信息',
    };
    return mapping[key] || key;
  };

  const renderActiveView = () => {
    switch (activeTab) {
      case 'overview': return <OverviewView />;
      case 'cost': return <CostView />;
      case 'cache': return <CacheView />;
      case 'errors': return <ErrorsView />;
      case 'latency': return <LatencyView />;
      case 'multimodal': return <MultimodalView />;
      default: return <CostView />;
    }
  };

  const renderContent = () => {
    if (activeMenu === 'dashboard') {
      return (
        <div className="analytics-container">
          {showUpdateNotice && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: '10px',
              background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '8px',
              padding: '10px 14px', marginBottom: '16px', fontSize: '13px', color: '#1e293b'
            }}>
              <InfoCircleOutlined style={{ color: '#1677ff' }} />
              <span>仪表盘组件有新版本可用，更新不会改动您的自定义排版。</span>
              <a href="#" onClick={(e) => { e.preventDefault(); setShowUpdateNotice(false); }}
                style={{ marginLeft: 'auto', color: '#1677ff', fontWeight: 600 }}>查看更新</a>
              <span onClick={() => setShowUpdateNotice(false)}
                style={{ cursor: 'pointer', color: '#94a3b8', fontWeight: 600 }}>×</span>
            </div>
          )}
          <header className="page-header">
            <h1 className="page-title">仪表盘</h1>

            <div className="nav-tabs" style={{ overflowX: 'auto', paddingBottom: '2px' }}>
              <div className={`nav-tab ${activeTab === 'overview' ? 'active' : ''}`} onClick={() => setActiveTab('overview')}><AppstoreOutlined /> 总览</div>
              <div className={`nav-tab ${activeTab === 'cost' ? 'active' : ''}`} onClick={() => setActiveTab('cost')}><CreditCardOutlined /> 消耗分析</div>
              <div className={`nav-tab ${activeTab === 'cache' ? 'active' : ''}`} onClick={() => setActiveTab('cache')}><ThunderboltOutlined /> 缓存命中</div>
              <div className={`nav-tab ${activeTab === 'errors' ? 'active' : ''}`} onClick={() => setActiveTab('errors')}><WarningOutlined /> 报错分析</div>
              <div className={`nav-tab ${activeTab === 'latency' ? 'active' : ''}`} onClick={() => setActiveTab('latency')}><DashboardOutlined /> 延迟分析</div>
              <div className={`nav-tab ${activeTab === 'multimodal' ? 'active' : ''}`} onClick={() => setActiveTab('multimodal')}><PlaySquareOutlined /> 多媒体模型</div>
            </div>
          </header>

          <main className="main-content">
            <div className="filters-bar">
              <button style={{ background: '#fff', border: '1px solid #e2e8f0', padding: '6px 10px', borderRadius: '6px', cursor: 'pointer', color: '#10b981' }}>
                <SyncOutlined />
              </button>
              <FilterBar filters={filters} setFilters={setFilters} />
              <TimeFilter selected={timeRange} setSelected={setTimeRange} customRange={customRange} setCustomRange={setCustomRange} />
            </div>
            {renderActiveView()}
          </main>
        </div>
      );
    } else {
      return (
        <div style={{ padding: '80px 40px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#64748b' }}>
          <AppstoreOutlined style={{ fontSize: '48px', marginBottom: '16px', color: '#cbd5e1' }} />
          <h3 style={{ color: '#1e293b', marginBottom: '8px', fontSize: '18px', fontWeight: 600 }}>该模块正在开发中</h3>
          <p style={{ fontSize: '14px' }}>您选中的是「{getMenuLabel(activeMenu)}」模块的原型占位页面。</p>
        </div>
      );
    }
  };

  return (
    <TimeRangeContext.Provider value={rangeLabel}>
      <FilterContext.Provider value={activeModels}>
      <FiltersContext.Provider value={filters}>
      <div className="layout-shell">
        {/* Sidebar */}
        <aside className="layout-sidebar">
          <div className="sidebar-brand">
            <div className="brand-icon">O</div>
            <div className="brand-name">
              <span style={{ color: '#1e293b', fontWeight: 800 }}>OneLink</span>
              <span style={{ color: '#1677ff', fontWeight: 800 }}>AI</span>
            </div>
          </div>
          <nav className="sidebar-menu">
            {/* 仪表盘 (一级菜单, 置顶) */}
            <div className="menu-group">
              <div className={`menu-group-header ${activeMenu === 'dashboard' ? 'active' : ''}`} onClick={() => setActiveMenu('dashboard')}>
                <div className="menu-group-title-wrapper">
                  <DashboardOutlined style={{ fontSize: '15px' }} />
                  <span>仪表盘</span>
                </div>
              </div>
            </div>

            {/* API Router Group */}
            <div className="menu-group">
              <div className={`menu-group-header ${activeMenu.startsWith('api_') ? 'active' : ''}`} onClick={() => toggleGroup('apiRouter')}>
                <div className="menu-group-title-wrapper">
                  <GlobalOutlined style={{ fontSize: '15px' }} />
                  <span>API Router</span>
                </div>
                {collapsedGroups.apiRouter ? <RightOutlined style={{ fontSize: '10px' }} /> : <DownOutlined style={{ fontSize: '10px' }} />}
              </div>
              {!collapsedGroups.apiRouter && (
                <div className="menu-group-items">
                  <div className={`menu-sub-item ${activeMenu === 'api_overview' ? 'active' : ''}`} onClick={() => setActiveMenu('api_overview')}>总览</div>
                  <div className={`menu-sub-item ${activeMenu === 'api_keys' ? 'active' : ''}`} onClick={() => setActiveMenu('api_keys')}>API 密钥</div>
                  <div className={`menu-sub-item ${activeMenu === 'api_logs' ? 'active' : ''}`} onClick={() => setActiveMenu('api_logs')}>调用记录</div>
                </div>
              )}
            </div>

            {/* 用户中心 Group */}
            <div className="menu-group">
              <div className={`menu-group-header ${activeMenu.startsWith('user_') ? 'active' : ''}`} onClick={() => toggleGroup('userCenter')}>
                <div className="menu-group-title-wrapper">
                  <UserOutlined style={{ fontSize: '15px' }} />
                  <span>用户中心</span>
                </div>
                {collapsedGroups.userCenter ? <RightOutlined style={{ fontSize: '10px' }} /> : <DownOutlined style={{ fontSize: '10px' }} />}
              </div>
              {!collapsedGroups.userCenter && (
                <div className="menu-group-items">
                  <div className={`menu-sub-item ${activeMenu === 'user_list' ? 'active' : ''}`} onClick={() => setActiveMenu('user_list')}>用户列表</div>
                  <div className={`menu-sub-item ${activeMenu === 'user_dept' ? 'active' : ''}`} onClick={() => setActiveMenu('user_dept')}>部门管理</div>
                </div>
              )}
            </div>

            {/* 费用 Group */}
            <div className="menu-group">
              <div className={`menu-group-header ${activeMenu.startsWith('billing_') ? 'active' : ''}`} onClick={() => toggleGroup('billing')}>
                <div className="menu-group-title-wrapper">
                  <CreditCardOutlined style={{ fontSize: '15px' }} />
                  <span>费用</span>
                </div>
                {collapsedGroups.billing ? <RightOutlined style={{ fontSize: '10px' }} /> : <DownOutlined style={{ fontSize: '10px' }} />}
              </div>
              {!collapsedGroups.billing && (
                <div className="menu-group-items">
                  <div className={`menu-sub-item ${activeMenu === 'billing_overview' ? 'active' : ''}`} onClick={() => setActiveMenu('billing_overview')}>账单总览</div>
                  <div className={`menu-sub-item ${activeMenu === 'billing_deposit' ? 'active' : ''}`} onClick={() => setActiveMenu('billing_deposit')}>充值记录</div>
                </div>
              )}
            </div>

            {/* 云电脑管理 Group */}
            <div className="menu-group">
              <div className={`menu-group-header ${activeMenu.startsWith('desk_') ? 'active' : ''}`} onClick={() => toggleGroup('desk')}>
                <div className="menu-group-title-wrapper">
                  <DesktopOutlined style={{ fontSize: '15px' }} />
                  <span>云电脑管理</span>
                </div>
                {collapsedGroups.desk ? <RightOutlined style={{ fontSize: '10px' }} /> : <DownOutlined style={{ fontSize: '10px' }} />}
              </div>
              {!collapsedGroups.desk && (
                <div className="menu-group-items">
                  <div className={`menu-sub-item ${activeMenu === 'desk_list' ? 'active' : ''}`} onClick={() => setActiveMenu('desk_list')}>桌面列表</div>
                  <div className={`menu-sub-item ${activeMenu === 'desk_policy' ? 'active' : ''}`} onClick={() => setActiveMenu('desk_policy')}>策略模板</div>
                </div>
              )}
            </div>

            {/* 组织信息 */}
            <div className="menu-group">
              <div className={`menu-group-header ${activeMenu === 'org_info' ? 'active' : ''}`} onClick={() => setActiveMenu('org_info')}>
                <div className="menu-group-title-wrapper">
                  <InfoCircleOutlined style={{ fontSize: '15px' }} />
                  <span>组织信息</span>
                </div>
              </div>
            </div>
          </nav>
        </aside>

        {/* Main Section */}
        <div className="layout-main">
          {/* Header */}
          <header className="layout-header">
            <div className="header-nav">
              <a href="#" className="header-nav-item">模型广场</a>
              <a href="#" className="header-nav-item">聊天</a>
              <a href="#" className="header-nav-item">文档</a>
              <a href="#" className="header-nav-item">推荐计划</a>
              <a href="#" className="header-nav-item">GPU比价</a>
              <a href="#" className="header-nav-item">OLA Studio</a>
              <a href="#" className="header-nav-item">OLA Cloud</a>
            </div>
            <div className="header-user-dropdown">
              <span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#52c41a' }}></span>
              <span style={{ fontWeight: 500, color: '#334155' }}>我的企业</span>
              <DownOutlined style={{ fontSize: '10px', color: '#64748b' }} />
            </div>
          </header>

          {/* Body Content */}
          <div className="layout-body">
            {renderContent()}
          </div>
        </div>
      </div>
      </FiltersContext.Provider>
      </FilterContext.Provider>
    </TimeRangeContext.Provider>
  );
};

export default App;
