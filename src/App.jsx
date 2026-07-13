import { useState, useEffect, createContext, useContext } from 'react';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import { ThunderboltOutlined, WarningOutlined, SafetyCertificateOutlined,
  DashboardOutlined, PlaySquareOutlined, DesktopOutlined,
  SyncOutlined, SearchOutlined, CalendarOutlined, DownOutlined,
  AppstoreOutlined, RightOutlined, FullscreenOutlined,
  CreditCardOutlined, UserOutlined, InfoCircleOutlined, GlobalOutlined,
  EditOutlined, PlusOutlined, CheckOutlined, CloseOutlined, HolderOutlined,
  LoadingOutlined, ReloadOutlined, TagOutlined, UnorderedListOutlined,
  FilterOutlined, InboxOutlined, KeyOutlined } from '@ant-design/icons';
import { Table, Tooltip as ATooltip, Modal, DatePicker, Drawer, Dropdown, Checkbox, Popconfirm, Input, Button, message } from 'antd';
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

const XCard = ({ title, value, badge, subtitle, tip, modalities, extra, control, children }) => {
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
        {/* 标题行：标题(hover 浮显说明) + 右侧数值角标(badge 模式, 对齐 OneLink) / 展开图标 */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
          <div className={`card-title ${badge != null ? 'card-title--lg' : ''}`} style={{ marginBottom: 0 }}>
            {hasHint ? (
              <ATooltip title={hintContent} placement="top">
                <span className="card-title-hint">{title}</span>
              </ATooltip>
            ) : (
              <span>{title}</span>
            )}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {badge != null && <span className="card-badge">{badge}</span>}
            {extra}
          </div>
        </div>
        {/* 数值行：大数字 + 右侧控件(总览/按模型 等)，与数字中间对齐；badge 模式下不展示大数字 */}
        {badge == null && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', margin: '6px 0 2px' }}>
            <div className="card-value" style={{ marginBottom: 0 }}>{value}</div>
            {control}
          </div>
        )}
        {/* 副标题：数据来源时间区间，或卡片自定义副标题 */}
        <div className="card-subtitle" style={badge != null ? { marginTop: '6px' } : undefined}>{subtitle || rangeLabel}</div>
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

// --- 数据保留期：仅支持查询最近 3 年数据 ---
// 口径待与后端确认：当前按「自然日往前滚动 3 年」计算边界（今天 - 3 年，取当日 0 点）
const RETENTION_YEARS = 3;
const retentionStart = () => dayjs().startOf('day').subtract(RETENTION_YEARS, 'year');

// --- TIME FILTER COMPONENT (对齐 Figma: 分段按钮 近1小时/近1天/近30天/自定义，选中项深色描边) ---
const timeOptions = [
  { label: '近1小时', value: '1h' },
  { label: '近1天', value: '24h' },
  { label: '近30天', value: '30d' },
  { label: '自定义', value: 'custom' },
];

const TimeFilter = ({ selected, setSelected, customRange, setCustomRange }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
    {/* 自定义时：左侧出现「开始日期 至 结束日期」范围选择 (双月历弹层，对齐 Figma「日期范围选择器弹窗」) */}
    {selected === 'custom' && (
      <DatePicker.RangePicker
        format="YYYY-MM-DD"
        placeholder={['开始日期', '结束日期']}
        separator={<span style={{ color: '#94a3b8', fontSize: '12px' }}>至</span>}
        suffixIcon={null}
        prefix={<CalendarOutlined style={{ color: '#64748b', marginRight: '4px' }} />}
        value={customRange}
        onChange={(dates) => setCustomRange(dates)}
        style={{ borderRadius: '6px', border: '1px solid #e2e8f0' }}
        // 防止层：3 年保留期之外及未来日期直接置灰，非法区间在选择阶段即不可达
        disabledDate={(d) => d.isBefore(retentionStart()) || d.isAfter(dayjs().endOf('day'))}
        // 解释层：弹层底部说明置灰原因，避免被误认为异常
        renderExtraFooter={() => (
          <div style={{ fontSize: '12px', color: '#94a3b8', padding: '4px 8px' }}>
            仅支持查询最近 {RETENTION_YEARS} 年数据（{retentionStart().format('YYYY-MM-DD')} 起）
          </div>
        )}
      />
    )}
    <div className="time-seg">
      {timeOptions.map(opt => (
        <span key={opt.value}
          className={`time-seg-item ${selected === opt.value ? 'active' : ''}`}
          onClick={() => setSelected(opt.value)}>
          {opt.label}
        </span>
      ))}
    </div>
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

// --- 消耗分析：模块级聚合 (供拆分后的各指标卡组件共享) ---
const AGG = (() => {
  const totalReq = dailyData.reduce((s, d) => s + d.requests, 0);
  const totalInput = dailyData.reduce((s, d) => s + d.inputTokens, 0);
  const totalCache = dailyData.reduce((s, d) => s + d.cacheTokens, 0);
  const totalOutput = dailyData.reduce((s, d) => s + d.outputTokens, 0);
  const totalToken = totalInput + totalCache + totalOutput;
  const totalSpend = dailyData.reduce((s, d) => s + d.spend, 0);
  // 图片 / 视频生成 (成功 / 失败) —— 对齐 OneLink 总览口径
  const imgSuccess = 4320, imgFailed = 86;
  const videoSuccess = 1280, videoFailed = 23;
  // 账户额度 (mock)
  const cumRecharge = 50000, bonus = 2000, cumConsume = 38680.50;
  return {
    totalReq, totalToken, totalSpend,
    totalInput, totalCache, totalOutput,
    imgSuccess, imgFailed, videoSuccess, videoFailed,
    totalImg: imgSuccess + imgFailed, totalVideo: videoSuccess + videoFailed,
    cumRecharge, bonus, cumConsume, available: cumRecharge + bonus - cumConsume,
    imgDaily: dailyData.map(d => ({ date: d.date, ok: d.mmImageReq, fail: Math.max(1, Math.round(d.mmImageReq * 0.02)) })),
    videoDaily: dailyData.map(d => ({ date: d.date, ok: d.mmVideoReq, fail: Math.max(1, Math.round(d.mmVideoReq * 0.05)) })),
  };
})();

// --- 账户额度 KPI 卡 (拆分为独立指标卡组件) ---
const AvailableCard = () => (
  <KpiCard label="可用额度" value={fmtCNY(AGG.available)} color={COLORS.green} hideRange
    icon={<CreditCardOutlined style={{ fontSize: '20px', color: COLORS.green }} />}
    hint="可继续消费的实时余额。" />
);
const RechargeCard = () => (
  <KpiCard label="累计充值" value={fmtCNY(AGG.cumRecharge)} color={COLORS.textMain} hideRange
    icon={<ThunderboltOutlined style={{ fontSize: '20px', color: COLORS.blue }} />}
    hint="账户开通至今的付费充值到账总额（不含赠金）。" />
);
const ConsumeCard = () => (
  <KpiCard label="累计消费" value={fmtCNY(AGG.cumConsume)} color={COLORS.textMain} hideRange
    icon={<DashboardOutlined style={{ fontSize: '20px', color: COLORS.purple }} />}
    hint="账户开通至今的累计扣费总额。" />
);
const BonusCard = () => (
  <KpiCard label="赠金" value={fmtCNY(AGG.bonus)} color={COLORS.orange} hideRange
    icon={<SafetyCertificateOutlined style={{ fontSize: '20px', color: COLORS.orange }} />}
    hint="平台赠送的代金余额，消费时优先于充值余额抵扣。" />
);

// --- 消耗概览统计卡 (对齐 OneLink 总览：标题左 + 大数字右，下方浅灰子项块) ---
const MiniStatCard = ({ label, tipText, modalities, value, subs }) => {
  const rangeLabel = useContext(TimeRangeContext);
  return (
    <div className="portkey-card overview-stat">
      {/* 无子项时 head 撑满剩余高度，大数字垂直居中 (对齐 OneLink「请求数」卡) */}
      <div className="overview-stat-head" style={!subs ? { flex: 1 } : undefined}>
        <ATooltip title={<div style={{ fontSize: '12px', lineHeight: 1.6 }}>{tipText}<div style={{ marginTop: '8px' }}><Modalities value={modalities} /></div></div>} placement="top">
          <span className="overview-stat-label card-title-hint">{label}</span>
        </ATooltip>
        <span className="overview-stat-value">{value}</span>
      </div>
      {subs && (
        <div className="overview-sub-row">
          {subs.map(s => (
            <div key={s.label} className="overview-sub">
              <span>{s.label}</span>
              <b>{s.value}</b>
            </div>
          ))}
        </div>
      )}
      <div className="overview-stat-sub">{rangeLabel}</div>
    </div>
  );
};

const ReqStatCard = () => (
  <MiniStatCard label="请求数" tipText="API 请求总数。" modalities={['T', 'I', 'A', 'V']}
    value={AGG.totalReq.toLocaleString()} />
);
const TokenStatCard = () => (
  <MiniStatCard label="总 token" tipText="Token 消耗总量，分输入/缓存/输出。" modalities={['T', 'I', 'A', 'V']}
    value={fmtM(AGG.totalToken)}
    subs={[
      { label: '输入', value: fmtM(AGG.totalInput) },
      { label: '缓存', value: fmtM(AGG.totalCache) },
      { label: '输出', value: fmtM(AGG.totalOutput) },
    ]} />
);
const ImgGenStatCard = () => (
  <MiniStatCard label="图片生成" tipText="图片生成任务数，分成功/失败。" modalities={{ in: ['T'], out: 'I' }}
    value={AGG.totalImg.toLocaleString()}
    subs={[
      { label: '成功', value: AGG.imgSuccess.toLocaleString() },
      { label: '失败', value: AGG.imgFailed.toLocaleString() },
    ]} />
);
const VideoGenStatCard = () => (
  <MiniStatCard label="视频生成" tipText="视频生成任务数，分成功/失败。" modalities={{ in: ['T'], out: 'V' }}
    value={AGG.totalVideo.toLocaleString()}
    subs={[
      { label: '成功', value: AGG.videoSuccess.toLocaleString() },
      { label: '失败', value: AGG.videoFailed.toLocaleString() },
    ]} />
);

// --- 用量汇总 / 消费汇总 (完全复刻 OneLink 总览：加粗标题 + 右上角数值角标 + 小时轴空态图) ---
// 小时轴 00:00 ~ 23:00，坐标轴仅标注偶数小时；无数据时用量图为浅紫占位条、消费图为贴底横线
const HOURLY_EMPTY = Array.from({ length: 24 }, (_, i) => ({
  time: `${String(i).padStart(2, '0')}:00`, ph: 1, v: 0,
}));

// 汇总卡通用外壳：加粗标题左 + 浅紫数值角标右，下方直接放图
const SummaryCard = ({ title, badge, children }) => (
  <div className="portkey-card">
    <div className="card-header">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
        <div className="card-title card-title--lg" style={{ marginBottom: 0 }}>{title}</div>
        <span className="card-badge">{badge}</span>
      </div>
    </div>
    <div className="card-body">{children}</div>
  </div>
);

const UsageSummaryCard = () => (
  <SummaryCard title="用量汇总" badge="0 Token">
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={HOURLY_EMPTY} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
        <XAxis dataKey="time" axisLine={false} tickLine={false} interval={1}
          tick={{ fill: COLORS.textLight, fontSize: 11 }} dy={10} />
        <YAxis domain={[0, 1]} ticks={[0, 0.2, 0.4, 0.6, 0.8, 1]} axisLine={false} tickLine={false}
          tick={{ fill: COLORS.textLight, fontSize: 11 }} />
        <Bar dataKey="ph" fill="#eef0fb" maxBarSize={20} isAnimationActive={false} />
      </BarChart>
    </ResponsiveContainer>
  </SummaryCard>
);
const SpendSummaryCard = () => (
  <SummaryCard title="消费汇总" badge="0 积分">
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={HOURLY_EMPTY} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
        <XAxis dataKey="time" axisLine={false} tickLine={false} interval={1}
          tick={{ fill: COLORS.textLight, fontSize: 11 }} dy={10} />
        <YAxis domain={[0, 100]} ticks={[0, 20, 40, 60, 80, 100]} axisLine={false} tickLine={false}
          tick={{ fill: COLORS.textLight, fontSize: 11 }} />
        <Area type="monotone" dataKey="v" stroke={COLORS.blue} strokeWidth={2} fillOpacity={0} isAnimationActive={false} />
      </AreaChart>
    </ResponsiveContainer>
  </SummaryCard>
);

// --- 按服务商 / 按模型分布 (完全复刻 OneLink 总览：加粗标题 + 费用/Token 分段切换 + 空态图) ---
// 分段切换：选中项实色填充白字，未选中白底灰字
const MetricToggle = ({ metric, setMetric }) => (
  <div style={{ display: 'flex', border: `1px solid ${COLORS.gray}`, borderRadius: '8px', overflow: 'hidden', fontSize: '13px' }}>
    {[['cost', '费用'], ['tokens', 'Token']].map(([k, lbl]) => (
      <span key={k} onClick={() => setMetric(k)}
        style={{ padding: '5px 16px', cursor: 'pointer', background: metric === k ? COLORS.blue : '#fff', color: metric === k ? '#fff' : COLORS.textMuted }}>
        {lbl}
      </span>
    ))}
  </div>
);

const DistCard = ({ title, defaultMetric, children }) => {
  const [metric, setMetric] = useState(defaultMetric);
  return (
    <div className="portkey-card">
      <div className="card-header">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
          <div className="card-title card-title--lg" style={{ marginBottom: 0 }}>{title}</div>
          <MetricToggle metric={metric} setMetric={setMetric} />
        </div>
      </div>
      <div className="card-body">{children}</div>
    </div>
  );
};

// 按服务商分布：空态灰色环形图，居中
const ProviderDistCard = () => (
  <DistCard title="按服务商分布" defaultMetric="cost">
    <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: '220px', height: '220px', borderRadius: '50%', border: '36px solid #d4d4d8' }} />
    </div>
  </DistCard>
);

