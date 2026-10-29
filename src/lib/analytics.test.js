import { initAnalytics } from './analytics';

const fakeWindow = () => ({ navigator: {} });

describe('initAnalytics', () => {
  afterEach(() => {
    document.head.querySelectorAll('script').forEach((s) => s.remove());
  });

  it('does nothing without a measurement ID', () => {
    expect(initAnalytics({ id: '', enabled: true, win: fakeWindow() })).toBe(false);
    expect(document.head.querySelector('script')).toBeNull();
  });

  it('does nothing outside production builds', () => {
    expect(initAnalytics({ id: 'G-ABC123', enabled: false, win: fakeWindow() })).toBe(false);
  });

  it('rejects malformed IDs', () => {
    expect(initAnalytics({ id: 'G-ABC"><script>', enabled: true, win: fakeWindow() })).toBe(false);
  });

  it('respects Do Not Track', () => {
    expect(initAnalytics({ id: 'G-ABC123', enabled: true, win: { navigator: { doNotTrack: '1' } } })).toBe(false);
  });

  it('loads gtag with the configured ID', () => {
    const win = fakeWindow();
    expect(initAnalytics({ id: 'G-ABC123', enabled: true, win })).toBe(true);
    expect(document.head.querySelector('script').src).toBe('https://www.googletagmanager.com/gtag/js?id=G-ABC123');
    expect(win.dataLayer.map((args) => [...args][0])).toEqual(['js', 'config']);
  });
});
