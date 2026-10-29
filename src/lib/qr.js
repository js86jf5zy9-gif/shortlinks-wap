import QRCode from 'qrcode';

// Dark-on-light keeps the code scannable regardless of the page theme.
export const QR_OPTIONS = {
  errorCorrectionLevel: 'H',
  margin: 2,
  width: 240,
  color: { dark: '#05070f', light: '#f4f6fb' },
};

export const drawQr = (canvas, text) => QRCode.toCanvas(canvas, text, QR_OPTIONS);
