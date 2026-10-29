import { Box, Typography } from '@mui/material';
import QrCode2Rounded from '@mui/icons-material/QrCode2Rounded';

export default function Header({ title, caption }) {
  return (
    <Box component="header" sx={{ textAlign: 'center' }}>
      <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
        <QrCode2Rounded color="primary" sx={{ fontSize: { xs: 40, sm: 52 } }} />
        <Typography
          variant="h1"
          sx={{
            fontSize: { xs: '2.75rem', sm: '4rem' },
            background: 'linear-gradient(120deg, #eef2fb 30%, #7cc4ff 100%)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            color: 'transparent',
          }}
        >
          {title}
        </Typography>
      </Box>
      <Typography variant="h6" component="p" color="text.secondary" sx={{ fontWeight: 400, maxWidth: 520, mx: 'auto' }}>
        {caption}
      </Typography>
    </Box>
  );
}
