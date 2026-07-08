import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip as ReTooltip,
  XAxis,
  YAxis,
} from 'recharts';
import type {
  GlobalHistoryPoint,
  HardwareSalesPoint,
  RegionalAggregation,
  StockSeries,
} from '@shared/index';
import { useCountries } from '../hooks/useCountries';
import { countryService } from '../services/countryService';
import { stockService } from '../services/stockService';
import { hardwareService } from '../services/hardwareService';
import { githubService, type GithubStats } from '../services/githubService';
import { StatTile } from '../components/StatTile';
import { glassPanel, monoLabel } from '../components/ui';
import { toGlobeCountries } from '../lib/globe/types';

const ACCENT = '#ffa42e';
const AXIS = '#8b94a3';

const chartTooltipStyle = {
  background: 'rgba(13,16,22,.95)',
  border: '1px solid rgba(255,255,255,.12)',
  borderRadius: 10,
  fontFamily: "'IBM Plex Mono',monospace",
  fontSize: 12,
};

export function DashboardPage(): React.ReactElement {
  const { countries, loading } = useCountries();
  const [regions, setRegions] = useState<RegionalAggregation[]>([]);
  const [history, setHistory] = useState<GlobalHistoryPoint[]>([]);
  const [stocks, setStocks] = useState<StockSeries[]>([]);
  const [hardware, setHardware] = useState<HardwareSalesPoint[]>([]);
  const [github, setGithub] = useState<GithubStats | null>(null);

  useEffect(() => {
    void countryService.regions().then(setRegions).catch(() => setRegions([]));
    void countryService.globalHistory().then(setHistory).catch(() => setHistory([]));
    void stockService.list().then(setStocks).catch(() => setStocks([]));
    void hardwareService.list().then(setHardware).catch(() => setHardware([]));
    void githubService.getStats().then(setGithub);
  }, []);

  const globe = useMemo(() => toGlobeCountries(countries), [countries]);

  const topCountries = useMemo(
    () =>
      [...globe]
        .sort((a, b) => b.usage - a.usage)
        .slice(0, 15)
        .map((c) => ({ name: c.iso3, full: c.name, usage: Number(c.usage.toFixed(2)) })),
    [globe]
  );

  const regionData = useMemo(
    () =>
      regions.map((r) => ({
        name: r.region,
        usage: Number(r.totalUsagePct.toFixed(2)),
      })),
    [regions]
  );

  const globalTotal = useMemo(
    () => globe.reduce((s, c) => s + c.usage, 0),
    [globe]
  );

  const historyData = useMemo(
    () =>
      history.map((h) => ({
        year: h.snapshotDate.slice(0, 4),
        usage: Number(h.totalUsagePct.toFixed(1)),
      })),
    [history]
  );

  const stockData = useMemo(
    () =>
      [...stocks]
        .filter((s) => s.latestMarketCap !== null)
        .sort((a, b) => (b.latestMarketCap ?? 0) - (a.latestMarketCap ?? 0))
        .map((s) => ({
          name: s.symbol,
          full: s.name,
          marketCap: Number(((s.latestMarketCap ?? 0) / 1e12).toFixed(2)),
        })),
    [stocks]
  );

  const hardwareData = useMemo(
    () =>
      hardware.map((h) => ({
        year: h.dateRecorded.slice(0, 4),
        gpuM: Number((((h.gpuSalesUnits ?? 0) / 1e6)).toFixed(0)),
      })),
    [hardware]
  );

  return (
    <div
      style={{
        height: '100vh',
        background: 'var(--bg)',
        color: 'var(--ink)',
        fontFamily: "'Space Grotesk',Helvetica,Arial,sans-serif",
        overflowY: 'auto',
        padding: '24px clamp(16px, 4vw, 48px)',
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 24, flexWrap: 'wrap' }}>
        <Link
          to="/"
          style={{
            ...glassPanel,
            padding: '9px 14px',
            borderRadius: 99,
            fontFamily: "'IBM Plex Mono',monospace",
            fontSize: 11,
            color: 'var(--ink)',
            textDecoration: 'none',
          }}
        >
          ← GLOBE
        </Link>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, margin: 0 }}>Dashboard</h1>
          <div style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 11, color: 'var(--sub)' }}>
            Global AI adoption · data + project metrics
          </div>
        </div>
      </div>

      {/* KPI tiles */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: 12,
          marginBottom: 24,
        }}
      >
        <StatTile label="Countries tracked" value={loading ? '…' : String(globe.length)} accent />
        <StatTile
          label="Global usage (sum)"
          value={loading ? '…' : `${globalTotal.toFixed(0)}%`}
          hint="sum of country shares"
        />
        <StatTile label="Regions" value={loading ? '…' : String(regionData.length)} />
        <StatTile
          label="Data period"
          value="2026-05"
          hint="Anthropic Economic Index"
        />
      </div>

      {/* Time-series + stocks */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
          gap: 16,
          marginBottom: 24,
        }}
      >
        <div style={glassPanel}>
          <div style={{ ...monoLabel, marginBottom: 16 }}>
            Global AI adoption over time · 2023→2026
          </div>
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={historyData} margin={{ left: 0, right: 8 }}>
              <defs>
                <linearGradient id="usageFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={ACCENT} stopOpacity={0.5} />
                  <stop offset="100%" stopColor={ACCENT} stopOpacity={0.03} />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} stroke="rgba(255,255,255,.06)" />
              <XAxis dataKey="year" stroke={AXIS} tick={{ fontSize: 11 }} />
              <YAxis stroke={AXIS} tick={{ fontSize: 11 }} unit="%" />
              <ReTooltip
                contentStyle={chartTooltipStyle}
                formatter={(v: number) => [`${v}%`, 'total usage share']}
              />
              <Area
                type="monotone"
                dataKey="usage"
                stroke={ACCENT}
                strokeWidth={2}
                fill="url(#usageFill)"
                isAnimationActive={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div style={glassPanel}>
          <div style={{ ...monoLabel, marginBottom: 16 }}>
            AI &amp; cloud company market cap · latest ($T)
          </div>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={stockData} margin={{ left: 0, right: 8 }}>
              <CartesianGrid vertical={false} stroke="rgba(255,255,255,.06)" />
              <XAxis dataKey="name" stroke={AXIS} tick={{ fontSize: 11 }} interval={0} />
              <YAxis stroke={AXIS} tick={{ fontSize: 11 }} unit="T" />
              <ReTooltip
                contentStyle={chartTooltipStyle}
                cursor={{ fill: 'rgba(255,164,46,.08)' }}
                formatter={(v: number, _n, p) => [`$${v}T`, (p.payload as { full: string }).full]}
              />
              <Bar dataKey="marketCap" fill={ACCENT} radius={[4, 4, 0, 0]} isAnimationActive={false} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div style={glassPanel}>
          <div style={{ ...monoLabel, marginBottom: 16 }}>
            AI-capable GPUs shipped · millions/yr
          </div>
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={hardwareData} margin={{ left: 0, right: 8 }}>
              <defs>
                <linearGradient id="gpuFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={ACCENT} stopOpacity={0.5} />
                  <stop offset="100%" stopColor={ACCENT} stopOpacity={0.03} />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} stroke="rgba(255,255,255,.06)" />
              <XAxis dataKey="year" stroke={AXIS} tick={{ fontSize: 11 }} />
              <YAxis stroke={AXIS} tick={{ fontSize: 11 }} unit="M" />
              <ReTooltip
                contentStyle={chartTooltipStyle}
                formatter={(v: number) => [`${v}M units`, 'GPUs shipped']}
              />
              <Area
                type="monotone"
                dataKey="gpuM"
                stroke={ACCENT}
                strokeWidth={2}
                fill="url(#gpuFill)"
                isAnimationActive={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Charts */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
          gap: 16,
          marginBottom: 24,
        }}
      >
        <div style={glassPanel}>
          <div style={{ ...monoLabel, marginBottom: 16 }}>AI usage share by region</div>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={regionData} layout="vertical" margin={{ left: 8, right: 16 }}>
              <CartesianGrid horizontal={false} stroke="rgba(255,255,255,.06)" />
              <XAxis type="number" stroke={AXIS} tick={{ fontSize: 11 }} unit="%" />
              <YAxis
                type="category"
                dataKey="name"
                stroke={AXIS}
                tick={{ fontSize: 11 }}
                width={110}
              />
              <ReTooltip
                contentStyle={chartTooltipStyle}
                cursor={{ fill: 'rgba(255,164,46,.08)' }}
                formatter={(v: number) => [`${v}%`, 'usage share']}
              />
              <Bar dataKey="usage" fill={ACCENT} radius={[0, 4, 4, 0]} isAnimationActive={false} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div style={glassPanel}>
          <div style={{ ...monoLabel, marginBottom: 16 }}>Top 15 countries by usage share</div>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={topCountries} margin={{ left: 0, right: 8 }}>
              <CartesianGrid vertical={false} stroke="rgba(255,255,255,.06)" />
              <XAxis dataKey="name" stroke={AXIS} tick={{ fontSize: 10 }} interval={0} />
              <YAxis stroke={AXIS} tick={{ fontSize: 11 }} unit="%" />
              <ReTooltip
                contentStyle={chartTooltipStyle}
                cursor={{ fill: 'rgba(255,164,46,.08)' }}
                formatter={(v: number, _n, p) => [`${v}%`, (p.payload as { full: string }).full]}
              />
              <Bar dataKey="usage" fill={ACCENT} radius={[4, 4, 0, 0]} isAnimationActive={false} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Project / GitHub metrics */}
      <div style={glassPanel}>
        <div style={{ ...monoLabel, marginBottom: 16 }}>Project metrics · open source</div>
        {github ? (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
              gap: 12,
            }}
          >
            <StatTile label="★ Stars" value={String(github.stars)} accent />
            <StatTile label="Forks" value={String(github.forks)} />
            <StatTile label="Watchers" value={String(github.watchers)} />
            <StatTile label="Open issues" value={String(github.openIssues)} />
          </div>
        ) : (
          <div style={{ fontSize: 13, color: 'var(--sub)', lineHeight: 1.6 }}>
            Connect a GitHub repository to show live stars, forks and contributors here.
            <br />
            Set <code style={{ color: 'var(--acc)' }}>VITE_GITHUB_REPO=owner/repo</code> in{' '}
            <code style={{ color: 'var(--acc)' }}>frontend/.env</code> and reload.
          </div>
        )}
      </div>
    </div>
  );
}
