import { decodeBase64Url, encodeBase64Url } from './base64url';

describe('encodeBase64Url', () => {
  it('never produces path-breaking characters', () => {
    // These inputs produce "+" and "/" with standard base64.
    for (const url of ['https://example.com/?a=>>>', 'https://ex.com/???', 'https://a.b/ÿÿÿ']) {
      const encoded = encodeBase64Url(url);
      expect(btoa(unescape(encodeURIComponent(url)))).toMatch(/[+/]/);
      expect(encoded).toMatch(/^[A-Za-z0-9_-]+=*$/);
    }
  });

  it('round-trips ASCII and Unicode URLs', () => {
    for (const url of ['https://example.com/a?b=c#d', 'https://例え.jp/パス?q=☃', 'https://x.io/😀']) {
      expect(decodeBase64Url(encodeBase64Url(url))).toBe(url);
    }
  });

  it('keeps padding so strict decoders accept it', () => {
    expect(encodeBase64Url('a')).toBe('YQ==');
  });

  it('is byte-compatible with standard base64 apart from the alphabet', () => {
    const url = 'https://example.com/?a=>>>';
    const standard = btoa(url);
    expect(encodeBase64Url(url)).toBe(standard.replace(/\+/g, '-').replace(/\//g, '_'));
  });
});
