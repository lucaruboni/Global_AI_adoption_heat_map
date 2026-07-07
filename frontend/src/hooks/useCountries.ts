import { useEffect, useState } from 'react';
import type { CountryWithStats } from '@shared/index';
import { countryService } from '../services/countryService';
import { extractErrorMessage } from '../services/apiClient';
import { logger } from '../utils/logger';

interface CountriesState {
  countries: CountryWithStats[];
  loading: boolean;
  error: string | null;
}

/** Fetches all countries with their latest stats once on mount. */
export function useCountries(): CountriesState {
  const [state, setState] = useState<CountriesState>({
    countries: [],
    loading: true,
    error: null,
  });

  useEffect(() => {
    let active = true;
    countryService
      .list()
      .then((countries) => {
        if (active) setState({ countries, loading: false, error: null });
      })
      .catch((err: unknown) => {
        logger.error('Failed to load countries', err);
        if (active) {
          setState({ countries: [], loading: false, error: extractErrorMessage(err) });
        }
      });
    return (): void => {
      active = false;
    };
  }, []);

  return state;
}
