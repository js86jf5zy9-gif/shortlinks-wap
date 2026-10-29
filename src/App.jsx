import { Box, Container, Stack } from '@mui/material';
import strings from './data/strings.json';
import { shortcodeFromPath } from './lib/urls';
import SpaceBackground from './components/SpaceBackground';
import Header from './components/Header';
import Converter from './components/Converter';
import Redirect from './components/Redirect';
import HowItWorks from './components/HowItWorks';
import Footer from './components/Footer';
import UpdatePrompt from './components/UpdatePrompt';

export default function App({ location = window.location }) {
  const shortcode = shortcodeFromPath(location.pathname);

  return (
    <>
      <SpaceBackground />
      <Container
        component="main"
        maxWidth="md"
        sx={{ position: 'relative', zIndex: 1, px: { xs: 2, sm: 3 }, minHeight: '100svh' }}
      >
        <Stack alignItems="center" spacing={{ xs: 4, sm: 5 }} sx={{ pt: { xs: 8, sm: 12 } }}>
          <Header {...strings.header} />
          <Box sx={{ width: '100%', maxWidth: 680 }}>
            {shortcode ? <Redirect shortcode={shortcode} preview={Boolean(location.search)} /> : <Converter />}
          </Box>
          {!shortcode && (
            <Box sx={{ width: '100%', pt: { xs: '28vh', md: '38vh' } }}>
              <HowItWorks title={strings.stepsTitle} steps={strings.steps} />
            </Box>
          )}
          <Footer {...strings.footer} />
        </Stack>
      </Container>
      <UpdatePrompt />
    </>
  );
}
