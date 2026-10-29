import { Box, Link, Paper, Stack, Typography } from '@mui/material';
import strings from '../data/strings.json';
import { safeRedirectTarget } from '../lib/urls';

const s = strings.stats;

const Metric = ({ label, value }) => (
  <Box sx={{ flex: 1, minWidth: 0 }}>
    <Typography variant="h4" component="p" sx={{ fontWeight: 700 }}>
      {value}
    </Typography>
    <Typography variant="body2" color="text.secondary">
      {label}
    </Typography>
  </Box>
);

export default function Stats({ data }) {
  if (!data) return null;
  const href = safeRedirectTarget(data.link);
  const views = Array.isArray(data.viewers) ? data.viewers.length : 0;

  return (
    <Paper component="section" aria-label={s.title} sx={{ p: { xs: 2.5, sm: 3 }, textAlign: 'left' }}>
      <Typography variant="overline" color="text.secondary">
        {s.link}
      </Typography>
      <Typography sx={{ wordBreak: 'break-all', mb: 2 }}>
        {href ? (
          <Link href={href} target="_blank" rel="noopener noreferrer">
            {data.link}
          </Link>
        ) : (
          data.link
        )}
      </Typography>
      <Stack direction="row" spacing={3}>
        <Metric label={s.redirects} value={Number(data.redirects) || 0} />
        <Metric label={s.views} value={views} />
      </Stack>
    </Paper>
  );
}
