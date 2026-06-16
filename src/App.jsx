import { useState, createContext, useContext } from 'react';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import { ThunderboltOutlined, WarningOutlined, SafetyCertificateOutlined,
  DashboardOutlined, PlaySquareOutlined, DesktopOutlined,
  SyncOutlined, SearchOutlined, CalendarOutlined, DownOutlined,
  AppstoreOutlined, RightOutlined,
  CreditCardOutlined, UserOutlined, InfoCircleOutlined, GlobalOutlined } from '@ant-design/icons';
import { Card, Table, Tag, Tooltip as ATooltip } from 'antd';

// --- 格式化工具 ---
const rand = (min, max) => Math.floor(Math.random() * (max - min)) + min;
// 人民币金额：¥ 前缀 + 千分位 + 两位小数
const fmtCNY = (n) => '¥' + Number(n).toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
// Token 大数字按百万 (M) 计：不足 1M 也展示两位小数
const fmtM = (n) => (n / 1_000_000).toFixed(2) + 'M';

// --- MOCK DATA ---

const generateTimeSeries = () => {
  const dates = ['03 May', '08 May', '13 May', '18 May', '23 May', '28 May', '01 Jun'];
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
  }));
};

const dailyData = generateTimeSeries();

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

// --- 消耗分析: 消耗排行 (支持按 API Key 或 用户 排序) ---
const consumeRankData = [
  { key: 'k1', apiKey: 'sk-...a1b2', user: 'usr_rd_01', tokens: 42_800_000, media: '1,280', cost: 3420.50 },
  { key: 'k2', apiKey: 'sk-...c3d4', user: 'usr_rd_07', tokens: 31_200_000, media: '860', cost: 2510.80 },
  { key: 'k3', apiKey: 'sk-...e5f6', user: 'usr_mkt_05', tokens: 18_600_000, media: '2,140', cost: 1980.20 },
  { key: 'k4', apiKey: 'sk-...g7h8', user: 'usr_ops_12', tokens: 12_100_000, media: '320', cost: 920.60 },
  { key: 'k5', apiKey: 'sk-...i9j0', user: 'usr_hr_02', tokens: 6_400_000, media: '95', cost: 480.40 },
];


