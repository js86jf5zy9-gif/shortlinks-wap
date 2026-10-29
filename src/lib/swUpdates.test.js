import { applyUpdate, watchForUpdates } from './swUpdates';

const setup = ({ onLine = true, status = 200, installing = null } = {}) => {
  const registration = { installing, update: vi.fn().mockResolvedValue() };
  const win = {
    navigator: { onLine },
    fetch: vi.fn().mockResolvedValue({ status }),
    setInterval: (fn, ms) => setInterval(fn, ms),
    clearInterval: (id) => clearInterval(id),
    document,
  };
  return { registration, win };
};

const setVisibility = (state) => {
  Object.defineProperty(document, 'visibilityState', { value: state, configurable: true });
  document.dispatchEvent(new Event('visibilitychange'));
};

describe('watchForUpdates', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it('checks for a new worker on an interval, bypassing HTTP caches', async () => {
    const { registration, win } = setup();
    const stop = watchForUpdates(registration, '/sw.js', { win, interval: 1000 });

    await vi.advanceTimersByTimeAsync(1000);
    expect(win.fetch).toHaveBeenCalledWith('/sw.js', expect.objectContaining({ cache: 'no-store' }));
    expect(registration.update).toHaveBeenCalledTimes(1);

    stop();
    await vi.advanceTimersByTimeAsync(5000);
    expect(registration.update).toHaveBeenCalledTimes(1);
  });

  it('checks when the tab becomes visible again', async () => {
    const { registration, win } = setup();
    const stop = watchForUpdates(registration, '/sw.js', { win, interval: 1e9 });
    setVisibility('visible');
    await vi.runAllTicks();
    await Promise.resolve();
    expect(win.fetch).toHaveBeenCalled();
    stop();
  });

  it('skips the check while offline, installing, or when sw.js is unavailable', async () => {
    for (const opts of [{ onLine: false }, { installing: {} }, { status: 404 }]) {
      const { registration, win } = setup(opts);
      const stop = watchForUpdates(registration, '/sw.js', { win, interval: 1000 });
      await vi.advanceTimersByTimeAsync(1000);
      expect(registration.update).not.toHaveBeenCalled();
      stop();
    }
  });

  it('is a no-op without a registration', () => {
    expect(() => watchForUpdates(undefined, '/sw.js')()).not.toThrow();
  });
});

describe('applyUpdate', () => {
  const fakeWin = () => {
    const sw = new EventTarget();
    return {
      sw,
      win: {
        navigator: { serviceWorker: sw },
        location: { reload: vi.fn() },
        setTimeout: (fn, ms) => setTimeout(fn, ms),
      },
    };
  };

  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it('skips waiting and reloads once the new worker takes control', () => {
    const { sw, win } = fakeWin();
    const updateServiceWorker = vi.fn();
    applyUpdate(updateServiceWorker, { win });

    expect(updateServiceWorker).toHaveBeenCalledWith(true);
    expect(win.location.reload).not.toHaveBeenCalled();
    sw.dispatchEvent(new Event('controllerchange'));
    vi.advanceTimersByTime(10000);
    expect(win.location.reload).toHaveBeenCalledTimes(1);
  });

  it('falls back to a reload if control never changes', () => {
    const { win } = fakeWin();
    applyUpdate(vi.fn(), { win, timeout: 3000 });
    vi.advanceTimersByTime(3000);
    expect(win.location.reload).toHaveBeenCalledTimes(1);
  });
});
