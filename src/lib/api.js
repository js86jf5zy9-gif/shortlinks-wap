import config, { shortLinkBase } from '../config';
import { encodeBase64Url } from './base64url';
import { isValidShortcode } from './urls';

export class ApiError extends Error {
  constructor(message, status) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

const request = async (path, init) => {
  const res = await fetch(config.apiUrl + path, {
    headers: { 'Content-Type': 'application/json' },
    ...init,
  });
  if (!res.ok) throw new ApiError(`Request failed (${res.status})`, res.status);
  return res.json();
};

// POST /links/{base64url(url)} -> { shortcode }. The API returns the code with
// a leading slash ("/26a198"), so strip slashes before building the link.
export const shortenUrl = async (url) => {
  const data = await request(`/links/${encodeBase64Url(url)}`, {
    method: 'POST',
    body: '{}',
  });
  const shortcode = String(data?.shortcode ?? '').replace(/^\/+|\/+$/g, '');
  if (!isValidShortcode(shortcode)) throw new ApiError('Missing or invalid shortcode in response');
  return { shortcode, shortUrl: shortLinkBase + shortcode };
};

// GET /v/{shortcode} -> { Item: { link, redirects, viewers } }; null if unknown.
export const fetchLink = async (shortcode) => {
  const data = await request(`/v/${encodeURIComponent(shortcode)}`);
  return data?.Item || null;
};
