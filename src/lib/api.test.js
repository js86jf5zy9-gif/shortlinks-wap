import { ApiError, fetchLink, shortenUrl } from './api';
import { decodeBase64Url } from './base64url';

const respond = (body, status = 200) =>
  vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response(JSON.stringify(body), { status }));

describe('shortenUrl', () => {
  it('POSTs the base64url-encoded URL and builds the short link', async () => {
    const fetch = respond({ shortcode: 'aB3x9' });
    const url = 'https://example.com/?a=>>>&b=ü';

    await expect(shortenUrl(url)).resolves.toEqual({ shortcode: 'aB3x9', shortUrl: 'https://url2qr.com/aB3x9' });

    const [requested, init] = fetch.mock.calls[0];
    expect(init.method).toBe('POST');
    const segment = requested.match(/^https:\/\/api\.url2qr\.com\/links\/([^/]+)$/)[1];
    expect(decodeBase64Url(segment)).toBe(url);
  });

  it('throws on HTTP errors', async () => {
    respond({}, 500);
    await expect(shortenUrl('https://example.com/')).rejects.toBeInstanceOf(ApiError);
  });

  it('throws when the shortcode is missing', async () => {
    respond({});
    await expect(shortenUrl('https://example.com/')).rejects.toThrow('Missing shortcode');
  });
});

describe('fetchLink', () => {
  it('returns the Item', async () => {
    const fetch = respond({ Item: { link: 'https://example.com', redirects: 1, viewers: [] } });
    await expect(fetchLink('aB3x9')).resolves.toMatchObject({ link: 'https://example.com' });
    expect(fetch.mock.calls[0][0]).toBe('https://api.url2qr.com/v/aB3x9');
  });

  it('returns null for unknown shortcodes', async () => {
    respond({});
    await expect(fetchLink('nope')).resolves.toBeNull();
  });
});