// --- Desk: 使用明细 (持久专属, 找闲置与重度用户) ---
// --- Desk: 使用明细 (持久专属, 找低利用率/未释放桌面). status 对接系统真实状态 ---
// status: running 运行中 / stopped 已关机 / released 已释放
const deskDetailData = [
  { id: 'desk_rd_001', user: 'usr_rd_01', spec: 'GPU 型', hours: '186 h', util: '82%', status: 'running' },
  { id: 'desk_rd_007', user: 'usr_rd_07', spec: 'GPU 型', hours: '142 h', util: '63%', status: 'running' },
  { id: 'desk_mkt_03', user: 'usr_mkt_05', spec: '标准型', hours: '98 h', util: '44%', status: 'running' },
  { id: 'desk_ops_11', user: 'usr_ops_12', spec: '高内存型', hours: '12 h', util: '6%', status: 'stopped' },
  { id: 'desk_hr_004', user: 'usr_hr_02', spec: '标准型', hours: '0 h', util: '0%', status: 'released' },
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

// OpenRouter 风格：鼠标跟随的垂直参考线 (细实线) 与折线高亮圆点
const CROSSHAIR = { stroke: '#cbd5e1', strokeWidth: 1 };
const ACTIVE_DOT = { r: 4, strokeWidth: 2, stroke: '#fff' };

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

const XCard = ({ title, value, subtitle, tip, models, children }) => {
  const rangeLabel = useContext(TimeRangeContext);
  const hasHint = tip || models;
  const hintContent = hasHint ? (
    <div style={{ fontSize: '12px', lineHeight: 1.6, maxWidth: '260px' }}>
      {tip && <div style={{ marginBottom: models ? '6px' : 0 }}>{tip}</div>}
      {models && (
        <div style={{ color: '#94a3b8' }}>
          <span style={{ color: '#64748b' }}>涉及模型：</span>{models}
        </div>
      )}
    </div>
  ) : null;
  return (
    <div className="portkey-card">
      <div className="card-header">
        <div className="card-title">
          {hasHint ? (
            <ATooltip title={hintContent} placement="top">
              <span className="card-title-hint">{title}</span>
            </ATooltip>
          ) : (
            <span>{title}</span>
          )}
        </div>
        <div className="card-value">{value}</div>
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
  { label: 'Last 15 minutes', value: '15m' },
  { label: 'Last hour', value: '1h' },
  { label: 'Last 24 hours', value: '24h' },
  { label: 'Yesterday', value: 'yesterday' },
  { label: 'Last 3 days', value: '3d' },
  { label: 'Last 7 days', value: '7d' },
  { label: 'Last 14 days', value: '14d' },
  { label: 'Last 30 days', value: '30d' },
  { label: 'Last 90 days', value: '90d' },
  { label: 'Custom', value: 'custom' },
];

const TimeFilter = ({ selected, setSelected }) => (
  <div className="date-filter" style={{ cursor: 'pointer' }}>
    <CalendarOutlined style={{ color: '#64748b' }} />
    <select
      value={selected}
      onChange={e => setSelected(e.target.value)}
      style={{ border: 'none', background: 'transparent', fontSize: '14px', color: COLORS.textMain, marginLeft: '4px' }}
    >
      {timeOptions.map(opt => (
        <option key={opt.value} value={opt.value}>{opt.label}</option>
      ))}
    </select>
    <DownOutlined style={{ fontSize: '10px', marginLeft: '4px', color: COLORS.textLight }} />
  </div>
);


// --- 0. Cost / Spend Analytics (消耗分析) ---
// 账户额度 KPI 卡片 (模块级, 供消耗分析复用)
const KpiCard = ({ label, value, icon, color, hint }) => {
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
      <div style={{ fontSize: '12px', color: COLORS.textLight, marginTop: '4px' }}>{rangeLabel}</div>
    </div>
  );
};

const CostView = () => {
  const [provMetric, setProvMetric] = useState('cost'); // cost | tokens
  const [modelMetric, setModelMetric] = useState('cost');
  const [rankSort, setRankSort] = useState('cost'); // cost | apiKey | user

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

  // 消耗排行排序
  const rankData = [...consumeRankData].sort((a, b) => {
    if (rankSort === 'apiKey') return a.apiKey.localeCompare(b.apiKey);
    if (rankSort === 'user') return a.user.localeCompare(b.user);
    return b.cost - a.cost;
  });

  const rankColumns = [
    { title: '排名', key: 'rank', width: 60, render: (_t, _r, i) => <span style={{ fontWeight: 600, color: i < 3 ? COLORS.orange : COLORS.textMain }}>{i + 1}</span> },
    {
      title: 'API Key', dataIndex: 'apiKey', key: 'apiKey',
      sorter: (a, b) => a.apiKey.localeCompare(b.apiKey),
      render: t => <span style={{ fontFamily: 'monospace', color: COLORS.blue }}>{t}</span>,
    },
    {
      title: '用户', dataIndex: 'user', key: 'user',
      sorter: (a, b) => a.user.localeCompare(b.user),
    },
    { title: 'Token', dataIndex: 'tokens', key: 'tokens', render: t => fmtM(t) },
    { title: '音视图', dataIndex: 'media', key: 'media' },
    { title: '费用', dataIndex: 'cost', key: 'cost', render: t => <span style={{ color: COLORS.green, fontWeight: 600 }}>{fmtCNY(t)}</span> },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* 账户额度 KPI 行 */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '24px' }}>
        <KpiCard label="可用额度" value={fmtCNY(available)} color={COLORS.green}
          icon={<CreditCardOutlined style={{ fontSize: '20px', color: COLORS.green }} />}
          hint="可用额度 = 累计充值 + 赠金 − 累计消费，反映当前账户可继续消费的余额。" />
        <KpiCard label="累计充值" value={fmtCNY(cumRecharge)} color={COLORS.textMain}
          icon={<ThunderboltOutlined style={{ fontSize: '20px', color: COLORS.blue }} />}
          hint="账户开通以来通过付费充值累计到账的金额，不含赠金。" />
        <KpiCard label="累计消费" value={fmtCNY(cumConsume)} color={COLORS.textMain}
          icon={<DashboardOutlined style={{ fontSize: '20px', color: COLORS.purple }} />}
          hint="账户开通以来在全部模型与服务上累计扣费的金额。" />
        <KpiCard label="赠金" value={fmtCNY(bonus)} color={COLORS.orange}
          icon={<SafetyCertificateOutlined style={{ fontSize: '20px', color: COLORS.orange }} />}
          hint="平台赠送的代金额度，优先于充值余额抵扣消费。" />
      </div>

      {/* 消耗概览：请求数 / 总Token(输入·缓存·输出) / 图片生成(成功·失败) / 视频生成(成功·失败) —— 对齐 OneLink 总览 */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '24px' }}>
        {/* 请求数 */}
        <div className="portkey-card overview-stat">
          <div className="overview-stat-head">
            <span className="overview-stat-label">请求数</span>
            <span className="overview-stat-value">{totalReq.toLocaleString()}</span>
          </div>
        </div>
        {/* 总 Token */}
        <div className="portkey-card overview-stat">
          <div className="overview-stat-head">
            <ATooltip title={<div style={{ fontSize: '12px', lineHeight: 1.6 }}>所选时间窗口内的 Token 消耗总量,拆分为输入、缓存、输出三部分。<div style={{ color: '#94a3b8', marginTop: '6px' }}>涉及模型：文本 + 多模态全部模型</div></div>} placement="top">
              <span className="overview-stat-label card-title-hint">总 token</span>
            </ATooltip>
            <span className="overview-stat-value">{fmtM(totalToken)}</span>
          </div>
          <div className="overview-sub-row">
            <div className="overview-sub"><span>输入</span><b>{fmtM(totalInput)}</b></div>
            <div className="overview-sub"><span>缓存</span><b>{fmtM(totalCache)}</b></div>
            <div className="overview-sub"><span>输出</span><b>{fmtM(totalOutput)}</b></div>
          </div>
        </div>
        {/* 图片生成 */}
        <div className="portkey-card overview-stat">
          <div className="overview-stat-head">
            <ATooltip title={<div style={{ fontSize: '12px', lineHeight: 1.6 }}>所选时间窗口内的图片生成任务数,拆分为成功与失败。<div style={{ color: '#94a3b8', marginTop: '6px' }}>涉及模型：图像生成模型(文生图/图生图)</div></div>} placement="top">
              <span className="overview-stat-label card-title-hint">图片生成</span>
            </ATooltip>
            <span className="overview-stat-value">{totalImg.toLocaleString()}</span>
          </div>
          <div className="overview-sub-row">
            <div className="overview-sub"><span>成功</span><b>{imgSuccess.toLocaleString()}</b></div>
            <div className="overview-sub"><span>失败</span><b style={{ color: imgFailed ? COLORS.red : undefined }}>{imgFailed}</b></div>
          </div>
        </div>
        {/* 视频生成 */}
        <div className="portkey-card overview-stat">
          <div className="overview-stat-head">
            <ATooltip title={<div style={{ fontSize: '12px', lineHeight: 1.6 }}>所选时间窗口内的视频生成任务数,拆分为成功与失败。<div style={{ color: '#94a3b8', marginTop: '6px' }}>涉及模型：视频生成模型(文生视频/视频理解)</div></div>} placement="top">
              <span className="overview-stat-label card-title-hint">视频生成</span>
            </ATooltip>
            <span className="overview-stat-value">{totalVideo.toLocaleString()}</span>
          </div>
          <div className="overview-sub-row">
            <div className="overview-sub"><span>成功</span><b>{videoSuccess.toLocaleString()}</b></div>
            <div className="overview-sub"><span>失败</span><b style={{ color: videoFailed ? COLORS.red : undefined }}>{videoFailed}</b></div>
          </div>
        </div>
      </div>

      {/* 用量汇总 + 消费汇总 */}
      <div className="dashboard-grid">
        <XCard title="用量汇总" value={fmtM(totalToken)} subtitle="时间段内 Token 用量走势 (输入/缓存/输出)"
          tip="按时间展示 Token 用量,堆叠呈现输入、缓存、输出三类 Token 的消耗量。"
          models="文本 + 多模态(图像/音频/视频)全部模型">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={dailyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: COLORS.textLight, fontSize: 11 }} dy={10} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: COLORS.textLight, fontSize: 11 }} tickCount={5} tickFormatter={v => (v / 1_000_000).toFixed(0) + 'M'} />
              <Tooltip content={<CustomTooltip unit=" 个" />} cursor={{ fill: '#f1f5f9' }} />
              <Legend iconType="circle" wrapperStyle={{ fontSize: '12px' }} />
              <Bar dataKey="inputTokens" name="输入" stackId="t" fill={COLORS.blue} maxBarSize={30} />
              <Bar dataKey="cacheTokens" name="缓存" stackId="t" fill={COLORS.cyan} maxBarSize={30} />
              <Bar dataKey="outputTokens" name="输出" stackId="t" fill={COLORS.purple} maxBarSize={30} radius={[2, 2, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </XCard>

        <XCard title="消费汇总" value={fmtCNY(totalSpend)} subtitle="时间段内消费金额走势"
          tip="按时间展示账户消费金额走势,反映各日实际扣费情况。"
          models="文本 + 多模态(图像/音频/视频)全部模型">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={dailyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorSpend" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={COLORS.green} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={COLORS.green} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: COLORS.textLight, fontSize: 11 }} dy={10} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: COLORS.textLight, fontSize: 11 }} tickCount={5} tickFormatter={v => '¥' + v} />
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
          tip="所选时间窗口内消耗按上游服务商归因,可在费用与 Token 维度间切换。"
          models="文本 + 多模态全部模型,按服务商聚合" />
        <DistributionCard
          title="按模型分布" metric={modelMetric} setMetric={setModelMetric} data={modelData}
          tip="所选时间窗口内消耗按具体模型归因,可在费用与 Token 维度间切换。"
          models="文本 + 多模态全部模型,按模型聚合" />
      </div>

      {/* 消耗排行 */}
      <Card
        title={
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <ATooltip title={<div style={{ fontSize: '12px', lineHeight: 1.6 }}>按消耗费用对 API Key / 用户排名,可点击表头或下方按钮按 API Key、用户排序。<div style={{ color: '#94a3b8', marginTop: '6px' }}>涉及模型：文本 + 多模态全部模型</div></div>} placement="top">
              <span className="card-title-hint">消耗排行</span>
            </ATooltip>
            <div style={{ display: 'flex', gap: '8px', fontSize: '13px', fontWeight: 400 }}>
              <span style={{ color: COLORS.textLight }}>排序:</span>
              {[['cost', '费用'], ['apiKey', 'API Key'], ['user', '用户']].map(([k, lbl]) => (
                <span key={k} onClick={() => setRankSort(k)}
                  style={{ cursor: 'pointer', color: rankSort === k ? COLORS.blue : COLORS.textMuted, fontWeight: rankSort === k ? 600 : 400 }}>
                  {lbl}
                </span>
              ))}
            </div>
          </div>
        }
        className="portkey-card" style={{ height: 'auto', padding: 0 }}>
        <div className="card-body" style={{ padding: '12px 24px 24px 24px' }}>
          <Table columns={rankColumns} dataSource={rankData} pagination={false} rowKey="key" size="small" />
        </div>
      </Card>
    </div>
  );
};

// 分布卡片：服务商/模型通用,支持费用(¥)/Token 切换
const DistributionCard = ({ title, metric, setMetric, data, tip, models }) => {
  const rangeLabel = useContext(TimeRangeContext);
  const total = data.reduce((s, d) => s + d[metric], 0);
  const fmtVal = (v) => metric === 'cost' ? fmtCNY(v) : fmtM(v);
  return (
    <div className="portkey-card">
      <div className="card-header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div className="card-title">
            <ATooltip title={<div style={{ fontSize: '12px', lineHeight: 1.6, maxWidth: '260px' }}>{tip}<div style={{ color: '#94a3b8', marginTop: '6px' }}>涉及模型：{models}</div></div>} placement="top">
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
const CacheView = () => {
  const chartData = dailyData.map(d => ({
    ...d,
    cacheHits: d.simpleHits + d.semanticHits
  }));
  const totalHits = chartData.reduce((s, d) => s + d.cacheHits, 0);
  const totalHitTokens = dailyData.reduce((s, d) => s + d.cacheHitTokens, 0);
  return (
    <div className="dashboard-grid">
      <XCard title="缓存命中次数" value={totalHits.toLocaleString()}
        tip="所选时间窗口内命中缓存(精确匹配 + 语义匹配)的请求次数,命中越多越能降低重复推理成本。"
        models="文本模型(命中缓存的对话/补全请求)">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: COLORS.textLight, fontSize: 11 }} dy={10} />
            <YAxis axisLine={false} tickLine={false} tick={{ fill: COLORS.textLight, fontSize: 11 }} tickCount={5} />
            <Tooltip content={<CustomTooltip unit=" 次" />} cursor={CROSSHAIR} />
            <Line type="monotone" dataKey="cacheHits" name="缓存命中" stroke={COLORS.blue} strokeWidth={2} dot={false} activeDot={ACTIVE_DOT} />
          </LineChart>
        </ResponsiveContainer>
      </XCard>
      <XCard title="缓存命中率" value="65.4%"
        tip="缓存命中请求数占总请求数的比例,衡量缓存对整体流量的覆盖效果。"
        models="文本模型(可走缓存的对话/补全请求)">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={dailyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: COLORS.textLight, fontSize: 11 }} dy={10} />
            <YAxis axisLine={false} tickLine={false} tick={{ fill: COLORS.textLight, fontSize: 11 }} tickCount={5} domain={[0, 100]} />
            <Tooltip content={<CustomTooltip unit="%" />} cursor={CROSSHAIR} />
            <Line type="monotone" dataKey="hitRate" name="命中率" stroke={COLORS.green} strokeWidth={2} dot={false} activeDot={ACTIVE_DOT} />
          </LineChart>
        </ResponsiveContainer>
      </XCard>
      <XCard title="缓存命中 Tokens" value={fmtM(totalHitTokens)}
        tip="缓存命中所节省的 Token 总量,单位按百万 (M) 计;不足 1M 时展示两位小数。该值越大说明缓存节省的推理量越多。"
        models="文本模型(命中缓存复用的输入/输出 Token)">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={dailyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: COLORS.textLight, fontSize: 11 }} dy={10} />
            <YAxis axisLine={false} tickLine={false} tick={{ fill: COLORS.textLight, fontSize: 11 }} tickCount={5} tickFormatter={v => (v / 1_000_000).toFixed(1) + 'M'} />
            <Tooltip content={<CustomTooltip unit=" 个" />} cursor={{ fill: '#f1f5f9' }} />
            <Bar dataKey="cacheHitTokens" name="命中 Tokens" fill={COLORS.cyan} maxBarSize={30} radius={[2, 2, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </XCard>
    </div>
  );
};
// --- 2. Error Analytics ---
const ErrorsView = () => (
  <div className="dashboard-grid">
    <XCard title="报错率" value="4.2%"
      tip="报错请求数占总请求数的比例,反映服务整体稳定性。"
      models="文本 + 多模态全部模型的 API 请求">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={dailyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
          <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: COLORS.textLight, fontSize: 11 }} dy={10} />
          <YAxis axisLine={false} tickLine={false} tick={{ fill: COLORS.textLight, fontSize: 11 }} tickCount={5} />
          <Tooltip content={<CustomTooltip unit="%" />} cursor={CROSSHAIR} />
          <Line type="monotone" dataKey="errorRate" name="报错率" stroke={COLORS.red} strokeWidth={2} dot={false} activeDot={ACTIVE_DOT} />
        </LineChart>
      </ResponsiveContainer>
    </XCard>
    <XCard title="报错数量" value="850"
      tip="按 HTTP 状态码 (429 限流 / 500 服务端 / 401 鉴权) 堆叠展示的报错次数。"
      models="文本 + 多模态全部模型的 API 请求">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={dailyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
          <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: COLORS.textLight, fontSize: 11 }} dy={10} />
          <YAxis axisLine={false} tickLine={false} tick={{ fill: COLORS.textLight, fontSize: 11 }} tickCount={5} />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: '#f1f5f9' }} />
          <Legend iconType="circle" wrapperStyle={{ fontSize: '12px' }} />
          <Bar dataKey="err429" name="429 限流" stackId="a" fill={COLORS.orange} maxBarSize={30} />
          <Bar dataKey="err500" name="500 服务端" stackId="a" fill={COLORS.red} maxBarSize={30} />
          <Bar dataKey="err401" name="401 鉴权" stackId="a" fill={COLORS.purple} maxBarSize={30} />
        </BarChart>
      </ResponsiveContainer>
    </XCard>
    <XCard title="报错类型分布" value="5 类"
      tip="按错误类型对报错请求归类,定位主要故障来源。"
      models="文本 + 多模态全部模型的 API 请求">
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
    <XCard title="自动恢复请求" value="120"
      tip="通过自动重试 / 故障转移成功挽回的报错请求数,反映容错能力。"
      models="文本 + 多模态全部模型的 API 请求">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={dailyData.map(d => ({ ...d, rescued: 0 }))} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
          <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: COLORS.textLight, fontSize: 11 }} dy={10} />
          <YAxis axisLine={false} tickLine={false} tick={{ fill: COLORS.textLight, fontSize: 11 }} tickCount={5} />
          <Tooltip content={<CustomTooltip />} cursor={CROSSHAIR} />
          <Line type="monotone" dataKey="rescued" name="自动恢复" stroke={COLORS.green} strokeWidth={2} dot={false} activeDot={ACTIVE_DOT} />
        </LineChart>
      </ResponsiveContainer>
    </XCard>
  </div>
);

