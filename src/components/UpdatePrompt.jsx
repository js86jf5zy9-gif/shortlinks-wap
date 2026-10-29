import { useEffect, useRef } from 'react';
import { Alert, Button, Snackbar } from '@mui/material';
import { useRegisterSW } from 'virtual:pwa-register/react';
import strings from '../data/strings.json';
import { applyUpdate, watchForUpdates } from '../lib/swUpdates';

const s = strings.update;

export default function UpdatePrompt() {
  const stopWatching = useRef(() => {});
  const {
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegisteredSW(swUrl, registration) {
      stopWatching.current();
      stopWatching.current = watchForUpdates(registration, swUrl);
    },
    onRegisterError(error) {
      console.error('Service worker registration failed', error);
    },
  });

  useEffect(() => () => stopWatching.current(), []);

  return (
    <Snackbar open={needRefresh} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
      <Alert
        severity="info"
        variant="filled"
        onClose={() => setNeedRefresh(false)}
        action={
          <Button color="inherit" size="small" onClick={() => applyUpdate(updateServiceWorker)}>
            {s.reload}
          </Button>
        }
      >
        {s.available}
      </Alert>
    </Snackbar>
  );
}
