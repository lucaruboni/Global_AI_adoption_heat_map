import { glassPanel } from './ui';

interface StatTileProps {
  label: string;
  value: string;
  hint?: string;
  accent?: boolean;
}

/** A KPI stat tile — a headline number, not a chart (per dataviz form guidance). */
export function StatTile({ label, value, hint, accent }: StatTileProps): React.ReactElement {
  return (
    <div style={{ ...glassPanel, padding: 16 }}>
      <div
        style={{
          fontFamily: "'IBM Plex Mono',monospace",
          fontSize: 10,
          letterSpacing: '.12em',
          textTransform: 'uppercase',
          color: 'var(--sub)',
        }}
      >
        {label}
      </div>
      <div
        style={{
          fontSize: 30,
          fontWeight: 700,
          lineHeight: 1.1,
          marginTop: 6,
          color: accent ? 'var(--acc)' : 'var(--ink)',
        }}
      >
        {value}
      </div>
      {hint && (
        <div style={{ fontSize: 11, color: 'var(--sub)', marginTop: 3 }}>{hint}</div>
      )}
    </div>
  );
}
