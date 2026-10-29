import { render, screen } from '@testing-library/react';
import Redirect from './Redirect';
import * as api from '../lib/api';

describe('Redirect', () => {
  it('sends the visitor to the stored link', async () => {
    vi.spyOn(api, 'fetchLink').mockResolvedValue({ link: 'https://example.com/t', redirects: 1, viewers: [] });
    const navigate = vi.fn();
    render(<Redirect shortcode="aB3x9" navigate={navigate} />);

    expect(screen.getByText(/redirecting you to/i)).toBeInTheDocument();
    await vi.waitFor(() => expect(navigate).toHaveBeenCalledWith('https://example.com/t'));
  });

  it('adds https to legacy links stored without a scheme', async () => {
    vi.spyOn(api, 'fetchLink').mockResolvedValue({ link: 'example.com/t' });
    const navigate = vi.fn();
    render(<Redirect shortcode="aB3x9" navigate={navigate} />);
    await vi.waitFor(() => expect(navigate).toHaveBeenCalledWith('https://example.com/t'));
  });

  it('shows a preview instead of redirecting when asked', async () => {
    vi.spyOn(api, 'fetchLink').mockResolvedValue({ link: 'https://example.com/t', redirects: 3, viewers: [1] });
    const navigate = vi.fn();
    render(<Redirect shortcode="aB3x9" preview navigate={navigate} />);

    expect(await screen.findByRole('link', { name: 'Continue to link' })).toHaveAttribute('href', 'https://example.com/t');
    expect(navigate).not.toHaveBeenCalled();
  });

  it('never follows non-http links', async () => {
    vi.spyOn(api, 'fetchLink').mockResolvedValue({ link: 'javascript:alert(1)' });
    const navigate = vi.fn();
    render(<Redirect shortcode="aB3x9" navigate={navigate} />);

    expect(await screen.findByText(/won't send you automatically/i)).toBeInTheDocument();
    expect(navigate).not.toHaveBeenCalled();
  });

  it('explains unknown shortcodes and API failures', async () => {
    vi.spyOn(api, 'fetchLink').mockResolvedValueOnce(null);
    const { unmount } = render(<Redirect shortcode="nope" navigate={vi.fn()} />);
    expect(await screen.findByText(/doesn't exist/i)).toBeInTheDocument();
    unmount();

    vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.spyOn(api, 'fetchLink').mockRejectedValueOnce(new Error('down'));
    render(<Redirect shortcode="nope" navigate={vi.fn()} />);
    expect(await screen.findByText(/couldn't look up/i)).toBeInTheDocument();
  });
});
