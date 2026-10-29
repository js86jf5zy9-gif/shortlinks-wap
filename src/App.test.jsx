import { render, screen } from '@testing-library/react';
import App from './App';
import * as api from './lib/api';

describe('App', () => {
  it('renders the converter and the space background on the home page', () => {
    render(<App location={{ pathname: '/', search: '' }} />);
    expect(screen.getByRole('textbox', { name: /paste a long link/i })).toBeInTheDocument();
    expect(screen.getByTestId('space-background')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'How it works' })).toBeInTheDocument();
  });

  it('renders the redirect view for a shortcode path', async () => {
    vi.spyOn(api, 'fetchLink').mockResolvedValue({ link: 'https://example.com', redirects: 0, viewers: [] });
    render(<App location={{ pathname: '/aB3x9', search: '?stats' }} />);
    expect(await screen.findByRole('link', { name: 'Continue to link' })).toBeInTheDocument();
    expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
  });
});
