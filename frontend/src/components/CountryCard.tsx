import { useAppStore } from '../stores/useAppStore';
import type { GlobeCountry } from '../lib/globe/types';
import { fmtP, usageAt } from '../lib/globe/compute';
import { CURVES } from '../lib/globe/themes';

const monoTiny: React.CSSProperties = {
  fontFamily: "'IBM Plex Mono',monospace",
  fontSize: 9,
  color: 'var(--sub)',
};

const chipTag: React.CSSProperties = {
  fontFamily: "'IBM Plex Mono',monospace",
  fontSize: 10,
  padding: '3px 9px',
  borderRadius: 99,
  background: 'var(--chip)',
  color: 'var(--acc)',
};

interface CountryCardProps {
  country: GlobeCountry;
}

export function CountryCard({ country: c }: CountryCardProps): React.ReactElement {
  const year = useAppStore((s) => s.year);
  const selectCountry = useAppStore((s) => s.selectCountry);

  const maxUse = Math.max(c.work, c.personal, c.coursework) || 1;
  const uses = [
    { name: 'work', v: c.work },
    { name: 'personal', v: c.personal },
    { name: 'coursework', v: c.coursework },
  ];
  const curve = CURVES[c.curve];
  const spark = [2023, 2024, 2025, 2026].map((yy, i) => ({
    y: yy,
    pct: Math.max(6, Math.round(curve[i] * 100)),
    color: yy === year ? 'var(--acc)' : 'var(--track)',
  }));

  return (
    <div
      style={{
        position: 'absolute',
        left: '50%',
        bottom: 104,
        transform: 'translateX(-50%)',
        width: 'min(420px,92vw)',
        background: 'var(--panel)',
        border: '1px solid var(--pb)',
        borderRadius: 20,
        padding: 18,
        backdropFilter: 'blur(16px)',
        zIndex: 9,
        boxShadow: '0 20px 50px rgba(0,0,0,.4)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 10 }}>
        <div>
          <div style={{ fontSize: 20, fontWeight: 700 }}>{c.name}</div>
          <div style={{ display: 'flex', gap: 6, marginTop: 5, flexWrap: 'wrap' }}>
            <span style={chipTag}>{c.region}</span>
            <span style={chipTag}>top: {c.topic}</span>
          </div>
        </div>
        <button
          onClick={() => selectCountry(null)}
          style={{
            border: '1px solid var(--pb)',
            background: 'transparent',
            color: 'var(--sub)',
            borderRadius: 99,
            width: 28,
            height: 28,
            cursor: 'pointer',
            fontSize: 13,
            lineHeight: 1,
            flexShrink: 0,
          }}
        >
          ✕
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 8, marginTop: 14 }}>
        <div>
          <div style={{ fontWeight: 700, fontSize: 16, color: 'var(--acc)' }}>
            {fmtP(usageAt(c, year))}
          </div>
          <div style={monoTiny}>global share</div>
        </div>
        <div>
          <div style={{ fontWeight: 700, fontSize: 16 }}>{c.aui.toFixed(2)}×</div>
          <div style={monoTiny}>per-capita idx</div>
        </div>
        <div>
          <div style={{ fontWeight: 700, fontSize: 16 }}>{c.autonomy.toFixed(2)}</div>
          <div style={monoTiny}>AI autonomy /5</div>
        </div>
        <div>
          <div style={{ fontWeight: 700, fontSize: 16 }}>{Math.round(c.multi)}%</div>
          <div style={monoTiny}>multitasking</div>
        </div>
      </div>

      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 7,
          marginTop: 14,
          paddingTop: 12,
          borderTop: '1px solid var(--pb)',
        }}
      >
        {uses.map((u) => (
          <div key={u.name} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ ...monoTiny, width: 76, flexShrink: 0 }}>{u.name}</span>
            <div style={{ flex: 1, height: 4, borderRadius: 99, background: 'var(--track)', overflow: 'hidden' }}>
              <div
                style={{
                  width: `${Math.round((u.v / maxUse) * 100)}%`,
                  height: '100%',
                  borderRadius: 99,
                  background: 'var(--acc)',
                }}
              />
            </div>
            <span
              style={{
                fontFamily: "'IBM Plex Mono',monospace",
                fontSize: 10,
                color: 'var(--acc)',
                width: 40,
                textAlign: 'right',
              }}
            >
              {Math.round(u.v)}%
            </span>
          </div>
        ))}
      </div>

      <div
        style={{
          display: 'flex',
          alignItems: 'flex-end',
          gap: 10,
          height: 48,
          marginTop: 12,
          paddingTop: 10,
          borderTop: '1px solid var(--pb)',
        }}
      >
        {spark.map((s) => (
          <div
            key={s.y}
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'flex-end',
              height: '100%',
              gap: 4,
            }}
          >
            <div
              style={{
                height: `${s.pct}%`,
                minHeight: 3,
                borderRadius: '5px 5px 2px 2px',
                background: s.color,
              }}
            />
            <div style={{ ...monoTiny, textAlign: 'center' }}>{s.y}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