// 按模型分布：空态横向条形图区 —— 浅绿占位横带 + 0~1 虚线纵向网格
const ModelDistCard = () => (
  <DistCard title="按模型分布" defaultMetric="tokens">
    <div style={{ position: 'relative', height: '100%', margin: '8px 6px 24px' }}>
      <div style={{ position: 'absolute', left: 0, right: 0, top: '10%', bottom: '28%', background: '#e9f6ee' }} />
      {[0, 0.2, 0.4, 0.6, 0.8, 1].map(t => (
        <div key={t} style={{ position: 'absolute', left: `${t * 100}%`, top: 0, bottom: 0, borderLeft: '1px dashed #e2e8f0' }}>
          <span style={{ position: 'absolute', bottom: '-22px', left: '50%', transform: 'translateX(-50%)', fontSize: '11px', color: COLORS.textLight }}>{t}</span>
        </div>
      ))}
    </div>
  </DistCard>
);

// --- 消耗排行 (可下钻: 部门 → 用户 → API Key) ---
const ConsumeRankCard = () => {
  const rangeLabel = useContext(TimeRangeContext);
  const [rankLevel, setRankLevel] = useState('dept'); // dept | member | apiKey —— 当前粒度
  const [rankParent, setRankParent] = useState(null); // 下钻上下文 {type:'dept'|'member', value, dept?}
  const [rankMetric, setRankMetric] = useState('cost'); // cost | tokens
  const [rankOpen, setRankOpen] = useState(false);   // 查看全部 弹窗（超出 Top5 在弹窗中滚动）
  const activeFilters = useContext(FiltersContext);  // 全局筛选 chip，驱动排行联动过滤

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
  const rankTop = rankData.slice(0, RANK_TOP_N); // 卡片仅展示 Top5，其余在弹窗中滚动查看
  const rankMax = rankData.length ? rankData[0][rankMetric] : 1;
  const rankTotal = rankData.reduce((s, d) => s + d[rankMetric], 0) || 1;
  const metricFmt = (v) => rankMetric === 'cost' ? fmtCNY(v) : fmtM(v);
  const deptColor = (d) => DEPT_COLORS[d] || COLORS.blue;
  const dimLabel = { dept: '部门', member: '用户', apiKey: 'API Key' }[rankLevel];
  const canDrill = rankLevel !== 'apiKey';
  // 选择起始层级 = 回到该粒度的扁平排行
  const jumpLevel = (lv) => { setRankLevel(lv); setRankParent(null); };
  // 单行排行项渲染（卡片 Top5 与弹窗全量复用，保持视觉一致）
  const renderRankRow = (d, i) => {
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
  };
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
  return (
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
          <div className="rank-list" style={{ display: 'flex', flexDirection: 'column', gap: '11px', marginTop: '16px' }}>
            {rankTop.map((d, i) => renderRankRow(d, i))}
          </div>
        )}

        {/* 底部：部门图例 + 查看全部（超出 Top5 在弹窗中滚动查看） */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginTop: '18px' }}>
          <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
            {Object.entries(DEPT_COLORS).map(([d, c]) => (
              <span key={d} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: COLORS.textLight }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '2px', background: c }} />{d}
              </span>
            ))}
          </div>
          {rankData.length > RANK_TOP_N && (
            <span onClick={() => setRankOpen(true)} style={{ fontSize: '12px', color: COLORS.blue, cursor: 'pointer', fontWeight: 500 }}>
              查看全部 {rankData.length} 项 →
            </span>
          )}
        </div>

        {/* 全部排行弹窗：完整榜单在弹窗内滚动 */}
        <Modal open={rankOpen} onCancel={() => setRankOpen(false)} footer={null} width={720}
          title={`消耗排行 · 按${dimLabel}（全部 ${rankData.length} 项）`}>
          <div style={{ fontSize: '12px', color: COLORS.textLight, margin: '4px 0 12px' }}>
            按{rankMetric === 'cost' ? '费用' : 'Token'}从高到低{rankFiltered ? '；已按当前全局筛选过滤' : ''}。
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '11px', maxHeight: '420px', overflowY: 'auto', overflowX: 'hidden', margin: '0 -4px', padding: '0 4px' }}>
            {rankData.map((d, i) => renderRankRow(d, i))}
          </div>
        </Modal>
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
      control={hits.control}>
      {hits.chart}
    </XCard>
  );
};

