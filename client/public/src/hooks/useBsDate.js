import { useMemo } from 'react';
import NepaliDate from 'nepali-date-converter';

/**
 * Returns today's date formatted in Bikram Sambat, Devanagari script, e.g. "२०८३ असार १२ गते".
 * Used for the header's date display, matching the original site's "DateTime" element.
 */
export function useBsDate() {
  return useMemo(() => {
    try {
      const today = new NepaliDate();
      return `${today.format('YYYY MMMM DD', 'np')} गते`;
    } catch {
      return '';
    }
  }, []);
}

/** Converts a JS Date / ISO date string to a Devanagari BS date string, e.g. for news/download dates. */
export function adToBs(date) {
  if (!date) return '';
  try {
    const nepaliDate = new NepaliDate(new Date(date));
    return nepaliDate.format('YYYY MMMM DD', 'np');
  } catch {
    return '';
  }
}