// --- 4. Latency Analytics ---
const LatencyView = () => {
  const [percentile, setPercentile] = useState('p50');
  return (
    <div className="dashboard-grid">
      <XCard title="平均延迟" value={`${percentile.toUpperCase()}: 1.2s`}
        tip="请求端到端总耗时的分位数 (P50/P95/P99),可切换分位观察长尾延迟。"
        models="文本模型(对话/补全请求)">
        <div style={{ position: 'absolute', top: '16px', right: '24px', zIndex: 10 }}>
          <select value={percentile} onChange={e => setPercentile(e.target.value)} style={{ padding: '4px 8px', borderRadius: '4px', border: `1px solid ${COLORS.gray}` }}>
            <option value="p50">P50</option>
            <option value="p95">P95</option>
            <option value="p99">P99</option>
          </select>
        </div>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={dailyData} margin={{ top: 20, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: COLORS.textLight, fontSize: 11 }} dy={10} />
            <YAxis axisLine={false} tickLine={false} tick={{ fill: COLORS.textLight, fontSize: 11 }} tickCount={5} />
            <Tooltip content={<CustomTooltip unit=" ms" />} cursor={CROSSHAIR} />
            <Line type="monotone" dataKey={percentile} name={`${percentile.toUpperCase()} 延迟`} stroke={COLORS.blue} strokeWidth={2} dot={false} activeDot={ACTIVE_DOT} />
          </LineChart>
        </ResponsiveContainer>
      </XCard>
      <XCard title="平均首字延迟 (TTFT)" value="350 ms"
        tip="从发起请求到返回第一个 Token 的耗时,衡量流式响应的初始体验。"
        models="文本模型(流式对话/补全请求)">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={dailyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: COLORS.textLight, fontSize: 11 }} dy={10} />
            <YAxis axisLine={false} tickLine={false} tick={{ fill: COLORS.textLight, fontSize: 11 }} tickCount={5} />
            <Tooltip content={<CustomTooltip unit=" ms" />} cursor={CROSSHAIR} />
            <Line type="monotone" dataKey="ttft" name="首字延迟" stroke={COLORS.green} strokeWidth={2} dot={false} activeDot={ACTIVE_DOT} />
          </LineChart>
        </ResponsiveContainer>
      </XCard>

    </div>
  );
};

