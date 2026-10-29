import { normalizeUrl, safeRedirectTarget, shortcodeFromInput, shortcodeFromPath } from './urls';

describe('normalizeUrl', () => {
  it.each([
    ['example.com', 'https://example.com/'],
    ['  https://example.com/path?q=1  ', 'https://example.com/path?q=1'],
    ['http://sub.example.co.uk/a', 'http://sub.example.co.uk/a'],
    ['http://localhost:3000/x', 'http://localhost:3000/x'],
  ])('accepts %s', (input, expected) => {
    expect(normalizeUrl(input)).toBe(expected);
  });

  it.each(['', '   ', 'hello', 'not a url.com', 'javascript:alert(1)', 'ftp://example.com', 'data:text/html,hi'])(
    'rejects %j',
    (input) => {
      expect(normalizeUrl(input)).toBeNull();
    },
  );

  it('enforces the max length', () => {
    const long = `https://example.com/${'a'.repeat(50)}`;
    expect(normalizeUrl(long, 40)).toBeNull();
    expect(normalizeUrl(long, 200)).toBe(long);
  });
});

describe('shortcodeFromInput', () => {
  it.each([
    ['https://url2qr.com/aB3x9', 'aB3x9'],
    ['url2qr.com/aB3x9', 'aB3x9'],
    ['http://www.url2qr.com/a_b-c/', 'a_b-c'],
  ])('finds the code in %s', (input, code) => {
    expect(shortcodeFromInput(input)).toBe(code);
  });

  it.each(['https://example.com/aB3x9', 'https://url2qr.com/', 'https://url2qr.com/a/b', 'https://url2qr.com.evil.io/x'])(
    'ignores %s',
    (input) => {
      expect(shortcodeFromInput(input)).toBeNull();
    },
  );
});

describe('shortcodeFromPath', () => {
  it('reads a single path segment', () => {
    expect(shortcodeFromPath('/aB3x9')).toBe('aB3x9');
    expect(shortcodeFromPath('/aB3x9/')).toBe('aB3x9');
  });

  it('ignores the root and non-shortcode paths', () => {
    expect(shortcodeFromPath('/')).toBeNull();
    expect(shortcodeFromPath('/a/b')).toBeNull();
    expect(shortcodeFromPath('/index.html')).toBeNull();
  });
});

describe('safeRedirectTarget', () => {
  it('allows http(s) and adds a scheme to legacy bare links', () => {
    expect(safeRedirectTarget('https://example.com/x')).toBe('https://example.com/x');
    expect(safeRedirectTarget('example.com/x')).toBe('https://example.com/x');
  });

  it('refuses other schemes', () => {
    expect(safeRedirectTarget('javascript:alert(1)')).toBeNull();
    expect(safeRedirectTarget('data:text/html,x')).toBeNull();
    expect(safeRedirectTarget(undefined)).toBeNull();
  });
});
