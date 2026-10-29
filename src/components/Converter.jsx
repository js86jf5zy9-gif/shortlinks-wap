import { useState } from 'react';
import { Alert, Button, CircularProgress, InputAdornment, Paper, Stack, TextField } from '@mui/material';
import LinkRounded from '@mui/icons-material/LinkRounded';
import InsightsRounded from '@mui/icons-material/InsightsRounded';
import strings from '../data/strings.json';
import config from '../config';
import { fetchLink, shortenUrl } from '../lib/api';
import { normalizeUrl, shortcodeFromInput } from '../lib/urls';
import ShortLinkResult from './ShortLinkResult';
import Stats from './Stats';

const s = strings.converter;
const IDLE = { status: 'idle' };

export default function Converter() {
  const [value, setValue] = useState('');
  const [touched, setTouched] = useState(false);
  const [state, setState] = useState(IDLE);

  const shortcode = shortcodeFromInput(value);
  const url = shortcode ? null : normalizeUrl(value);
  const tooLong = value.trim().length > config.maxUrlLength;
  const invalid = Boolean(value.trim()) && !shortcode && !url;
  const showError = invalid && touched;
  const loading = state.status === 'loading';

  const submit = async (e) => {
    e.preventDefault();
    setTouched(true);
    if (loading || invalid || !value.trim()) return;
    setState({ status: 'loading' });
    try {
      if (shortcode) {
        const item = await fetchLink(shortcode);
        setState(item ? { status: 'inspected', item } : { status: 'error', message: s.unknown });
      } else {
        setState({ status: 'shortened', ...(await shortenUrl(url)) });
      }
    } catch (err) {
      console.error(err);
      setState({ status: 'error', message: s.serverError });
    }
  };

  const reset = () => {
    setValue('');
    setTouched(false);
    setState(IDLE);
  };

  return (
    <Stack spacing={2.5} sx={{ width: '100%' }}>
      <Paper component="form" onSubmit={submit} noValidate sx={{ p: { xs: 2, sm: 3 } }}>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} alignItems={{ sm: 'flex-start' }}>
          <TextField
            fullWidth
            autoFocus
            label={s.inputLabel}
            value={value}
            error={showError}
            helperText={showError ? (tooLong ? s.tooLong.replace('{max}', config.maxUrlLength) : s.invalid) : s.inputHelp}
            onChange={(e) => setValue(e.target.value)}
            onBlur={() => setTouched(Boolean(value.trim()))}
            slotProps={{
              htmlInput: { inputMode: 'url', autoCapitalize: 'none', autoCorrect: 'off', spellCheck: false },
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    {shortcode ? <InsightsRounded color="secondary" /> : <LinkRounded color="primary" />}
                  </InputAdornment>
                ),
              },
            }}
          />
          <Button
            type="submit"
            variant="contained"
            size="large"
            color={shortcode ? 'secondary' : 'primary'}
            disabled={loading || !value.trim() || showError}
            sx={{ flexShrink: 0, minWidth: 140 }}
          >
            {loading ? <CircularProgress size={24} color="inherit" aria-label="Loading" /> : shortcode ? s.btnView : s.btnGo}
          </Button>
        </Stack>
      </Paper>

      {state.status === 'error' && <Alert severity="error">{state.message}</Alert>}
      {state.status === 'shortened' && <ShortLinkResult shortUrl={state.shortUrl} shortcode={state.shortcode} />}
      {state.status === 'inspected' && <Stats data={state.item} />}
      {(state.status === 'shortened' || state.status === 'inspected') && (
        <Button onClick={reset} sx={{ alignSelf: 'center' }}>
          {s.btnReset}
        </Button>
      )}
    </Stack>
  );
}
