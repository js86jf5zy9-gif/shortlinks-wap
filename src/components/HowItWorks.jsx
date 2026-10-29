import { Box, Paper, Typography } from '@mui/material';
import LinkRounded from '@mui/icons-material/LinkRounded';
import QrCode2Rounded from '@mui/icons-material/QrCode2Rounded';
import InsightsRounded from '@mui/icons-material/InsightsRounded';

const ICONS = [LinkRounded, QrCode2Rounded, InsightsRounded];

export default function HowItWorks({ title, steps }) {
  return (
    <Box component="section" aria-labelledby="how-it-works" sx={{ width: '100%' }}>
      <Typography id="how-it-works" variant="h2" sx={{ fontSize: { xs: '1.75rem', sm: '2.25rem' }, textAlign: 'center', mb: 3 }}>
        {title}
      </Typography>
      <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' } }}>
        {steps.map(({ title: stepTitle, body }, i) => {
          const Icon = ICONS[i % ICONS.length];
          return (
            <Paper key={stepTitle} sx={{ p: 3 }}>
              <Icon color="primary" sx={{ fontSize: 32, mb: 1 }} />
              <Typography variant="h6" component="h3" gutterBottom>
                {stepTitle}
              </Typography>
              <Typography color="text.secondary">{body}</Typography>
            </Paper>
          );
        })}
      </Box>
    </Box>
  );
}
