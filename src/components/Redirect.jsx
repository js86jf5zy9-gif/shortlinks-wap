import { useEffect, useState } from 'react';
import { Alert, Button, CircularProgress, Paper, Stack, Typography } from '@mui/material';
import strings from '../data/strings.json';
import { fetchLink } from '../lib/api';
import { safeRedirectTarget } from '../lib/urls';
import Stats from './Stats';

const s = strings.redirect;
const go = (url) => window.location.replace(url);

// Handles https://<domain>/<shortcode>. Any query string (e.g. /abc123?stats)
// shows a preview with stats instead of redirecting.
export default function Redirect({ shortcode, preview = false, navigate = go }) {
  const [state, setState] = useState({ status: 'loading' });

  useEffect(() => {
    let cancelled = false;
    fetchLink(shortcode)
      .then((item) => {
        if (cancelled) return;
        if (!item) return setState({ status: 'unknown' });
        const target = safeRedirectTarget(item.link);
        if (!target) return setState({ status: 'unsafe', item });
        setState({ status: 'found', item, target });
        if (!preview) navigate(target);
      })
      .catch((err) => {
        console.error(err);
        if (!cancelled) setState({ status: 'error' });
      });
    return () => {
      cancelled = true;
    };
  }, [shortcode, preview, navigate]);

  const { status, item, target } = state;
  const redirecting = !preview && (status === 'loading' || status === 'found');

  return (
    <Stack spacing={2.5} sx={{ width: '100%' }} aria-live="polite">
      {redirecting && (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <CircularProgress sx={{ mb: 2 }} aria-label="Loading" />
          <Typography variant="h5" component="p">
            {s.redirecting}
          </Typography>
          <Typography color="text.secondary" sx={{ wordBreak: 'break-all', mt: 1 }}>
            {target || `/${shortcode}`}
          </Typography>
        </Paper>
      )}
      {preview && status === 'loading' && <CircularProgress sx={{ alignSelf: 'center' }} aria-label="Loading" />}
      {preview && status === 'found' && (
        <>
          <Typography variant="h5" component="p">
            {s.preview}
          </Typography>
          <Stats data={item} />
          <Button variant="contained" size="large" href={target} sx={{ alignSelf: 'center' }}>
            {s.continue}
          </Button>
        </>
      )}
      {status === 'unknown' && <Alert severity="warning">{s.unknown}</Alert>}
      {status === 'unsafe' && (
        <>
          <Alert severity="warning">{s.unsafe}</Alert>
          <Stats data={item} />
        </>
      )}
      {status === 'error' && <Alert severity="error">{s.error}</Alert>}
      {!redirecting && (
        <Button href="/" sx={{ alignSelf: 'center' }}>
          {s.home}
        </Button>
      )}
    </Stack>
  );
}