// 缓存节省成本卡
const CacheSavingsCard = () => {
  const totalSavings = dailyData.reduce((s, d) => s + d.savings, 0);
  const savings = useBreakdown({ totalData: dailyData, totalKey: 'savings', totalName: '节省成本', totalColor: COLORS.green, byModel: cacheSavingsByModel, agg: 'sum', unit: ' 元', yTickFormatter: v => '¥' + v });
  return (
    <XCard title="缓存节省成本" value={fmtCNY(totalSavings)}
      tip="命中缓存免去真实模型调用所估算的累计节省金额。"
      modalities={['T']}
      control={savings.control}>
      {savings.chart}
    </XCard>
  );
};

// --- 2. Error Analytics (各卡拆分为独立组件) ---
const ErrorRateCard = () => {
  const rate = useBreakdown({ totalData: dailyData, totalKey: 'errorRate', totalName: '报错率', totalColor: COLORS.red, byModel: errorRateByModel, agg: 'avg', unit: '%' });
  return (
    <XCard title="报错率" value="4.2%"
      tip="服务报错的请求占比。"
      modalities={['T', 'I', 'A', 'V']}
      control={rate.control}>
      {rate.chart}
    </XCard>
  );
};
const ErrorCountCard = () => (
    <XCard title="报错数量" value="850"
      tip="报错请求数，按 HTTP 状态码拆分。"
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
);
const ErrorTypeCard = () => (
    <XCard title="报错类型分布" value="5 类"
      tip="报错请求按错误类型归类。"
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
);

