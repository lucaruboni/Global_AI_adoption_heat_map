import { create } from 'zustand';
import type { ThemeName, VizMode } from '../lib/globe/themes';

export const MIN_YEAR = 2023;
export const MAX_YEAR = 2026;

interface AppState {
  year: number;
  themeName: ThemeName;
  vizMode: VizMode;
  selectedIso: string | null;
  query: string;
  downloadOpen: boolean;

  setYear: (year: number) => void;
  setTheme: (theme: ThemeName) => void;
  setViz: (viz: VizMode) => void;
  selectCountry: (iso: string | null) => void;
  setQuery: (query: string) => void;
  setDownloadOpen: (open: boolean) => void;
}

export const useAppStore = create<AppState>((set) => ({
  year: MAX_YEAR,
  themeName: 'Mission Control',
  vizMode: 'dots',
  selectedIso: null,
  query: '',
  downloadOpen: false,

  setYear: (year): void => set({ year }),
  setTheme: (themeName): void => set({ themeName }),
  setViz: (vizMode): void => set({ vizMode }),
  selectCountry: (selectedIso): void => set({ selectedIso, query: '' }),
  setQuery: (query): void => set({ query }),
  setDownloadOpen: (downloadOpen): void => set({ downloadOpen }),
}));