// --- 5. Multimodal Analytics (MVP: 5 核心指标) ---
const MultimodalView = () => {
  const [procPercentile, setProcPercentile] = useState('p50');
  const procKeyMap = { p50: 'mmP50', p95: 'mmP95', p99: 'mmP99' };

  return (
    <div className="dashboard-grid">
      {/* 1. 多模态调用量 —— 按模态归一化为「次」，跨模态可堆叠 */}
      <XCard title="多模态调用量" value="12,480 次"
        tip="按模态 (图像/音频/视频) 堆叠统计的多模态请求次数,跨模态归一化为「次」。"
        models="多模态模型:图像 (文生图/图生图)、音频 (TTS/STT)、视频 (文生视频/视频理解)">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={dailyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: COLORS.textLight, fontSize: 11 }} dy={10} />
            <YAxis axisLine={false} tickLine={false} tick={{ fill: COLORS.textLight, fontSize: 11 }} tickCount={5} />
            <Tooltip content={<CustomTooltip unit=" 次" />} cursor={{ fill: '#f1f5f9' }} />
            <Legend iconType="circle" wrapperStyle={{ fontSize: '12px' }} />
            <Bar dataKey="mmImageReq" name="图像" stackId="a" fill={MODAL_COLORS.image} maxBarSize={30} />
            <Bar dataKey="mmAudioReq" name="音频" stackId="a" fill={MODAL_COLORS.audio} maxBarSize={30} />
            <Bar dataKey="mmVideoReq" name="视频" stackId="a" fill={MODAL_COLORS.video} maxBarSize={30} radius={[2, 2, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </XCard>


      {/* 1.5 生成类型分布 */}
      <XCard title="生成类型分布"
        tip="按生成媒体类型 (图片/视频/音频) 统计的产物数量占比。"
        models="多模态生成模型:图像、视频、音频">
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

      {/* 2. 多模态成本 —— 按模态归因，视频单价高，重点观察 */}
      <XCard title="多模态成本" value="¥1,860.00" subtitle="按模态归因 · 视频单价高需重点观察"
        tip="按模态 (图像/音频/视频) 归因的消费金额,视频单价高需重点观察。"
        models="多模态模型:图像、音频、视频">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={dailyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: COLORS.textLight, fontSize: 11 }} dy={10} />
            <YAxis axisLine={false} tickLine={false} tick={{ fill: COLORS.textLight, fontSize: 11 }} tickCount={5} tickFormatter={v => '¥' + v} />
            <Tooltip content={<CustomTooltip unit=" 元" />} cursor={{ fill: '#f1f5f9' }} />
            <Legend iconType="circle" wrapperStyle={{ fontSize: '12px' }} />
            <Bar dataKey="mmImageCost" name="图像" stackId="c" fill={MODAL_COLORS.image} maxBarSize={30} />
            <Bar dataKey="mmAudioCost" name="音频" stackId="c" fill={MODAL_COLORS.audio} maxBarSize={30} />
            <Bar dataKey="mmVideoCost" name="视频" stackId="c" fill={MODAL_COLORS.video} maxBarSize={30} radius={[2, 2, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </XCard>

      {/* 3. 异步任务状态/成功率 —— 本模块核心，LLM 路由分析没有的维度 */}


      {/* 4. 平均处理时长 —— 复用延迟分析的分位数选择器 */}
      <XCard title="平均处理时长" value={`${procPercentile.toUpperCase()}: ${dailyData.at(-1)[procKeyMap[procPercentile]]}s`}
        tip="多模态异步任务从提交到完成的处理时长分位数 (P50/P95/P99),按模态分别展示。"
        models="多模态模型:图像、音频、视频">
        <div style={{ position: 'absolute', top: '16px', right: '24px', zIndex: 10 }}>
          <select value={procPercentile} onChange={e => setProcPercentile(e.target.value)} style={{ padding: '4px 8px', borderRadius: '4px', border: `1px solid ${COLORS.gray}` }}>
            <option value="p50">P50</option>
            <option value="p95">P95</option>
            <option value="p99">P99</option>
          </select>
        </div>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={dailyData} margin={{ top: 20, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: COLORS.textLight, fontSize: 11 }} dy={10} />
            <YAxis axisLine={false} tickLine={false} tick={{ fill: COLORS.textLight, fontSize: 11 }} tickCount={5} />
            <Tooltip content={<CustomTooltip unit=" s" />} cursor={CROSSHAIR} />
                        <Line type="monotone" dataKey={`mmImage${procPercentile.toUpperCase()}`} name={`图像 ${procPercentile.toUpperCase()}`} stroke={MODAL_COLORS.image} strokeWidth={2} dot={false} activeDot={ACTIVE_DOT} />
            <Line type="monotone" dataKey={`mmAudio${procPercentile.toUpperCase()}`} name={`音频 ${procPercentile.toUpperCase()}`} stroke={MODAL_COLORS.audio} strokeWidth={2} dot={false} activeDot={ACTIVE_DOT} />
            <Line type="monotone" dataKey={`mmVideo${procPercentile.toUpperCase()}`} name={`视频 ${procPercentile.toUpperCase()}`} stroke={MODAL_COLORS.video} strokeWidth={2} dot={false} activeDot={ACTIVE_DOT} />
          </LineChart>
        </ResponsiveContainer>
      </XCard>


    </div>
  );
};

// --- 6. Desk Usage Analytics (MVP: 5 核心指标) ---
const DeskView = () => {
  const STATUS_META = {
    running: { label: '运行中', color: 'green' },
    stopped: { label: '已关机', color: 'orange' },
    released: { label: '已释放', color: 'default' },
  };
  const deskColumns = [
    { title: '桌面 ID', dataIndex: 'id', key: 'id', render: t => <span style={{ color: COLORS.blue, fontWeight: 500 }}>{t}</span> },
    { title: '使用者', dataIndex: 'user', key: 'user' },
    { title: '规格', dataIndex: 'spec', key: 'spec', render: t => <Tag color={t === 'GPU 型' ? 'purple' : t === '高内存型' ? 'cyan' : 'blue'}>{t}</Tag> },
    { title: '使用时长', dataIndex: 'hours', key: 'hours' },
    { title: '利用率', dataIndex: 'util', key: 'util', render: t => <span style={{ color: parseInt(t) < 20 ? COLORS.red : COLORS.textMain, fontWeight: parseInt(t) < 20 ? 600 : 400 }}>{t}</span> },
    { title: '状态', dataIndex: 'status', key: 'status', render: t => <Tag color={STATUS_META[t]?.color}>{STATUS_META[t]?.label || t}</Tag> },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div className="dashboard-grid">
        {/* 1. Desk 总成本 (按规格归因) —— hero */}
        <XCard title="Desk 总成本 (按规格)" value="¥8,420.00" subtitle="按计费规格 (标准/GPU/高内存) 归因"
          tip="云电脑(Desk)按计费规格(标准型/GPU型/高内存型)堆叠归因的消费金额。"
          models="不涉及 AI 模型(云电脑资源计费)">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={dailyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: COLORS.textLight, fontSize: 11 }} dy={10} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: COLORS.textLight, fontSize: 11 }} tickCount={5} tickFormatter={v => '¥' + v} />
              <Tooltip content={<CustomTooltip unit=" 元" />} cursor={{ fill: '#f1f5f9' }} />
              <Legend iconType="circle" wrapperStyle={{ fontSize: '12px' }} />
              <Bar dataKey="deskCostStandard" name="标准型" stackId="d" fill={COLORS.blue} maxBarSize={30} />
              <Bar dataKey="deskCostGpu" name="GPU 型" stackId="d" fill={COLORS.purple} maxBarSize={30} />
              <Bar dataKey="deskCostHighmem" name="高内存型" stackId="d" fill={COLORS.cyan} maxBarSize={30} radius={[2, 2, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </XCard>

        {/* 2. 资源利用率 —— 多维资源利用率 */}
<XCard title="资源利用率" subtitle="CPU / 内存 / 磁盘 / GPU 利用率（%）"
  tip="云电脑实例的 CPU / 内存 / 磁盘 / GPU 平均利用率,持续偏低说明资源闲置。"
  models="不涉及 AI 模型(云电脑资源监控)">
  <ResponsiveContainer width="100%" height="100%">
    <LineChart data={dailyData} margin={{ top: 20, right: 10, left: -20, bottom: 0 }}>
      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
      <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: COLORS.textLight, fontSize: 11 }} dy={10} />
      <YAxis axisLine={false} tickLine={false} tick={{ fill: COLORS.textLight, fontSize: 11 }} tickCount={5} domain={[0, 100]} />
      <Tooltip content={<CustomTooltip unit="%" />} cursor={CROSSHAIR} />
      <Line type="monotone" dataKey="deskCpuUtil" name="CPU 利用率" stroke={COLORS.blue} strokeWidth={2} dot={false} activeDot={ACTIVE_DOT} />
      <Line type="monotone" dataKey="deskMemUtil" name="内存利用率" stroke={COLORS.purple} strokeWidth={2} dot={false} activeDot={ACTIVE_DOT} />
      <Line type="monotone" dataKey="deskDiskUtil" name="磁盘利用率" stroke={COLORS.cyan} strokeWidth={2} dot={false} activeDot={ACTIVE_DOT} />
      <Line type="monotone" dataKey="deskGpuUtil" name="GPU 利用率" stroke={COLORS.red} strokeWidth={2} dot={false} activeDot={ACTIVE_DOT} />
    </LineChart>
  </ResponsiveContainer>
</XCard>

        {/* 3. 桌面状态分布 —— 对接系统真实状态; 已关机=占用未释放, 省钱抓手 */}
        <XCard title="桌面状态分布" value="" subtitle="按系统状态 (运行中/已关机) 统计, 不依赖开通来源"
          tip="按云电脑系统真实状态(运行中/已关机)统计的桌面台数,已关机但未释放仍可能计存储费。"
          models="不涉及 AI 模型(云电脑资源状态)">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={dailyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: COLORS.textLight, fontSize: 11 }} dy={10} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: COLORS.textLight, fontSize: 11 }} tickCount={5} />
              <Tooltip content={<CustomTooltip unit=" 台" />} cursor={{ fill: '#f1f5f9' }} />
              <Legend iconType="circle" wrapperStyle={{ fontSize: '12px' }} />
              <Bar dataKey="deskRunning" name="运行中" stackId="s" fill={COLORS.green} maxBarSize={30} />
              <Bar dataKey="deskStopped" name="已关机" stackId="s" fill={COLORS.orange} maxBarSize={30} radius={[2, 2, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </XCard>

        {/* 4. 连接质量 RTT —— 体验金标, >200ms 明显卡顿 */}
        <XCard title="连接质量 (RTT)" value="68 ms" subtitle="连接往返延迟 · >200ms 体验明显下降"
          tip="云电脑串流连接的往返延迟 (RTT) P50/P95,超过 200ms 操作明显卡顿。"
          models="不涉及 AI 模型(云电脑串流网络)">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={dailyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: COLORS.textLight, fontSize: 11 }} dy={10} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: COLORS.textLight, fontSize: 11 }} tickCount={5} />
              <Tooltip content={<CustomTooltip unit=" ms" />} cursor={CROSSHAIR} />
              <Legend iconType="circle" wrapperStyle={{ fontSize: '12px' }} />
              <Line type="monotone" dataKey="deskRttP50" name="P50" stroke={COLORS.green} strokeWidth={2} dot={false} activeDot={ACTIVE_DOT} />
              <Line type="monotone" dataKey="deskRttP95" name="P95" stroke={COLORS.orange} strokeWidth={2} dot={false} activeDot={ACTIVE_DOT} />
            </LineChart>
          </ResponsiveContainer>
        </XCard>
      </div>

      {/* 5. 使用明细 (找闲置桌面与重度用户) */}
      <Card title="桌面使用明细" className="portkey-card" style={{ height: 'auto', padding: 0 }}>
        <div className="card-body" style={{ padding: '12px 24px 24px 24px' }}>
          <Table columns={deskColumns} dataSource={deskDetailData} pagination={false} rowKey="id" size="small" />
        </div>
      </Card>
    </div>
  );
};

