import { useMemo, useState } from 'react';
import { Globe } from '../components/Globe';
import { Header } from '../components/Header';
import { StatsPanel } from '../components/StatsPanel';
import { ChartsPanel } from '../components/ChartsPanel';
import { CountryCard } from '../components/CountryCard';
import { TimeSlider } from '../components/TimeSlider';
import { Tooltip } from '../components/Tooltip';
import { DownloadModal } from '../components/DownloadModal';
import { useCountries } from '../hooks/useCountries';
import { useAppStore } from '../stores/useAppStore';
import { buildViewModel } from '../lib/globe/compute';
import { toGlobeCountries, type GlobeCountry } from '../lib/globe/types';

interface HoverState {
  country: GlobeCountry | null;
  x: number;
  y: number;
}

export function GlobePage(): React.ReactElement {
  const { countries, loading, error } = useCountries();
  const year = useAppStore((s) => s.year);
  const selectedIso = useAppStore((s) => s.selectedIso);
  const downloadOpen = useAppStore((s) => s.downloadOpen);
  const [hover, setHover] = useState<HoverState>({ country: null, x: 0, y: 0 });

  const globeCountries = useMemo(() => toGlobeCountries(countries), [countries]);
  const vm = useMemo(() => buildViewModel(globeCountries, year), [globeCountries, year]);
  const selected = useMemo(
    () => globeCountries.find((c) => c.iso3 === selectedIso) ?? null,
    [globeCountries, selectedIso]
  );

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'var(--bg)',
        color: 'var(--ink)',
        fontFamily: "'Space Grotesk',Helvetica,Arial,sans-serif",
        overflow: 'hidden',
        userSelect: 'none',
      }}
    >
      {/* Radial glow behind the globe */}
      <div
        style={{
          position: 'absolute',
          left: '50%',
          top: '50%',
          width: '78vmin',
          height: '78vmin',
          transform: 'translate(-50%,-50%)',
          borderRadius: '50%',
          background: 'radial-gradient(circle, var(--glow) 0%, transparent 62%)',
          pointerEvents: 'none',
        }}
      />

      <Globe countries={countries} onHover={(country, x, y) => setHover({ country, x, y })} />

      <Header countries={countries} />

      {!loading && !error && globeCountries.length > 0 && (
        <>
          <StatsPanel vm={vm} />
          <ChartsPanel vm={vm} />
        </>
      )}

      {selected && <CountryCard country={selected} />}

      <TimeSlider />

      <Tooltip country={hover.country} x={hover.x} y={hover.y} year={year} />

      {/* Footer / attribution */}
      <div
        style={{
          position: 'absolute',
          left: 18,
          bottom: 22,
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          fontFamily: "'IBM Plex Mono',monospace",
          fontSize: 10,
          color: 'var(--sub)',
          zIndex: 7,
        }}
      >
        <span>data: Anthropic Economic Index · CC-BY · pre-2026 backcast estimated</span>
      </div>

      {loading && (
        <div style={centerNotice}>Loading global AI data…</div>
      )}
      {error && (
        <div style={{ ...centerNotice, color: '#ff6b6b' }}>
          Could not reach the API — is the backend running? ({error})
        </div>
      )}

      {downloadOpen && <DownloadModal />}
    </div>
  );
}

const centerNotice: React.CSSProperties = {
  position: 'absolute',
  left: '50%',
  top: '46%',
  transform: 'translateX(-50%)',
  fontFamily: "'IBM Plex Mono',monospace",
  fontSize: 13,
  color: 'var(--acc)',
  zIndex: 8,
  textAlign: 'center',
  pointerEvents: 'none',
};
