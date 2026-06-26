/**
 * Generate a URL-safe slug from a string. Handles both Latin and Devanagari text;
 * for Devanagari input (no Latin characters survive the strip), falls back to a
 * transliteration-free slug using a short random suffix so URLs stay unique and ASCII-safe.
 */
function slugify(text, fallbackPrefix = 'item') {
  const base = String(text)
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // strip non-word chars (removes Devanagari entirely)
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');

  if (base.length > 0) return base;

  const suffix = Math.random().toString(36).slice(2, 8);
  return `${fallbackPrefix}-${suffix}`;
}

/**
 * Ensure a slug is unique by appending -2, -3, etc. if needed.
 * @param {string} baseSlug
 * @param {(candidate: string) => Promise<boolean>} existsFn - returns true if slug is taken
 */
async function ensureUniqueSlug(baseSlug, existsFn) {
  let candidate = baseSlug;
  let counter = 2;
  // eslint-disable-next-line no-await-in-loop
  while (await existsFn(candidate)) {
    candidate = `${baseSlug}-${counter}`;
    counter += 1;
  }
  return candidate;
}

module.exports = { slugify, ensureUniqueSlug };
