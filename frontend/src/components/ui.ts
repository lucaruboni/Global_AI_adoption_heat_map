import type { CSSProperties } from 'react';

export const glassPanel: CSSProperties = {
  background: 'var(--panel)',
  border: '1px solid var(--pb)',
  borderRadius: 18,
  padding: 18,
  backdropFilter: 'blur(14px)',
};

export const monoLabel: CSSProperties = {
  fontFamily: "'IBM Plex Mono',monospace",
  fontSize: 10,
  letterSpacing: '.14em',
  color: 'var(--sub)',
  textTransform: 'uppercase',
};

export const track: CSSProperties = {
  height: 4,
  borderRadius: 99,
  background: 'var(--track)',
  overflow: 'hidden',
};

export function bar(pct: number, gradient = false): CSSProperties {
  return {
    width: `${pct}%`,
    height: '100%',
    borderRadius: 99,
    background: gradient ? 'linear-gradient(90deg, var(--acc), var(--acc2))' : 'var(--acc)',
    transition: 'width .5s',
  };
}
