/**
 * useGoogleMaps — loads the Google Maps JS SDK once and resolves the `google` global.
 * Falls back gracefully when no API key is provided.
 */
import { useState, useEffect } from 'react';
import { Loader } from '@googlemaps/js-api-loader';

const MAPS_KEY = import.meta.env.VITE_GOOGLE_MAPS_KEY || '';

let loaderPromise = null; // singleton

export function useGoogleMaps() {
  const [isLoaded, setIsLoaded] = useState(!!window.google?.maps);
  const [error,    setError]    = useState(null);

  useEffect(() => {
    if (window.google?.maps) { setIsLoaded(true); return; }
    if (!MAPS_KEY || MAPS_KEY === 'YOUR_GOOGLE_MAPS_API_KEY_HERE') {
      setError('no_key');
      return;
    }

    if (!loaderPromise) {
      const loader = new Loader({
        apiKey:    MAPS_KEY,
        version:   'weekly',
        libraries: ['places', 'marker'],
      });
      loaderPromise = loader.load();
    }

    loaderPromise
      .then(() => setIsLoaded(true))
      .catch((err) => { setError(err.message); });
  }, []);

  return { isLoaded, error, hasKey: !!(MAPS_KEY && MAPS_KEY !== 'YOUR_GOOGLE_MAPS_API_KEY_HERE') };
}
