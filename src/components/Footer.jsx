import { Box, Link, Typography } from '@mui/material';

export default function Footer({ link, creator }) {
  return (
    <Box
      component="footer"
      sx={{
        display: 'flex',
        justifyContent: 'space-between',
        gap: 2,
        width: '100%',
        py: 3,
        pb: 'max(24px, env(safe-area-inset-bottom))',
        color: 'text.secondary',
      }}
    >
      <Typography variant="body2">© {new Date().getFullYear()} url2qr</Typography>
      <Typography variant="body2">
        Made with ❤️ by{' '}
        <Link href={link} target="_blank" rel="noreferrer">
          {creator}
        </Link>
      </Typography>
    </Box>
  );
}
