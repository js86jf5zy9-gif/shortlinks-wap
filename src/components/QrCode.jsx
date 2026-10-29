import { useEffect, useRef } from 'react';
import { Box, Button } from '@mui/material';
import DownloadRounded from '@mui/icons-material/DownloadRounded';
import { drawQr } from '../lib/qr';

export default function QrCode({ value, label, fileName = 'qr-code.png' }) {
  const canvas = useRef(null);

  useEffect(() => {
    if (value && canvas.current) drawQr(canvas.current, value).catch(console.error);
  }, [value]);

  const download = () => {
    const a = document.createElement('a');
    a.href = canvas.current.toDataURL('image/png');
    a.download = fileName;
    a.click();
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1.5 }}>
      <Box
        component="canvas"
        ref={canvas}
        role="img"
        aria-label={`QR code for ${value}`}
        sx={{ width: 200, height: 200, borderRadius: 3, boxShadow: '0 10px 40px rgba(124,196,255,0.18)' }}
      />
      <Button size="small" startIcon={<DownloadRounded />} onClick={download}>
        {label}
      </Button>
    </Box>
  );
}
