// Maps common hospital service names to Font Awesome icon classes that are
// actually loaded by the theme (font-awesome.css, already in every page).
// Falls back to a generic medical icon if nothing matches.
const KEYWORD_ICON_MAP = [
  { keywords: ['emergency', 'आकस्मिक'], icon: 'fa-ambulance' },
  { keywords: ['opd', 'ओ.पी.डी'], icon: 'fa-stethoscope' },
  { keywords: ['ipd', 'आई.पी.डी'], icon: 'fa-hospital-o' },
  { keywords: ['laborator', 'lab', 'प्रयोगशाला'], icon: 'fa-flask' },
  { keywords: ['radiolog', 'रेडियो'], icon: 'fa-search-plus' },
  { keywords: ['pharmac', 'फार्मेसी'], icon: 'fa-medkit' },
  { keywords: ['immuniz', 'vaccin', 'खोप'], icon: 'fa-plus-square' },
  { keywords: ['maternal', 'मातृ'], icon: 'fa-venus' },
  { keywords: ['child', 'बाल'], icon: 'fa-child' },
  { keywords: ['dental', 'दन्त'], icon: 'fa-medkit' },
  { keywords: ['eye', 'नेत्र'], icon: 'fa-eye' },
  { keywords: ['surger', 'शल्य'], icon: 'fa-user-md' },
  { keywords: ['physio', 'भौतिक'], icon: 'fa-heartbeat' },
  { keywords: ['mental', 'मानसिक'], icon: 'fa-heart' },
];

const DEFAULT_ICON = 'fa-plus-circle';

/**
 * Picks the best-fit Font Awesome icon class for a service, preferring a
 * CMS-set icon field if present, otherwise matching on name keywords.
 */
export function getServiceIcon(service) {
  if (service.icon) return service.icon;

  const haystack = `${service.name_en || ''} ${service.name_np || ''}`.toLowerCase();
  for (const entry of KEYWORD_ICON_MAP) {
    if (entry.keywords.some((kw) => haystack.includes(kw))) return entry.icon;
  }
  return DEFAULT_ICON;
}
