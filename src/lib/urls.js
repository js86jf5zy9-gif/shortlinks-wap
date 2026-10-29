import config from '../config';

const SHORTCODE = /^[A-Za-z0-9_-]{1,64}$/;
const SCHEME = /^[a-z][a-z0-9+.-]*:/i;

const parse = (value) => {
  try {
    return new URL(SCHEME.test(value) ? value : `https://${value}`);
  } catch {
    return null;
  }
};

const isOwnHost = (hostname) =>
  hostname === config.domain || hostname === `www.${config.domain}`;

// Returns a normalized absolute http(s) URL, or null if the input isn't one.
export const normalizeUrl = (input, maxLength = config.maxUrlLength) => {
  const value = (input || '').trim();
  if (!value || value.length > maxLength || /\s/.test(value)) return null;
  const url = parse(value);
  if (!url || !['http:', 'https:'].includes(url.protocol)) return null;
  // Require a dotted hostname (or localhost) so "hello" isn't treated as a site.
  if (!url.hostname.includes('.') && url.hostname !== 'localhost') return null;
  return url.href;
};

export const isValidShortcode = (code) => SHORTCODE.test(code || '');

// If the input is one of our own short links, return its shortcode.
export const shortcodeFromInput = (input) => {
  const value = (input || '').trim();
  if (!value) return null;
  const url = parse(value);
  if (!url || !isOwnHost(url.hostname)) return null;
  const code = url.pathname.replace(/^\/+|\/+$/g, '');
  return isValidShortcode(code) ? code : null;
};

// Shortcode for the page the app was loaded on, e.g. /abc123 -> "abc123".
export const shortcodeFromPath = (pathname) => {
  const code = (pathname || '').replace(/^\/+|\/+$/g, '');
  return isValidShortcode(code) ? code : null;
};

// Only follow stored links that are http(s); older records may lack a scheme.
export const safeRedirectTarget = (link) => {
  if (!link || typeof link !== 'string') return null;
  const url = parse(link.trim());
  return url && ['http:', 'https:'].includes(url.protocol) ? url.href : null;
};
