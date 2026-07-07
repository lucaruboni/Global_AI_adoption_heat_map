import type { GlobeCountry } from '../lib/globe/types';
import { fmtP, usageAt } from '../lib/globe/compute';

interface TooltipProps {
  country: GlobeCountry | null;
  x: number;
  y: number;
  year: number;
}

export function Tooltip({ country, x, y, year }: TooltipProps): React.ReactElement | null {
  if (!country) return null;
  const left = Math.min(x + 16, window.innerWidth - 260);
  const top = Math.min(y + 14, window.innerHeight - 110);

  return (
    <div
      style={{
        position: 'fixed',
        left,
        top,
        zIndex: 30,
        pointerEvents: 'none',
        background: 'var(--panel)',
        border: '1px solid var(--pb)',
        borderRadius: 14,
        padding: '11px 14px',
        backdropFilter: 'blur(12px)',
        boxShadow: '0 12px 30px rgba(0,0,0,.4)',
        maxWidth: 250,
      }}
    >
      <div style={{ fontWeight: 700, fontSize: 14 }}>{country.name}</div>
      <div
        style={{
          fontFamily: "'IBM Plex Mono',monospace",
          fontSize: 10.5,
          color: 'var(--acc)',
          marginTop: 3,
        }}
      >
        {fmtP(usageAt(country, year))} of global usage · {country.aui.toFixed(2)}× per-capita
      </div>
      <div
        style={{
          fontFamily: "'IBM Plex Mono',monospace",
          fontSize: 10,
          color: 'var(--sub)',
          marginTop: 2,
        }}
      >
        top: {country.topic} · tap for details
      </div>
    </div>
  );
}
