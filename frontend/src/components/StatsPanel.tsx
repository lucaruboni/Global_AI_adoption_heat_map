import { useAppStore } from '../stores/useAppStore';
import type { GlobeViewModel } from '../lib/globe/compute';
import { bar, glassPanel, monoLabel, track } from './ui';

const chip: React.CSSProperties = {
  background: 'var(--chip)',
  borderRadius: 12,
  padding: '9px 10px',
};

const monoTiny: React.CSSProperties = {
  fontFamily: "'IBM Plex Mono',monospace",
  fontSize: 9,
  color: 'var(--sub)',
};

interface StatsPanelProps {
  vm: GlobeViewModel;
}

export function StatsPanel({ vm }: StatsPanelProps): React.ReactElement {
  const year = useAppStore((s) => s.year);
  const selectCountry = useAppStore((s) => s.selectCountry);

  return (
    <div
      style={{
        position: 'absolute',
        left: 16,
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
        <div style={monoLabel}>Global · {year}</div>
        <div
          style={{
            fontSize: 40,
            fontWeight: 700,
            lineHeight: 1.1,
            marginTop: 6,
            color: 'var(--acc)',
          }}
        >
          {vm.totalF}
        </div>
        <div style={{ fontSize: 12, color: 'var(--sub)', marginTop: 2 }}>
          of global AI usage happens in the top 10 countries
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginTop: 14 }}>
          <div style={chip}>
            <div style={{ fontWeight: 700, fontSize: 15 }}>{vm.workF}</div>
            <div style={monoTiny}>work usage</div>
          </div>
          <div style={chip}>
            <div style={{ fontWeight: 700, fontSize: 15 }}>{vm.automF}</div>
            <div style={monoTiny}>automation</div>
          </div>
          <div style={chip}>
            <div style={{ fontWeight: 700, fontSize: 15 }}>{vm.countryCount}</div>
            <div style={monoTiny}>countries</div>
          </div>
        </div>
      </div>

      <div style={glassPanel}>
        <div style={{ ...monoLabel, marginBottom: 12 }}>Top 10 · share of global usage</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
          {vm.top10.map((r) => (
            <div key={r.iso3} onClick={() => selectCountry(r.iso3)} style={{ cursor: 'pointer' }}>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  gap: 8,
                  fontSize: 12.5,
                  marginBottom: 4,
                }}
              >
                <span>
                  <span
                    style={{
                      fontFamily: "'IBM Plex Mono',monospace",
                      color: 'var(--sub)',
                      fontSize: 10,
                      marginRight: 7,
                    }}
                  >
                    {r.rank}
                  </span>
                  {r.name}
                </span>
                <span
                  style={{
                    fontFamily: "'IBM Plex Mono',monospace",
                    color: 'var(--acc)',
                    fontSize: 11,
                  }}
                >
                  {r.usersF}
                </span>
              </div>
              <div style={track}>
                <div style={bar(r.pct)} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
