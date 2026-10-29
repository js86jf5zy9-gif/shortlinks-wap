export const UPDATE_CHECK_INTERVAL = 60 * 60 * 1000;

// Long-lived tabs and installed PWAs may never navigate again, so the browser's
// own update check (on navigation) isn't enough. Poll hourly and whenever the
// tab becomes visible. The sw.js fetch uses cache: 'no-store' so a stale copy
// in an HTTP/CDN cache can't hide a new deploy, and we skip the update while
// offline or while a new worker is already installing.
export const watchForUpdates = (registration, swUrl, { win = window, interval = UPDATE_CHECK_INTERVAL } = {}) => {
  if (!registration) return () => {};

  const check = async () => {
    if (registration.installing || win.navigator.onLine === false) return;
    try {
      const res = await win.fetch(swUrl, { cache: 'no-store', headers: { 'cache-control': 'no-cache' } });
      if (res.status === 200) await registration.update();
    } catch {
      // Offline or the request was blocked; try again on the next tick.
    }
  };
  const onVisible = () => {
    if (win.document.visibilityState === 'visible') check();
  };

  const timer = win.setInterval(check, interval);
  win.document.addEventListener('visibilitychange', onVisible);
  return () => {
    win.clearInterval(timer);
    win.document.removeEventListener('visibilitychange', onVisible);
  };
};

// vite-plugin-pwa only reloads after skip-waiting when Workbox flags the new
// worker as `isUpdate`; workers found by watchForUpdates() are "external", so
// the new worker would activate without the page ever reloading. Reload on
// controllerchange ourselves, with a timeout in case the event never comes.
export const applyUpdate = (updateServiceWorker, { win = window, timeout = 4000 } = {}) => {
  let reloaded = false;
  const reload = () => {
    if (reloaded) return;
    reloaded = true;
    win.location.reload();
  };
  win.navigator.serviceWorker?.addEventListener('controllerchange', reload, { once: true });
  win.setTimeout(reload, timeout);
  return updateServiceWorker(true);
};