// --- MAIN APP COMPONENT ---
// 时间筛选 -> 卡片副标题文案 (mock: 真实环境按所选窗口的起止日期动态生成)
const RANGE_LABELS = {
  '15m': '数据来自最近15分钟',
  '1h': '数据来自最近1小时',
  '24h': '数据来自最近24小时',
  'yesterday': '数据来自昨天',
  '3d': '数据来自最近3天',
  '7d': '数据来自 05月26日 至 06月01日',
  '14d': '数据来自 05月19日 至 06月01日',
  '30d': '数据来自 05月03日 至 06月01日',
  '90d': '数据来自 03月03日 至 06月01日',
  'custom': '数据来自自定义范围',
};

// 全局筛选维度 (参考 Portkey, 新增 Resource)。可叠加, 一次加一个
const FILTER_DIMENSIONS = [
  { key: 'resource', label: 'Resource' },
  { key: 'model', label: 'Model' },
  { key: 'cost', label: 'Cost' },
  { key: 'tokens', label: 'Tokens' },
  { key: 'cache', label: 'Cache' },
  { key: 'status', label: 'Status' },
  { key: 'user', label: 'User' },
  { key: 'apiKey', label: 'API Key' },
  { key: 'provider', label: 'Provider' },
  { key: 'traceId', label: 'Trace Id' },
];

