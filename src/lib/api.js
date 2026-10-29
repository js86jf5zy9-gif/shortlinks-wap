import config, { shortLinkBase } from '../config';
import { encodeBase64Url } from './base64url';

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

// POST /links/{base64url(url)} -> { shortcode }
export const shortenUrl = async (url) => {
  const data = await request(`/links/${encodeBase64Url(url)}`, {
    method: 'POST',
    body: '{}',
  });
  if (!data?.shortcode) throw new ApiError('Missing shortcode in response');
  return { shortcode: data.shortcode, shortUrl: shortLinkBase + data.shortcode };
};

// GET /v/{shortcode} -> { Item: { link, redirects, viewers } }; null if unknown.
export const fetchLink = async (shortcode) => {
  const data = await request(`/v/${encodeURIComponent(shortcode)}`);
  return data?.Item || null;
};
