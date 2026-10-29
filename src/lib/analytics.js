import config from '../config';

// Loads GA4 only when a measurement ID is supplied at build time
// (VITE_GA_MEASUREMENT_ID). Nothing is loaded in dev or when it's unset.
export const initAnalytics = ({
  id = config.gaMeasurementId,
  enabled = import.meta.env.PROD,
  doc = document,
  win = window,
} = {}) => {
  if (!id || !enabled || !/^G-[A-Z0-9]+$/i.test(id)) return false;
  if (win.navigator?.doNotTrack === '1') return false;

  win.dataLayer = win.dataLayer || [];
  win.gtag = function gtag() {
    win.dataLayer.push(arguments);
  };
  win.gtag('js', new Date());
  win.gtag('config', id);

  const script = doc.createElement('script');
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(id)}`;
  doc.head.appendChild(script);
  return true;
};
