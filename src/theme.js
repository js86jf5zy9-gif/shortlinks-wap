import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: { main: '#7cc4ff', contrastText: '#05070f' },
    secondary: { main: '#ffcf70' },
    error: { main: '#ff8a80' },
    background: { default: '#05070f', paper: 'rgba(14, 20, 38, 0.72)' },
    text: { primary: '#eef2fb', secondary: '#a9b4cc' },
  },
  shape: { borderRadius: 14 },
  typography: {
    fontFamily: 'Inter, ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, sans-serif',
    h1: { fontWeight: 800, letterSpacing: '-0.03em' },
    h2: { fontWeight: 700, letterSpacing: '-0.02em' },
    button: { textTransform: 'none', fontWeight: 600 },
  },
  components: {
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          backdropFilter: 'blur(14px) saturate(140%)',
          WebkitBackdropFilter: 'blur(14px) saturate(140%)',
          border: '1px solid rgba(255,255,255,0.08)',
        },
      },
    },
    MuiButton: {
      defaultProps: { disableElevation: true },
      styleOverrides: { sizeLarge: { minHeight: 56, paddingInline: 28 } },
    },
    MuiOutlinedInput: {
      styleOverrides: { root: { backgroundColor: 'rgba(5, 7, 15, 0.55)' } },
    },
  },
});

export default theme;
