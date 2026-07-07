import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import type { CountryWithStats } from '@shared/index';
import { useAppStore } from '../stores/useAppStore';
import { THEME_ORDER } from '../lib/globe/themes';
import { fmtP, usageAt } from '../lib/globe/compute';
import { toGlobeCountries } from '../lib/globe/types';

const panel: React.CSSProperties = {
  background: 'var(--panel)',
  border: '1px solid var(--pb)',
  backdropFilter: 'blur(10px)',
};

interface HeaderProps {
  countries: CountryWithStats[];
}

export function Header({ countries }: HeaderProps): React.ReactElement {
  const query = useAppStore((s) => s.query);
  const setQuery = useAppStore((s) => s.setQuery);
  const selectCountry = useAppStore((s) => s.selectCountry);
  const themeName = useAppStore((s) => s.themeName);
  const setTheme = useAppStore((s) => s.setTheme);
  const year = useAppStore((s) => s.year);
  const setDownloadOpen = useAppStore((s) => s.setDownloadOpen);

  const matches = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return toGlobeCountries(countries)
      .filter((c) => c.name.toLowerCase().includes(q))
      .slice(0, 6)
      .map((c) => ({ iso3: c.iso3, name: c.name, usersF: fmtP(usageAt(c, year)) }));
  }, [query, countries, year]);

  return (
    <div
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        display: 'flex',
        alignItems: 'center',
        gap: 14,
        padding: '14px 18px',
        zIndex: 10,
        pointerEvents: 'none',
        flexWrap: 'wrap',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, pointerEvents: 'auto' }}>
        <div
          style={{
            width: 10,
            height: 10,
            borderRadius: '50%',
            background: 'var(--acc)',
            boxShadow: '0 0 14px var(--acc)',
            animation: 'pulse 2.4s ease-in-out infinite',
          }}
        />
        <div>
          <div style={{ fontWeight: 700, fontSize: 17, letterSpacing: '.06em' }}>
            AI&nbsp;PULSE<span style={{ color: 'var(--acc)' }}>·</span>GLOBE
          </div>
          <div
            style={{
              fontFamily: "'IBM Plex Mono',monospace",
              fontSize: 10,
              color: 'var(--sub)',
              letterSpacing: '.04em',
            }}
          >
            where the world uses AI — Anthropic Economic Index · May 2026
          </div>
        </div>
      </div>

      <div style={{ flex: 1 }} />

      {/* Search */}
      <div style={{ position: 'relative', pointerEvents: 'auto' }}>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search a country…"
          style={{
            width: 'min(220px,44vw)',
            padding: '9px 13px',
            borderRadius: 99,
            border: '1px solid var(--pb)',
            background: 'var(--panel)',
            color: 'var(--ink)',
            fontFamily: "'IBM Plex Mono',monospace",
            fontSize: 12,
            outline: 'none',
            backdropFilter: 'blur(10px)',
          }}
        />
        {matches.length > 0 && (
          <div
            style={{
              position: 'absolute',
              top: 44,
              left: 0,
              right: 0,
              ...panel,
              borderRadius: 14,
              overflow: 'hidden',
              boxShadow: '0 12px 30px rgba(0,0,0,.35)',
              zIndex: 12,
            }}
          >
            {matches.map((m) => (
              <div
                key={m.iso3}
                onClick={() => selectCountry(m.iso3)}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  gap: 10,
                  padding: '9px 13px',
                  fontSize: 13,
                  cursor: 'pointer',
                }}
              >
                <span>{m.name}</span>
                <span
                  style={{
                    fontFamily: "'IBM Plex Mono',monospace",
                    color: 'var(--acc)',
                    fontSize: 11,
                  }}
                >
                  {m.usersF}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Theme toggles */}
      <div
        style={{
          display: 'flex',
          gap: 6,
          pointerEvents: 'auto',
          ...panel,
          borderRadius: 99,
          padding: 4,
        }}
      >
        {THEME_ORDER.map((t) => {
          const active = t.name === themeName;
          return (
            <button
              key={t.name}
              onClick={() => setTheme(t.name)}
              title={t.name}
              style={{
                border: 'none',
                cursor: 'pointer',
                borderRadius: 99,
                padding: '6px 12px',
                fontFamily: "'IBM Plex Mono',monospace",
                fontSize: 11,
                letterSpacing: '.03em',
                background: active ? 'var(--acc)' : 'transparent',
                color: active ? '#14161c' : 'var(--sub)',
                transition: 'background .2s',
              }}
            >
              {t.short}
            </button>
          );
        })}
      </div>

      {/* Dashboard + Download */}
      <div style={{ display: 'flex', gap: 8, pointerEvents: 'auto' }}>
        <Link
          to="/dashboard"
          style={{
            ...panel,
            borderRadius: 99,
            padding: '9px 14px',
            fontFamily: "'IBM Plex Mono',monospace",
            fontSize: 11,
            color: 'var(--ink)',
            textDecoration: 'none',
          }}
        >
          DASHBOARD
        </Link>
        <button
          onClick={() => setDownloadOpen(true)}
          style={{
            border: 'none',
            cursor: 'pointer',
            background: 'var(--acc)',
            color: '#14161c',
            borderRadius: 99,
            padding: '9px 14px',
            fontFamily: "'IBM Plex Mono',monospace",
            fontSize: 11,
            fontWeight: 600,
          }}
        >
          DOWNLOAD ↓
        </button>
      </div>
    </div>
  );
}
