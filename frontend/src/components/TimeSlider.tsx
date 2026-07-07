import { MAX_YEAR, MIN_YEAR, useAppStore } from '../stores/useAppStore';
import type { VizMode } from '../lib/globe/themes';

const VIZ_MODES: { key: VizMode; short: string; label: string }[] = [
  { key: 'dots', short: 'DOTS', label: 'Glowing dots sized by usage' },
  { key: 'bars', short: 'BARS', label: '3D bars by usage share' },
  { key: 'heat', short: 'HEAT', label: 'Country heatmap by per-capita index' },
];

const monoSub: React.CSSProperties = {
  fontFamily: "'IBM Plex Mono',monospace",
  fontSize: 11,
  color: 'var(--sub)',
};

export function TimeSlider(): React.ReactElement {
  const year = useAppStore((s) => s.year);
  const setYear = useAppStore((s) => s.setYear);
  const vizMode = useAppStore((s) => s.vizMode);
  const setViz = useAppStore((s) => s.setViz);

  return (
    <div
      style={{
        position: 'absolute',
        left: '50%',
        bottom: 18,
        transform: 'translateX(-50%)',
        width: 'min(680px,94vw)',
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        background: 'var(--panel)',
        border: '1px solid var(--pb)',
        borderRadius: 99,
        padding: '8px 14px 8px 20px',
        backdropFilter: 'blur(14px)',
        zIndex: 7,
        flexWrap: 'wrap',
      }}
    >
      <span style={monoSub}>{MIN_YEAR}</span>
      <input
        type="range"
        min={MIN_YEAR}
        max={MAX_YEAR}
        step={1}
        value={year}
        onChange={(e) => setYear(Number(e.target.value))}
        style={{ flex: 1, minWidth: 120, accentColor: 'var(--acc)', cursor: 'pointer' }}
      />
      <span style={monoSub}>{MAX_YEAR}</span>
      <span
        style={{
          fontWeight: 700,
          fontSize: 17,
          color: 'var(--acc)',
          minWidth: 48,
          textAlign: 'right',
        }}
      >
        {year}
      </span>
      <div style={{ width: 1, height: 22, background: 'var(--pb)' }} />
      <div style={{ display: 'flex', gap: 4 }}>
        {VIZ_MODES.map((v) => {
          const active = v.key === vizMode;
          return (
            <button
              key={v.key}
              onClick={() => setViz(v.key)}
              title={v.label}
              style={{
                border: 'none',
                cursor: 'pointer',
                borderRadius: 99,
                padding: '7px 12px',
                fontFamily: "'IBM Plex Mono',monospace",
                fontSize: 10.5,
                letterSpacing: '.04em',
                background: active ? 'var(--acc)' : 'transparent',
                color: active ? '#14161c' : 'var(--sub)',
                transition: 'background .2s',
              }}
            >
              {v.short}
            </button>
          );
        })}
      </div>
    </div>
  );
}
