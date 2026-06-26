import { useEffect, useState } from 'react';
import { contentApi } from '../api/client';

let cache = null;
let inflight = null;

/**
 * Fetches /content/settings once per page load and shares the result across
 * every component that calls this hook (avoids a settings fetch per component).
 */
export function useSiteSettings() {
  const [settings, setSettings] = useState(cache || {});

  useEffect(() => {
    if (cache) return;
    if (!inflight) {
      inflight = contentApi.getSettings().then((res) => {
        cache = res.data.data;
        return cache;
      }).catch(() => ({}));
    }
    inflight.then((data) => setSettings(data));
  }, []);

  return settings;
}
