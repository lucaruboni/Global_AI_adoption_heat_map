import { useEffect, useRef } from 'react';
import type { CountryWithStats } from '@shared/index';
import { GlobeEngine } from '../lib/globe/GlobeEngine';
import { toGlobeCountries, type GlobeCountry } from '../lib/globe/types';
import { useAppStore } from '../stores/useAppStore';

interface GlobeProps {
  countries: CountryWithStats[];
  onHover: (country: GlobeCountry | null, x: number, y: number) => void;
}

/** React wrapper around the imperative Three.js GlobeEngine. */
export function Globe({ countries, onHover }: GlobeProps): React.ReactElement {
  const containerRef = useRef<HTMLDivElement>(null);
  const engineRef = useRef<GlobeEngine | null>(null);
  const selectCountry = useAppStore((s) => s.selectCountry);

  const year = useAppStore((s) => s.year);
  const themeName = useAppStore((s) => s.themeName);
  const vizMode = useAppStore((s) => s.vizMode);

  // Create the engine once.
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const engine = new GlobeEngine(el, {
      onHover,
      onSelect: (c) => selectCountry(c.iso3),
      onDeselect: () => selectCountry(null),
    });
    engine.init();
    engineRef.current = engine;

    const onResize = (): void => engine.resize();
    window.addEventListener('resize', onResize);
    return (): void => {
      window.removeEventListener('resize', onResize);
      engine.dispose();
      engineRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Push data into the engine when it loads/changes.
  useEffect(() => {
    engineRef.current?.setData(toGlobeCountries(countries));
  }, [countries]);

  useEffect(() => {
    engineRef.current?.setYear(year);
  }, [year]);

  useEffect(() => {
    engineRef.current?.setTheme(themeName);
  }, [themeName]);

  useEffect(() => {
    engineRef.current?.setViz(vizMode);
  }, [vizMode]);

  return <div ref={containerRef} style={{ position: 'absolute', inset: 0, touchAction: 'none' }} />;
}
