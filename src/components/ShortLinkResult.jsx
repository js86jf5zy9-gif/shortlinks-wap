import { useState } from 'react';
import { Box, Button, Paper, Stack, TextField, Typography } from '@mui/material';
import ContentCopyRounded from '@mui/icons-material/ContentCopyRounded';
import CheckRounded from '@mui/icons-material/CheckRounded';
import strings from '../data/strings.json';
import { copyText } from '../lib/clipboard';
import QrCode from './QrCode';

const s = strings.converter;

export default function ShortLinkResult({ shortUrl, shortcode }) {
  const [copyState, setCopyState] = useState('idle');

  const copy = async () => setCopyState((await copyText(shortUrl)) ? 'copied' : 'failed');

  return (
    <Paper component="section" aria-label={s.outputLabel} sx={{ p: { xs: 2.5, sm: 3 } }}>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3} alignItems="center">
        <Box sx={{ flex: 1, width: '100%' }}>
          <TextField
            label={s.outputLabel}
            value={shortUrl}
            fullWidth
            slotProps={{ htmlInput: { readOnly: true, onFocus: (e) => e.target.select() } }}
          />
          <Button
            variant="contained"
            size="large"
            fullWidth
            sx={{ mt: 2 }}
            onClick={copy}
            startIcon={copyState === 'copied' ? <CheckRounded /> : <ContentCopyRounded />}
          >
            {copyState === 'copied' ? s.copied : s.copy}
          </Button>
          <Typography role="status" variant="body2" color="error" sx={{ mt: 1, minHeight: 20 }}>
            {copyState === 'failed' ? s.copyFailed : ''}
          </Typography>
        </Box>
        <QrCode value={shortUrl} label={s.download} fileName={`url2qr-${shortcode}.png`} />
      </Stack>
    </Paper>
  );
}