// 可叠加筛选条件：选维度 -> 填值 -> 加为 chip，可逐个移除
const FilterBar = () => {
  const [filters, setFilters] = useState([]);
  const [draftDim, setDraftDim] = useState('');
  const [draftVal, setDraftVal] = useState('');

  const addFilter = () => {
    if (!draftDim || !draftVal.trim()) return;
    const label = FILTER_DIMENSIONS.find(d => d.key === draftDim)?.label || draftDim;
    setFilters([...filters, { id: Date.now(), key: draftDim, label, value: draftVal.trim() }]);
    setDraftDim('');
    setDraftVal('');
  };
  const removeFilter = (id) => setFilters(filters.filter(f => f.id !== id));

  // 已选维度不再重复出现在下拉里
  const available = FILTER_DIMENSIONS.filter(d => !filters.some(f => f.key === d.key));

  return (
    <div className="search-input-wrapper" style={{ flexWrap: 'wrap', gap: '6px' }}>
      <SearchOutlined style={{ color: '#94a3b8' }} />
      {filters.map(f => (
        <span key={f.id} style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '4px', padding: '2px 8px', fontSize: '13px', color: '#1e293b' }}>
          <span style={{ color: '#64748b' }}>{f.label}:</span> {f.value}
          <span onClick={() => removeFilter(f.id)} style={{ cursor: 'pointer', color: '#94a3b8', marginLeft: '2px', fontWeight: 600 }}>×</span>
        </span>
      ))}
      <select value={draftDim} onChange={e => setDraftDim(e.target.value)} style={{ border: 'none', outline: 'none', background: 'transparent', fontSize: '14px', color: draftDim ? '#1e293b' : '#94a3b8' }}>
        <option value="">+ 添加筛选</option>
        {available.map(d => <option key={d.key} value={d.key}>{d.label}</option>)}
      </select>
      {draftDim && (
        <input
          type="text"
          autoFocus
          value={draftVal}
          onChange={e => setDraftVal(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && addFilter()}
          onBlur={addFilter}
          placeholder={`输入 ${FILTER_DIMENSIONS.find(d => d.key === draftDim)?.label} 值，回车添加`}
          style={{ border: 'none', outline: 'none', fontSize: '14px', color: '#1e293b', flex: 1, minWidth: '160px' }}
        />
      )}
    </div>
  );
};

