import settings from './data/settings.json';

const env = import.meta.env;
const trimSlash = (s) => s.replace(/\/+$/, '');

const config = {
  domain: env.VITE_SHORT_DOMAIN || settings.domain,
  apiUrl: trimSlash(env.VITE_API_URL || settings.api),
  maxUrlLength: settings.maxUrlLength,
  gaMeasurementId: env.VITE_GA_MEASUREMENT_ID || '',
};

export const shortLinkBase = `https://${config.domain}/`;

export default config;
