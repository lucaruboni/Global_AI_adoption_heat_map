import { useAppStore } from '../stores/useAppStore';
import type { BarRow, GlobeViewModel } from '../lib/globe/compute';
import { bar, glassPanel, monoLabel, track } from './ui';

const rowLabel: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  fontSize: 12.5,
  marginBottom: 4,
};

const mono11sub: React.CSSProperties = {
  fontFamily: "'IBM Plex Mono',monospace",
  fontSize: 11,
  color: 'var(--sub)',
};

const mono11acc: React.CSSProperties = {
  fontFamily: "'IBM Plex Mono',monospace",
  fontSize: 11,
  color: 'var(--acc)',
};

function BarList({ rows, gradient }: { rows: BarRow[]; gradient?: boolean }): React.ReactElement {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {rows.map((g) => (
        <div key={g.name}>
          <div style={rowLabel}>
            <span
              style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
            >
              {g.name}
            </span>
            <span style={gradient ? mono11sub : mono11acc}>{g.shareF}</span>
          </div>
          <div style={{ ...track, height: 5 }}>
            <div style={bar(g.pct, gradient)} />
          </div>
        </div>
      ))}
    </div>
  );
}

interface ChartsPanelProps {
  vm: GlobeViewModel;
}

export function ChartsPanel({ vm }: ChartsPanelProps): React.ReactElement {
  const year = useAppStore((s) => s.year);

  return (
    <div
      style={{
        position: 'absolute',
        right: 16,
        top: 88,
        bottom: 100,
        width: 'min(300px,88vw)',
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
        overflowY: 'auto',
        zIndex: 6,
      }}
    >
      <div style={glassPanel}>
        <div style={{ ...monoLabel, marginBottom: 12 }}>Usage by region · {year}</div>
        <BarList rows={vm.regions} gradient />
      </div>

      <div style={glassPanel}>
        <div style={{ ...monoLabel, marginBottom: 12 }}>How it&apos;s used</div>
        <BarList rows={vm.useCases} />
        <div style={{ marginTop: 14, paddingTop: 12, borderTop: '1px solid var(--pb)' }}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              fontFamily: "'IBM Plex Mono',monospace",
              fontSize: 10,
              color: 'var(--sub)',
              marginBottom: 5,
            }}
          >
            <span>automation {vm.automF}</span>
            <span>augmentation {vm.augmF}</span>
          </div>
          <div
            style={{
              height: 6,
              borderRadius: 99,
              background: 'var(--track)',
              overflow: 'hidden',
              display: 'flex',
            }}
          >
            <div style={{ width: `${vm.automPct}%`, background: 'var(--acc)' }} />
            <div style={{ flex: 1, background: 'var(--acc2)', opacity: 0.45 }} />
          </div>
        </div>
      </div>

      <div style={glassPanel}>
        <div style={{ ...monoLabel, marginBottom: 12 }}>Top request topics</div>
        <BarList rows={vm.topics} />
      </div>
    </div>
  );
}