const App = () => {
  const [activeTab, setActiveTab] = useState('cost');
  const [timeRange, setTimeRange] = useState('30d');
  const rangeLabel = RANGE_LABELS[timeRange] || '数据来自 05月03日 至 06月01日';

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
      case 'cost': return <CostView />;
      case 'cache': return <CacheView />;
      case 'errors': return <ErrorsView />;
      case 'latency': return <LatencyView />;
      case 'multimodal': return <MultimodalView />;
      case 'desk': return <DeskView />;
      default: return <CostView />;
    }
  };

  const renderContent = () => {
    if (activeMenu === 'dashboard') {
      return (
        <div className="analytics-container">
          <header className="page-header">
            <h1 className="page-title">仪表盘</h1>

            <div className="nav-tabs" style={{ overflowX: 'auto', paddingBottom: '2px' }}>
              <div className={`nav-tab ${activeTab === 'cost' ? 'active' : ''}`} onClick={() => setActiveTab('cost')}><CreditCardOutlined /> 消耗分析</div>
              <div className={`nav-tab ${activeTab === 'cache' ? 'active' : ''}`} onClick={() => setActiveTab('cache')}><ThunderboltOutlined /> 缓存命中</div>
              <div className={`nav-tab ${activeTab === 'errors' ? 'active' : ''}`} onClick={() => setActiveTab('errors')}><WarningOutlined /> 报错分析</div>
              <div className={`nav-tab ${activeTab === 'latency' ? 'active' : ''}`} onClick={() => setActiveTab('latency')}><DashboardOutlined /> 延迟分析</div>
              <div className={`nav-tab ${activeTab === 'multimodal' ? 'active' : ''}`} onClick={() => setActiveTab('multimodal')}><PlaySquareOutlined /> 多媒体模型</div>
              <div className={`nav-tab ${activeTab === 'desk' ? 'active' : ''}`} onClick={() => setActiveTab('desk')}><DesktopOutlined /> Desk 使用</div>
            </div>
          </header>

          <main className="main-content">
            <div className="filters-bar">
              <button style={{ background: '#fff', border: '1px solid #e2e8f0', padding: '6px 10px', borderRadius: '6px', cursor: 'pointer', color: '#10b981' }}>
                <SyncOutlined />
              </button>
              <FilterBar />
              <TimeFilter selected={timeRange} setSelected={setTimeRange} />
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
    </TimeRangeContext.Provider>
  );
};

export default App;