// 挽救请求数卡 (抽为组件，供报错分析 Tab 与总览复用)
const RescuedCard = () => (
  <XCard title="挽救请求数" value="120"
    tip="Fallback成功的请求数。"
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
  const lat = useBreakdown({ totalData: dailyData, totalKey: percentile, totalName: `${percentile.toUpperCase()} 延迟`, totalColor: COLORS.blue, byModel: latByModel[percentile], agg: 'avg', unit: ' ms', controlExtra: pSelect });
  return (
    <XCard title="平均延迟" value={`${percentile.toUpperCase()}: 1.2s`}
      tip="请求端到端总耗时的分位数（P50/P95/P99），可切换分位看长尾。计算：对区间内全部请求的端到端耗时取所选分位（非按请求量加权）。"
      modalities={['T']}
      control={lat.control}>
      {lat.chart}
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
    tip="多模态请求次数，按模态（图像/音频/视频）拆分。计算：按模态分别累加请求次数。"
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
      tip="多模态生成任务从提交到产物完成的生成时长分位数（P50/P95/P99），可按模态切换。计算：对区间内该模态全部生成任务的处理时长取所选分位（非按请求量加权）。"
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
    tip="生成媒体类型（图片/视频/音频）的占比。"
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
    tip="各模态生成请求的实际扣费累加。"
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

// =====================================================================
// 指标卡片呈现：只展示按时间聚合后的总览趋势
//   · 不支持「总览 ⇄ 按模型」切换，不支持展开详情/点击下钻
//   · 按模型细分数据仅用于全局模型筛选时重新聚合总览线
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

// 指标卡片图表逻辑(hook)：只展示按时间聚合后的总览趋势线
// 不提供总览/按模型切换、展开详情、点击下钻；保留全局模型筛选联动（筛选后由选中模型按 agg 重新聚合）
const useBreakdown = ({ totalData, totalKey, totalName, totalColor, byModel, agg = 'sum', unit, yTickFormatter, controlExtra }) => {
  const activeModels = useContext(FilterContext);

  const allModels = Object.keys(byModel[0]).filter(k => k !== 'date');
  const scoped = activeModels.filter(m => allModels.includes(m)); // 生效的模型筛选
  const singleModel = scoped.length === 1;

  // 受筛选影响的"总览"数据：未筛选→全量聚合(传入)；筛选→由选中模型按 agg 再聚合
  const scopedTotalData = scoped.length === 0 ? totalData : byModel.map(r => {
    const s = scoped.reduce((a, m) => a + r[m], 0);
    return { date: r.date, _v: +(agg === 'avg' ? s / scoped.length : s).toFixed(1) };
  });
  const scopedTotalKey = scoped.length === 0 ? totalKey : '_v';
  const scopedTotalName = scoped.length === 0 ? totalName : (singleModel ? scoped[0] : `已选 ${scoped.length} 个模型合计`);

  const control = controlExtra ? (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>{controlExtra}</div>
  ) : null;

  const chart = (
    <>
      {scoped.length > 0 && (
        <div style={{ position: 'absolute', top: '6px', left: '24px', fontSize: '12px', color: COLORS.textLight, zIndex: 5 }}>
          范围: <b style={{ color: COLORS.textMain }}>{singleModel ? scoped[0] : scoped.length + ' 个模型'}</b>
        </div>
      )}
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={scopedTotalData} margin={{ top: 20, right: 10, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
          <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: COLORS.textLight, fontSize: 11 }} dy={10} ticks={AXIS_END_TICKS} interval={0} />
          <YAxis axisLine={false} tickLine={false} tick={{ fill: COLORS.textLight, fontSize: 11 }} tickCount={2} tickFormatter={yTickFormatter} />
          <Tooltip content={<CustomTooltip unit={unit} />} cursor={CROSSHAIR} />
          <Line type="monotone" dataKey={scopedTotalKey} name={scopedTotalName} stroke={totalColor} strokeWidth={2} dot={false} activeDot={ACTIVE_DOT} />
        </LineChart>
      </ResponsiveContainer>
    </>
  );

  return { control, chart };
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
// 筛选维度 (对齐 Figma「添加筛选选项弹窗」：模型 / 供应商 / API密钥 / 用户，带图标)
const FILTER_DIMENSIONS = [
  { key: 'model', label: '模型', icon: <AppstoreOutlined /> },
  { key: 'provider', label: '供应商', icon: <GlobalOutlined /> },
  { key: 'apiKey', label: 'API密钥', icon: <KeyOutlined /> },
  { key: 'user', label: '用户', icon: <UserOutlined /> },
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

// 值列表前的品牌标识占位 (设计稿为服务商 logo，原型用首字母色块代替)
const FILTER_LOGO_COLORS = ['#1677ff', '#722ed1', '#13c2c2', '#faad14', '#52c41a', '#ff4d4f', '#0ea5e9'];

// 可叠加筛选 (对齐 Figma「添加筛选选项弹窗」)：
// 点击输入区弹出级联面板 —— 左列选维度，右列勾选值 (checkbox 多选)，选中即成 chip「维度/值 ×」
const FilterBar = ({ filters, setFilters }) => {
  const [open, setOpen] = useState(false);
  const [dim, setDim] = useState('model');

  const removeFilter = (id) => setFilters(filters.filter(f => f.id !== id));
  const isChecked = (dimKey, v) => filters.some(f => f.key === dimKey && f.value === v);
  const toggleValue = (dimKey, v) => {
    const label = FILTER_DIMENSIONS.find(d => d.key === dimKey)?.label || dimKey;
    setFilters(prev => isChecked(dimKey, v)
      ? prev.filter(f => !(f.key === dimKey && f.value === v))
      : [...prev, { id: Date.now() + Math.random(), key: dimKey, label, value: v }]);
  };
  const dimCount = (dimKey) => filters.filter(f => f.key === dimKey).length;
  const values = FILTER_VALUE_OPTIONS[dim] || [];

  return (
    <div className="search-input-wrapper filter-bar-anchor" style={{ flexWrap: 'wrap', gap: '6px', position: 'relative' }}>
      <FilterOutlined style={{ color: '#94a3b8' }} />
      {filters.map(f => (
        <span key={f.id} className="filter-chip">
          <span style={{ color: '#64748b' }}>{f.label}/</span>{f.value}
          <span onClick={(e) => { e.stopPropagation(); removeFilter(f.id); }} style={{ cursor: 'pointer', color: '#94a3b8', marginLeft: '2px', fontWeight: 600 }}>×</span>
        </span>
      ))}
      <span onClick={() => setOpen(o => !o)} style={{ color: '#94a3b8', fontSize: '13px', cursor: 'pointer', flex: 1, minWidth: '120px' }}>
        添加筛选选项
      </span>
      {filters.length > 0 && (
        <span onClick={() => setFilters([])} title="清空全部筛选" style={{ cursor: 'pointer', color: '#94a3b8', fontWeight: 600, padding: '0 4px' }}>⊗</span>
      )}
      {open && (
        <>
          {/* 点击面板外区域关闭 */}
          <div style={{ position: 'fixed', inset: 0, zIndex: 998 }} onClick={() => setOpen(false)} />
          <div className="filter-panel">
            <div className="filter-panel-dims">
              {FILTER_DIMENSIONS.map(d => (
                <div key={d.key} className={`filter-dim-item ${dim === d.key ? 'active' : ''}`} onClick={() => setDim(d.key)}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: 'inherit' }}>
                    <span style={{ color: '#64748b', fontSize: '13px' }}>{d.icon}</span>{d.label}
                  </span>
                  {dimCount(d.key) > 0 && <CheckOutlined style={{ fontSize: '11px', color: COLORS.blue }} />}
                </div>
              ))}
            </div>
            <div className="filter-panel-values">
              {values.map(v => (
                <div key={v} className="filter-value-item" onClick={() => toggleValue(dim, v)}>
                  <span className="filter-logo" style={{ background: FILTER_LOGO_COLORS[v.charCodeAt(0) % FILTER_LOGO_COLORS.length] }}>{v[0].toUpperCase()}</span>
                  <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{v}</span>
                  <Checkbox checked={isChecked(dim, v)} onClick={e => e.stopPropagation()} onChange={() => toggleValue(dim, v)} />
                </div>
              ))}
              {values.length === 0 && <div style={{ padding: '16px', fontSize: '12px', color: '#94a3b8' }}>该维度暂无可选值</div>}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

// ============================================================
// 仪表盘自定义框架 —— 对应 Figma「可观测数据分析」页的交互:
//   指标管理抽屉 / 自定义布局(编辑模式) / 保存保护 / 自定义分组 / 数据加载态
// ============================================================

// --- 指标注册表: key → 标题 / 所属分类 / 渲染组件 / 栅格类型 (kpi=4列小卡, main=2列图表卡, full=通栏) ---
const METRICS = [
  { key: 'available', title: '可用额度', cat: 'cost', grid: 'kpi', Comp: AvailableCard, desc: '可继续消费的实时余额，含赠金。' },
  { key: 'recharge', title: '累计充值', cat: 'cost', grid: 'kpi', Comp: RechargeCard, desc: '账户开通至今的付费充值到账总额。' },
  { key: 'consume', title: '累计消费', cat: 'cost', grid: 'kpi', Comp: ConsumeCard, desc: '账户开通至今的累计扣费总额。' },
  { key: 'bonus', title: '赠金', cat: 'cost', grid: 'kpi', Comp: BonusCard, desc: '平台赠送的代金余额，优先抵扣。' },
  { key: 'req', title: '请求数', cat: 'cost', grid: 'kpi', Comp: ReqStatCard, desc: '时间段内 API 请求总数及走势。' },
  { key: 'token', title: '总 token', cat: 'cost', grid: 'kpi', Comp: TokenStatCard, desc: 'Token 消耗总量，分输入/缓存/输出。' },
  { key: 'imgGen', title: '图片生成', cat: 'cost', grid: 'kpi', Comp: ImgGenStatCard, desc: '图片生成任务数，分成功/失败。' },
  { key: 'videoGen', title: '视频生成', cat: 'cost', grid: 'kpi', Comp: VideoGenStatCard, desc: '视频生成任务数，分成功/失败。' },
  { key: 'usage', title: '用量汇总', cat: 'cost', grid: 'main', Comp: UsageSummaryCard, desc: '时间段内 Token 用量走势 (输入/缓存/输出)。' },
  { key: 'spendSum', title: '消费汇总', cat: 'cost', grid: 'main', Comp: SpendSummaryCard, desc: '时间段内消费金额走势。' },
  { key: 'provDist', title: '按服务商分布', cat: 'cost', grid: 'main', Comp: ProviderDistCard, desc: '消耗按上游服务商归因，可切换费用/Token。' },
  { key: 'modelDist', title: '按模型分布', cat: 'cost', grid: 'main', Comp: ModelDistCard, desc: '消耗按具体模型归因，可切换费用/Token。' },
  { key: 'rank', title: '消耗排行', cat: 'cost', grid: 'full', Comp: ConsumeRankCard, desc: '按部门/用户/API Key 三级下钻的消耗排行。' },
  { key: 'cacheHit', title: '缓存命中token数', cat: 'cache', grid: 'main', Comp: CacheHitCard, desc: '缓存命中的 Input Token 数与命中率。' },
  { key: 'cacheSavings', title: '缓存节省成本', cat: 'cache', grid: 'main', Comp: CacheSavingsCard, desc: '命中缓存估算节省的累计金额。' },
  { key: 'errorRate', title: '报错率', cat: 'errors', grid: 'main', Comp: ErrorRateCard, desc: '服务报错的请求占比走势。' },
  { key: 'errorCount', title: '报错数量', cat: 'errors', grid: 'main', Comp: ErrorCountCard, desc: '报错请求数，按 HTTP 状态码拆分。' },
  { key: 'errorType', title: '报错类型分布', cat: 'errors', grid: 'main', Comp: ErrorTypeCard, desc: '报错请求按错误类型归类占比。' },
  { key: 'rescued', title: '挽救请求数', cat: 'errors', grid: 'main', Comp: RescuedCard, desc: 'Fallback 成功挽救的请求数。' },
  { key: 'latency', title: '平均延迟', cat: 'latency', grid: 'main', Comp: LatencyCard, desc: '端到端延迟分位数 (P50/P95/P99)。' },
  { key: 'ttft', title: '平均首字延迟 (TTFT)', cat: 'latency', grid: 'main', Comp: TtftCard, desc: '请求到首个 Token 返回的平均耗时。' },
  { key: 'mmCall', title: '多模态调用量', cat: 'multimodal', grid: 'main', Comp: MmCallCard, desc: '多模态请求次数，按模态拆分。' },
  { key: 'genType', title: '生成类型分布', cat: 'multimodal', grid: 'main', Comp: GenTypeCard, desc: '生成媒体类型占比 (图片/视频/音频)。' },
  { key: 'mmCost', title: '多模态成本', cat: 'multimodal', grid: 'main', Comp: MmCostCard, desc: '各模态生成请求的实际扣费累加。' },
  { key: 'genTime', title: '平均生成时长', cat: 'multimodal', grid: 'main', Comp: GenTimeCard, desc: '生成任务处理时长分位数，可按模态切换。' },
];
const METRIC_MAP = Object.fromEntries(METRICS.map(m => [m.key, m]));
// 默认尺寸规则：消耗分析数字型卡片(kpi)默认小尺寸，图表型(main)默认中尺寸，消耗排行(full)默认大尺寸
const DEFAULT_SIZE = { kpi: 'sm', main: 'md', full: 'lg' };

// 指标分类 (指标管理抽屉左侧导航)
const CATS = [
  { key: 'cost', label: '消耗分析' },
  { key: 'cache', label: '缓存命中' },
  { key: 'errors', label: '报错分析' },
  { key: 'latency', label: '延迟分析' },
  { key: 'multimodal', label: '多媒体模型' },
];
// 固定 Tab 与其默认指标列表 (列表顺序即渲染顺序)
const COST_KEYS = ['available', 'recharge', 'consume', 'bonus', 'req', 'token', 'imgGen', 'videoGen', 'usage', 'spendSum', 'provDist', 'modelDist', 'rank'];
const DEFAULT_LISTS = {
  overview: [...COST_KEYS, 'cacheHit', 'cacheSavings', 'rescued', 'latency', 'ttft', 'genType', 'mmCost', 'genTime'],
  cost: COST_KEYS,
  cache: ['cacheHit', 'cacheSavings'],
  errors: ['errorRate', 'errorCount', 'errorType', 'rescued'],
  latency: ['latency', 'ttft'],
  multimodal: ['mmCall', 'genType', 'mmCost', 'genTime'],
};
const FIXED_TABS = [
  { key: 'overview', label: '总览', icon: <AppstoreOutlined /> },
  { key: 'cost', label: '消耗分析', icon: <CreditCardOutlined /> },
  { key: 'cache', label: '缓存命中', icon: <ThunderboltOutlined /> },
  { key: 'errors', label: '报错分析', icon: <WarningOutlined /> },
  { key: 'latency', label: '延迟分析', icon: <DashboardOutlined /> },
  { key: 'multimodal', label: '多媒体模型', icon: <PlaySquareOutlined /> },
];
const TAB_LABEL = (dash, key) => FIXED_TABS.find(t => t.key === key)?.label || dash.groups.find(g => g.id === key)?.name || key;

// 布局状态: lists (每个 tab/分组 的指标 key 列表) + sizes (卡片尺寸) + groups (自定义分组)
const DEFAULT_DASH = { lists: DEFAULT_LISTS, sizes: {}, groups: [] };
const cloneDash = (d) => JSON.parse(JSON.stringify(d));

const DashboardContext = createContext(null);

// --- 指标卡通用包装：编辑态勾选/卡片菜单 + 数据加载态 (loading / 失败重试) ---
const MCard = ({ mkey }) => {
  const ctx = useContext(DashboardContext);
  const m = METRIC_MAP[mkey];
  const { editMode, selected, toggleSelect, tabKey, dash, setCardSize, moveCard, removeCards, loadTick } = ctx;

  // 数据加载模拟：刷新/切时间窗时转圈，小概率失败可重试 (对应 Figma「数据加载」帧)
  const [load, setLoad] = useState('loading');
  useEffect(() => {
    let alive = true;
    setLoad('loading');
    const t = setTimeout(() => {
      if (alive) setLoad(loadTick > 0 && Math.random() < 0.1 ? 'fail' : 'done');
    }, 350 + Math.random() * 650);
    return () => { alive = false; clearTimeout(t); };
  }, [loadTick]);
  const retry = () => { setLoad('loading'); setTimeout(() => setLoad('done'), 700); };

  if (!m) return null;
  const size = (dash.sizes[tabKey] || {})[mkey] || DEFAULT_SIZE[m.grid] || 'md';
  const checked = selected.includes(mkey);

  // 卡片菜单：小/中/大卡片视图 + 移动至 + 移除 (对应 Figma「编辑模式」卡片铅笔菜单)
  const moveTargets = [
    ...FIXED_TABS.filter(t => t.key !== tabKey).map(t => ({ key: `mv-${t.key}`, label: t.label })),
    ...dash.groups.filter(g => g.id !== tabKey).map(g => ({ key: `mv-${g.id}`, label: g.name })),
  ];
  const menuItems = [
    { key: 'size-sm', label: <span>小卡片视图 {size === 'sm' && <CheckOutlined style={{ marginLeft: 8 }} />}</span> },
    { key: 'size-md', label: <span>中卡片视图 {size === 'md' && <CheckOutlined style={{ marginLeft: 8 }} />}</span> },
    { key: 'size-lg', label: <span>大卡片视图 {size === 'lg' && <CheckOutlined style={{ marginLeft: 8 }} />}</span> },
    { type: 'divider' },
    { key: 'move', label: '移动至', children: moveTargets },
    { type: 'divider' },
    { key: 'remove', danger: true, label: '移除' },
  ];
  const onMenu = ({ key }) => {
    if (key.startsWith('size-')) setCardSize(mkey, key.slice(5));
    else if (key.startsWith('mv-')) moveCard([mkey], key.slice(3));
    else if (key === 'remove') removeCards([mkey]);
  };

  const spanClass = size === 'lg' ? 'mcard-lg' : size === 'sm' ? 'mcard-sm' : '';
  return (
    <div className={`mcard ${spanClass} ${editMode ? 'mcard-editing' : ''}`}>
      {editMode && (
        <div className="mcard-chrome">
          <Checkbox checked={checked} onChange={() => toggleSelect(mkey)} />
          <span className="mcard-chrome-title">{m.title}</span>
          <Dropdown menu={{ items: menuItems, onClick: onMenu }} trigger={['click']} placement="bottomRight">
            <EditOutlined className="mcard-edit-icon" />
          </Dropdown>
        </div>
      )}
      <div className="mcard-body">
        <m.Comp />
        {load !== 'done' && (
          <div className="mcard-loading">
            {load === 'loading' ? (
              <LoadingOutlined style={{ fontSize: '20px', color: COLORS.blue }} spin />
            ) : (
              <div style={{ textAlign: 'center', color: '#94a3b8', fontSize: '12px' }}>
                <CloseOutlined style={{ fontSize: '16px', display: 'block', margin: '0 auto 6px' }} />
                数据加载失败 <ReloadOutlined onClick={retry} style={{ cursor: 'pointer', color: COLORS.blue, marginLeft: '4px' }} />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

// --- 指标栅格：把指标列表按栅格类型分段渲染 (kpi 4列 / main 2列 / full 通栏) ---
const MetricGrid = ({ keys }) => {
  const rows = [];
  let cur = null;
  keys.forEach(k => {
    const g = METRIC_MAP[k]?.grid || 'main';
    if (!cur || cur.g !== g) { cur = { g, items: [] }; rows.push(cur); }
    cur.items.push(k);
  });
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {rows.map((r, i) => r.g === 'full'
        ? r.items.map(k => <MCard key={k} mkey={k} />)
        : <div key={i} className={r.g === 'kpi' ? 'kpi-grid' : 'dashboard-grid'}>{r.items.map(k => <MCard key={k} mkey={k} />)}</div>)}
    </div>
  );
};

// --- 空态 (对应 Figma「分组缺省页」)：暂无看板内容 / 暂无匹配数据 ---
const EmptyBoard = ({ onAdd, hasFilters, onClearFilters }) => (
  <div style={{ display: 'flex', justifyContent: 'center', gap: '120px', padding: '80px 0' }}>
    <div style={{ textAlign: 'center', color: '#94a3b8' }}>
      <InboxOutlined style={{ fontSize: '44px', color: '#cbd5e1' }} />
      <div style={{ color: '#1e293b', fontWeight: 600, fontSize: '14px', margin: '14px 0 6px' }}>暂无看板内容</div>
      <div style={{ fontSize: '12px', lineHeight: 1.7 }}>当前还未添加任何指标组件<br />添加组件后即可查看对应维度的数据分析</div>
      <Button size="small" style={{ marginTop: '14px' }} onClick={onAdd}>去添加组件 ↗</Button>
    </div>
    {hasFilters && (
      <div style={{ textAlign: 'center', color: '#94a3b8' }}>
        <InboxOutlined style={{ fontSize: '44px', color: '#cbd5e1' }} />
        <div style={{ color: '#1e293b', fontWeight: 600, fontSize: '14px', margin: '14px 0 6px' }}>暂无匹配数据</div>
        <div style={{ fontSize: '12px', lineHeight: 1.7 }}>当前筛选条件下无相关数据<br />建议调整筛选条件后重试</div>
        <Button size="small" style={{ marginTop: '14px' }} onClick={onClearFilters}>清空筛选条件</Button>
      </div>
    )}
  </div>
);

// --- 指标管理抽屉 (对应 Figma「指标管理」「指标管理-搜索」帧) ---
const MetricsDrawer = ({ open, onClose }) => {
  const ctx = useContext(DashboardContext);
  const [q, setQ] = useState('');
  const [cat, setCat] = useState('cost');
  const list = ctx.dash.lists[ctx.tabKey] || [];
  const kw = q.trim();
  const shown = kw ? METRICS.filter(m => m.title.toLowerCase().includes(kw.toLowerCase())) : METRICS;
  // 按分类分节展示；搜索时只显示命中的分类
  const sections = CATS
    .map(c => ({ ...c, items: shown.filter(m => m.cat === c.key) }))
    .filter(s => s.items.length > 0 && (kw ? true : s.key === cat));
  const added = (k) => list.includes(k);
  return (
    <Drawer title="指标管理" open={open} onClose={() => { setQ(''); onClose(); }} width={480} styles={{ body: { padding: '16px 20px' } }}>
      <Input
        allowClear prefix={<SearchOutlined style={{ color: '#94a3b8' }} />}
        placeholder="搜索指标名称" value={q} onChange={e => setQ(e.target.value)}
        style={{ marginBottom: '16px' }}
      />
      <div style={{ display: 'flex', gap: '16px' }}>
        <div style={{ width: '96px', flexShrink: 0 }}>
          {CATS.map(c => (
            <div key={c.key} onClick={() => { setCat(c.key); setQ(''); }}
              className={`drawer-cat ${!kw && cat === c.key ? 'active' : ''}`}>{c.label}</div>
          ))}
        </div>
        <div style={{ flex: 1, maxHeight: 'calc(100vh - 180px)', overflowY: 'auto' }}>
          {sections.length === 0 && (
            <div style={{ textAlign: 'center', padding: '80px 0', color: '#94a3b8' }}>
              <InboxOutlined style={{ fontSize: '40px', color: '#cbd5e1' }} />
              <div style={{ marginTop: '12px', fontSize: '13px', color: '#1e293b', fontWeight: 600 }}>暂无匹配指标</div>
              <div style={{ marginTop: '4px', fontSize: '12px' }}>请更换关键词后重新搜索</div>
            </div>
          )}
          {sections.map(s => (
            <div key={s.key} style={{ marginBottom: '12px' }}>
              {kw && <div style={{ fontSize: '12px', color: '#94a3b8', margin: '4px 0 8px', textAlign: 'center' }}>—— {s.label} ——</div>}
              {s.items.map(m => (
                <div key={m.key} className={`drawer-metric ${added(m.key) ? 'added' : ''}`}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '13px', fontWeight: 600, color: '#1e293b' }}>{m.title}</div>
                    <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '2px', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{m.desc}</div>
                  </div>
                  {added(m.key) ? (
                    <span className="drawer-metric-btn on" title="从当前看板移除" onClick={() => ctx.drawerRemove(m.key)}><CheckOutlined /></span>
                  ) : (
                    <span className="drawer-metric-btn" title="添加到当前看板" onClick={() => ctx.drawerAdd(m.key)}><PlusOutlined /></span>
                  )}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </Drawer>
  );
};

// --- 分组管理弹窗 (对应 Figma「管理分组」「删除分组 二次确认」帧) ---
const GroupManageModal = ({ open, onClose }) => {
  const ctx = useContext(DashboardContext);
  const [draft, setDraftGroups] = useState([]);
  const [sel, setSel] = useState(null);
  const [dragIdx, setDragIdx] = useState(null);
  useEffect(() => {
    if (open) {
      const gs = cloneDash(ctx.dash.groups);
      setDraftGroups(gs);
      setSel(gs[0]?.id ?? null);
    }
  }, [open]); // eslint-disable-line react-hooks/exhaustive-deps
  const selGroup = draft.find(g => g.id === sel);
  const create = () => {
    const id = 'grp_' + Date.now();
    // 默认名称顺延：自定义分组 1、自定义分组 2 …，跳过已被占用的名称（分组名称不可重复）
    let n = 1;
    while (draft.some(g => g.name.trim() === `自定义分组 ${n}`)) n++;
    setDraftGroups([...draft, { id, name: `自定义分组 ${n}` }]);
    setSel(id);
  };
  const remove = (id) => {
    const next = draft.filter(g => g.id !== id);
    setDraftGroups(next);
    if (sel === id) setSel(next[0]?.id ?? null);
  };
  const rename = (v) => setDraftGroups(draft.map(g => g.id === sel ? { ...g, name: v } : g));
  const onDrop = (i) => {
    if (dragIdx === null || dragIdx === i) return;
    const next = [...draft];
    const [moved] = next.splice(dragIdx, 1);
    next.splice(i, 0, moved);
    setDraftGroups(next);
    setDragIdx(null);
  };
  // 分组名称不可重复（忽略首尾空格）；重名或空名时禁止保存
  const isDupName = (g) => draft.some(o => o.id !== g.id && o.name.trim() === g.name.trim() && g.name.trim());
  const canSave = draft.every(g => g.name.trim().length > 0 && !isDupName(g));
  return (
    <Modal title="分组管理" open={open} onCancel={onClose} width={640}
      footer={[
        <Button key="c" onClick={onClose}>取消</Button>,
        <Button key="s" type="primary" disabled={!canSave} onClick={() => { ctx.saveGroups(draft); onClose(); }}>保存</Button>,
      ]}>
      <div style={{ display: 'flex', gap: '16px', minHeight: '260px', marginTop: '12px' }}>
        <div style={{ width: '220px', flexShrink: 0, display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {draft.map((g, i) => (
            <div key={g.id} draggable
              onDragStart={() => setDragIdx(i)} onDragOver={e => e.preventDefault()} onDrop={() => onDrop(i)}
              onClick={() => setSel(g.id)}
              className={`group-item ${sel === g.id ? 'active' : ''}`}>
              <HolderOutlined style={{ color: '#94a3b8', cursor: 'grab' }} />
              <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{g.name || '未命名分组'}</span>
              <Popconfirm
                title="删除分组后"
                description="组内所有指标看板会同步移除"
                okText="删除" cancelText="取消" okButtonProps={{ danger: true }}
                onConfirm={() => remove(g.id)}>
                <CloseOutlined style={{ color: '#94a3b8', cursor: 'pointer', fontSize: '11px' }} onClick={e => e.stopPropagation()} />
              </Popconfirm>
            </div>
          ))}
          <Button type="dashed" icon={<PlusOutlined />} onClick={create} style={{ marginTop: '4px' }}>创建分组</Button>
        </div>
        <div style={{ flex: 1, background: '#f8fafc', borderRadius: '8px', padding: '16px' }}>
          {selGroup ? (
            <>
              <div style={{ fontSize: '13px', marginBottom: '8px' }}>分组名称 <span style={{ color: '#ff4d4f' }}>*</span></div>
              <Input value={selGroup.name} maxLength={15} showCount
                status={isDupName(selGroup) ? 'error' : undefined}
                onChange={e => rename(e.target.value)} placeholder="输入分组名称" />
              {isDupName(selGroup) && (
                <div style={{ color: '#ff4d4f', fontSize: '12px', marginTop: '4px' }}>分组名称不可重复，请修改后再保存</div>
              )}
            </>
          ) : (
            <div style={{ color: '#94a3b8', fontSize: '13px', paddingTop: '40px', textAlign: 'center' }}>暂无分组，点击左侧「创建分组」新建</div>
          )}
        </div>
      </div>
    </Modal>
  );
};

// --- 轻提示 (带撤销)，对应 Figma「尚未保存提醒」帧右侧的 toast ---
const ToastStack = ({ toasts, onUndo, onClose }) => (
  <div className="toast-stack">
    {toasts.map(t => (
      <div key={t.id} className="toast-item">
        <span>{t.msg}</span>
        {t.undo && <a onClick={() => onUndo(t)} style={{ marginLeft: '12px', fontWeight: 600 }}>撤销</a>}
        <span className="toast-x" onClick={() => onClose(t.id)}>×</span>
      </div>
    ))}
  </div>
);

// 兜底层：从 localStorage 恢复自定义区间时，保留期每天滚动，历史上合法的区间可能已越界。
// 越界产生的提示先暂存在此，挂载后由 useEffect 经 message 弹出（红线：绝不静默显示截断后的部分数据）
let restoreRangeNotice = null;

const App = () => {
  // tab / 时间窗口默认保留：从 localStorage 恢复，手动刷新不会重置选中的 tab
  const [activeTab, setActiveTab] = useState(() => localStorage.getItem('ob_activeTab') || 'overview');
  const [timeRange, setTimeRange] = useState(() => {
    const v = localStorage.getItem('ob_timeRange') || '30d';
    // 时间窗收敛为 近1小时/近1天/近30天/自定义 (对齐 Figma)，旧值 3d/7d 归入近30天
    return ['1h', '24h', '30d', 'custom'].includes(v) ? v : '30d';
  });
  const [customRange, setCustomRange] = useState(() => {
    const stored = localStorage.getItem('ob_customRange');
    if (stored) {
      try {
        const arr = JSON.parse(stored);
        const [s, e] = [dayjs(arr[0]), dayjs(arr[1])];
        const min = retentionStart();
        // 完全越界：清空区间，提示重新选择（时间窗仍停留在「自定义」，引导用户重选）
        if (e.isBefore(min)) {
          restoreRangeNotice = `上次的自定义时间范围已超出 ${RETENTION_YEARS} 年数据保留期，请重新选择`;
          return null;
        }
        // 部分越界：起始日截断到最早可查日期，并明确告知（不静默展示部分数据）
        if (s.isBefore(min)) {
          restoreRangeNotice = `起始日期已超出 ${RETENTION_YEARS} 年数据保留期，已调整为 ${min.format('YYYY-MM-DD')}`;
          return [min, e];
        }
        return [s, e];
      } catch {
        return null;
      }
    }
    return null;
  });
  const rangeLabel = timeRange === 'custom' && customRange && customRange[0] && customRange[1]
    ? `数据来自 ${customRange[0].format('YYYY年MM月DD日')} 至 ${customRange[1].format('YYYY年MM月DD日')}`
    : (RANGE_LABELS[timeRange] || '数据来自 05月03日 至 06月01日');

  // 恢复态越界提示：挂载后弹一次
  useEffect(() => {
    if (restoreRangeNotice) { message.warning(restoreRangeNotice, 5); restoreRangeNotice = null; }
  }, []);

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

  // ===== 仪表盘自定义布局 (指标管理 / 编辑模式 / 分组 / 加载态) =====
  const [dash, setDash] = useState(() => {
    try {
      const s = localStorage.getItem('ob_dash_v1');
      if (s) { const d = JSON.parse(s); if (d.lists && d.groups) return d; }
    } catch { /* ignore */ }
    return cloneDash(DEFAULT_DASH);
  });
  useEffect(() => { localStorage.setItem('ob_dash_v1', JSON.stringify(dash)); }, [dash]);

  const [draft, setDraft] = useState(null);              // 编辑模式草稿 (null = 非编辑态)
  const editMode = draft !== null;
  const effDash = editMode ? draft : dash;
  const dirty = editMode && JSON.stringify(draft) !== JSON.stringify(dash);
  const [selected, setSelected] = useState([]);          // 编辑态勾选的卡片 key
  const [drawerOpen, setDrawerOpen] = useState(false);   // 指标管理抽屉
  const [groupOpen, setGroupOpen] = useState(false);     // 分组管理弹窗
  const [unsavedOpen, setUnsavedOpen] = useState(false); // 「有未保存内容」确认
  const [resetOpen, setResetOpen] = useState(false);     // 「重置默认布局」确认
  const [toasts, setToasts] = useState([]);              // 带撤销的轻提示
  const [loadTick, setLoadTick] = useState(0);           // 数据加载模拟 (刷新/切时间窗 +1)

  // 当前 tab 可能是固定 tab 或自定义分组 id；分组被删除后回退到总览
  const tabKey = (FIXED_TABS.some(t => t.key === activeTab) || effDash.groups.some(g => g.id === activeTab)) ? activeTab : 'overview';
  const visibleKeys = effDash.lists[tabKey] || [];

  const pushToast = (msg, undo) => {
    const id = Date.now() + Math.random();
    setToasts(ts => [...ts, { id, msg, undo }]);
    setTimeout(() => setToasts(ts => ts.filter(t => t.id !== id)), 6000);
  };
  // 布局变更统一入口：编辑态写草稿，非编辑态直接生效；均支持 toast 撤销
  const applyChange = (fn, msg) => {
    const target = editMode ? draft : dash;
    const before = cloneDash(target);
    const setter = editMode ? setDraft : setDash;
    setter(fn(cloneDash(target)));
    if (msg) pushToast(msg, () => setter(before));
  };
  const titleOf = (keys) => keys.length === 1 ? `“${METRIC_MAP[keys[0]]?.title}”` : `${keys.length} 个指标`;

  const dashApi = {
    dash: effDash, editMode, tabKey, selected, loadTick,
    toggleSelect: (k) => setSelected(s => s.includes(k) ? s.filter(x => x !== k) : [...s, k]),
    setCardSize: (k, size) => applyChange(d => {
      (d.sizes[tabKey] = d.sizes[tabKey] || {})[k] = size;
      return d;
    }),
    // 移动规则：目标分组已存在同一组件 → 移动失败并提示；其余卡片移动到目标分组末尾，
    // 并保留其在源分组的尺寸规格（各分组尺寸独立，同一指标在不同分组尺寸不同无需额外处理）
    moveCard: (keys, target) => {
      const targetList = effDash.lists[target] || [];
      const dup = keys.filter(k => targetList.includes(k));
      const ok = keys.filter(k => !targetList.includes(k));
      if (dup.length) pushToast('移动失败，指标组件已存在于目标分组');
      if (ok.length) {
        applyChange(d => {
          d.lists[tabKey] = (d.lists[tabKey] || []).filter(x => !ok.includes(x));
          d.lists[target] = d.lists[target] || [];
          d.sizes[target] = d.sizes[target] || {};
          ok.forEach(k => {
            d.lists[target].push(k); // 位置处于目标分组最后
            const s = (d.sizes[tabKey] || {})[k];
            if (s) d.sizes[target][k] = s; // 保留卡片尺寸规格
          });
          return d;
        }, `已移动至“${TAB_LABEL(effDash, target)}”`);
        setSelected(s => s.filter(x => !ok.includes(x)));
      }
    },
    removeCards: (keys) => {
      applyChange(d => {
        d.lists[tabKey] = (d.lists[tabKey] || []).filter(x => !keys.includes(x));
        return d;
      }, `已移除${titleOf(keys)}`);
      setSelected(s => s.filter(x => !keys.includes(x)));
    },
    drawerAdd: (k) => applyChange(d => {
      d.lists[tabKey] = d.lists[tabKey] || [];
      if (!d.lists[tabKey].includes(k)) d.lists[tabKey].push(k);
      return d;
    }, `已添加“${METRIC_MAP[k]?.title}”`),
    drawerRemove: (k) => applyChange(d => {
      d.lists[tabKey] = (d.lists[tabKey] || []).filter(x => x !== k);
      return d;
    }, `已移除“${METRIC_MAP[k]?.title}”`),
    saveGroups: (nextGroups) => {
      applyChange(d => {
        const removed = d.groups.filter(g => !nextGroups.some(n => n.id === g.id));
        removed.forEach(g => { delete d.lists[g.id]; delete d.sizes[g.id]; });
        nextGroups.forEach(g => { d.lists[g.id] = d.lists[g.id] || []; });
        d.groups = nextGroups;
        return d;
      }, '分组已保存');
    },
  };

  // 编辑模式进入 / 保存 / 取消 (含未保存保护) / 重置默认布局
  const enterEdit = () => { setDraft(cloneDash(dash)); setSelected([]); };
  const saveEdit = () => { setDash(cloneDash(draft)); setDraft(null); setSelected([]); pushToast('布局已保存'); };
  const cancelEdit = () => { if (dirty) setUnsavedOpen(true); else { setDraft(null); setSelected([]); } };
  const discardEdit = () => { setDraft(null); setSelected([]); setUnsavedOpen(false); };
  const doReset = () => {
    setResetOpen(false);
    applyChange(d => {
      const next = cloneDash(DEFAULT_DASH);
      next.groups = d.groups;
      d.groups.forEach(g => { next.lists[g.id] = []; });
      return next;
    }, '已重置为默认布局');
  };

  // 「移动至」目标 (编辑工具栏 / 卡片菜单共用)
  const moveTargets = [
    ...FIXED_TABS.filter(t => t.key !== tabKey).map(t => ({ key: t.key, label: t.label })),
    ...effDash.groups.filter(g => g.id !== tabKey).map(g => ({ key: g.id, label: g.name })),
  ];

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

  // 当前 tab 内容：空列表走缺省页 (对应 Figma「分组缺省页」)，否则按指标列表渲染
  const renderActiveView = () => visibleKeys.length === 0
    ? <EmptyBoard onAdd={() => setDrawerOpen(true)} hasFilters={filters.length > 0} onClearFilters={() => setFilters([])} />
    : <MetricGrid keys={visibleKeys} />;

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
            {/* 标题行 + 右上角操作 (对应 Figma: 指标管理 / 自定义布局；编辑态换为 重置默认布局 / 取消 / 保存) */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px' }}>
              <div>
                <h1 className="page-title">仪表盘</h1>
                <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '2px' }}>多维数据分析，自由玩转随心布局，自定义你的专属看板布局</div>
              </div>
              <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
                <Button icon={<UnorderedListOutlined />} onClick={() => setDrawerOpen(true)}>指标管理</Button>
                {!editMode ? (
                  <Button type="primary" icon={<EditOutlined />} onClick={enterEdit}>自定义布局</Button>
                ) : (
                  <>
                    <Button onClick={() => setResetOpen(true)}>重置默认布局</Button>
                    <Button onClick={cancelEdit}>取消</Button>
                    <Button type="primary" onClick={saveEdit}>保存</Button>
                  </>
                )}
              </div>
            </div>

            {/* tab 行：固定 tab + 自定义分组 tab + 分组管理入口；编辑态右侧出现批量工具栏 */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div className="nav-tabs" style={{ overflowX: 'auto', paddingBottom: '2px', flex: 1, minWidth: 0 }}>
                {FIXED_TABS.map(t => (
                  <div key={t.key} className={`nav-tab ${tabKey === t.key ? 'active' : ''}`} onClick={() => setActiveTab(t.key)}>{t.icon} {t.label}</div>
                ))}
                {effDash.groups.map(g => (
                  <div key={g.id} className={`nav-tab ${tabKey === g.id ? 'active' : ''}`} onClick={() => setActiveTab(g.id)}><TagOutlined /> {g.name}</div>
                ))}
                <div className="nav-tab" title="管理分组" onClick={() => setGroupOpen(true)}><EditOutlined /></div>
              </div>
              {editMode && (
                <div className="edit-toolbar">
                  <Checkbox
                    checked={visibleKeys.length > 0 && selected.length === visibleKeys.length}
                    indeterminate={selected.length > 0 && selected.length < visibleKeys.length}
                    onChange={e => setSelected(e.target.checked ? [...visibleKeys] : [])}>全选</Checkbox>
                  <span style={{ color: '#64748b', fontSize: '12px', whiteSpace: 'nowrap' }}>已选 {selected.length}</span>
                  <Dropdown disabled={!selected.length} trigger={['click']}
                    menu={{ items: moveTargets, onClick: ({ key }) => dashApi.moveCard(selected, key) }}>
                    <Button size="small" disabled={!selected.length}>移动</Button>
                  </Dropdown>
                  <Button size="small" danger disabled={!selected.length} onClick={() => dashApi.removeCards(selected)}>移除</Button>
                </div>
              )}
            </div>
          </header>

          <main className="main-content">
            <div className="filters-bar">
              <button title="刷新数据" onClick={() => setLoadTick(t => t + 1)}
                style={{ background: '#fff', border: '1px solid #e2e8f0', padding: '6px 10px', borderRadius: '6px', cursor: 'pointer', color: '#1677ff' }}>
                <SyncOutlined />
              </button>
              <FilterBar filters={filters} setFilters={setFilters} />
              <TimeFilter selected={timeRange}
                setSelected={(v) => { setTimeRange(v); setLoadTick(t => t + 1); }}
                customRange={customRange}
                setCustomRange={(d) => { setCustomRange(d); setLoadTick(t => t + 1); }} />
            </div>
            {renderActiveView()}
          </main>

          {/* 指标管理抽屉 / 分组管理 / 未保存提醒 / 重置确认 */}
          <MetricsDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />
          <GroupManageModal open={groupOpen} onClose={() => setGroupOpen(false)} />
          <Modal title="有未保存内容" open={unsavedOpen} onCancel={() => setUnsavedOpen(false)} width={400}
            footer={[
              <Button key="d" onClick={discardEdit}>放弃</Button>,
              <Button key="k" type="primary" onClick={() => setUnsavedOpen(false)}>继续编辑</Button>,
            ]}>
            当前指标卡片修改尚未保存，退出会清空所有改动
          </Modal>
          <Modal title="重置默认布局" open={resetOpen} onCancel={() => setResetOpen(false)} width={400}
            footer={[
              <Button key="c" onClick={() => setResetOpen(false)}>取消</Button>,
              <Button key="r" type="primary" onClick={doReset}>确认重置</Button>,
            ]}>
            重置后将恢复为系统默认的卡片排版，您当前自定义的布局将被清除
          </Modal>
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
      <DashboardContext.Provider value={dashApi}>
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
      {/* 操作轻提示 (带撤销) */}
      <ToastStack toasts={toasts}
        onUndo={(t) => { t.undo && t.undo(); setToasts(ts => ts.filter(x => x.id !== t.id)); }}
        onClose={(id) => setToasts(ts => ts.filter(t => t.id !== id))} />
      </DashboardContext.Provider>
      </FiltersContext.Provider>
      </FilterContext.Provider>
    </TimeRangeContext.Provider>
  );
};

export default App;
