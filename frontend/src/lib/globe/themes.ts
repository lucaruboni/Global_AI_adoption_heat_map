/** Theme palettes ported verbatim from the MVP to preserve the exact design. */

export interface GlobeTheme {
  cssVars: Record<string, string>;
  ocean: string;
  land: string;
  border: string;
  acc: string;
  hi: string;
}

export type ThemeName = 'Mission Control' | 'Editorial Light' | 'Neon Pulse';

export const THEMES: Record<ThemeName, GlobeTheme> = {
  'Mission Control': {
    cssVars: {
      '--bg': '#07090d',
      '--glow': 'rgba(255,158,44,.14)',
      '--panel': 'rgba(13,16,22,.72)',
      '--pb': 'rgba(255,255,255,.09)',
      '--ink': '#eef1f6',
      '--sub': '#8b94a3',
      '--acc': '#ffa42e',
      '--acc2': '#ffd9a0',
      '--track': 'rgba(255,255,255,.1)',
      '--chip': 'rgba(255,164,46,.12)',
    },
    ocean: '#0a1220',
    land: '#22304a',
    border: 'rgba(160,180,220,.28)',
    acc: '#ffa42e',
    hi: '#ffffff',
  },
  'Editorial Light': {
    cssVars: {
      '--bg': '#f3f1ec',
      '--glow': 'rgba(224,123,0,.16)',
      '--panel': 'rgba(255,255,255,.85)',
      '--pb': 'rgba(20,22,28,.09)',
      '--ink': '#191c22',
      '--sub': '#69707d',
      '--acc': '#d97400',
      '--acc2': '#a15400',
      '--track': 'rgba(20,22,28,.1)',
      '--chip': 'rgba(217,116,0,.1)',
    },
    ocean: '#d8d3c8',
    land: '#faf8f3',
    border: 'rgba(60,55,45,.35)',
    acc: '#e07b00',
    hi: '#191c22',
  },
  'Neon Pulse': {
    cssVars: {
      '--bg': '#060310',
      '--glow': 'rgba(255,102,40,.22)',
      '--panel': 'rgba(20,10,36,.7)',
      '--pb': 'rgba(255,130,220,.18)',
      '--ink': '#f4ecff',
      '--sub': '#9d8fbb',
      '--acc': '#ffb03a',
      '--acc2': '#ff5ad1',
      '--track': 'rgba(255,255,255,.12)',
      '--chip': 'rgba(255,90,209,.12)',
    },
    ocean: '#0b0420',
    land: '#2b1650',
    border: 'rgba(255,120,220,.4)',
    acc: '#ffb03a',
    hi: '#ff5ad1',
  },
};

export const THEME_ORDER: { name: ThemeName; short: string }[] = [
  { name: 'Mission Control', short: 'DARK' },
  { name: 'Editorial Light', short: 'LIGHT' },
  { name: 'Neon Pulse', short: 'NEON' },
];

/** Time-decay curves (2023→2026) used to backcast pre-2026 usage, from the MVP. */
export const CURVES = {
  early: [0.22, 0.52, 0.8, 1.0],
  mid: [0.1, 0.34, 0.68, 1.0],
  late: [0.04, 0.18, 0.52, 1.0],
} as const;

export type CurveName = keyof typeof CURVES;

export type VizMode = 'dots' | 'bars' | 'heat';
