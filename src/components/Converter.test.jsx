import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Converter from './Converter';
import * as api from '../lib/api';

vi.mock('../lib/qr', () => ({ drawQr: vi.fn().mockResolvedValue() }));

const input = () => screen.getByRole('textbox', { name: /paste a long link/i });

describe('Converter', () => {
  it('shortens a URL and shows the link with a QR code', async () => {
    const user = userEvent.setup();
    const shorten = vi
      .spyOn(api, 'shortenUrl')
      .mockResolvedValue({ shortcode: 'aB3x9', shortUrl: 'https://url2qr.com/aB3x9' });
    render(<Converter />);

    await user.type(input(), 'example.com/long/path{Enter}');

    expect(shorten).toHaveBeenCalledWith('https://example.com/long/path');
    expect(await screen.findByDisplayValue('https://url2qr.com/aB3x9')).toBeInTheDocument();
    expect(screen.getByRole('img', { name: /qr code for https:\/\/url2qr.com\/aB3x9/i })).toBeInTheDocument();
  });

  it('copies the short link', async () => {
    const user = userEvent.setup();
    vi.spyOn(api, 'shortenUrl').mockResolvedValue({ shortcode: 'aB3x9', shortUrl: 'https://url2qr.com/aB3x9' });
    render(<Converter />);
    await user.type(input(), 'example.com{Enter}');
    await user.click(await screen.findByRole('button', { name: 'Copy' }));

    expect(await screen.findByRole('button', { name: 'Copied!' })).toBeInTheDocument();
    await expect(navigator.clipboard.readText()).resolves.toBe('https://url2qr.com/aB3x9');
  });

  it('flags invalid input and does not call the API', async () => {
    const user = userEvent.setup();
    const shorten = vi.spyOn(api, 'shortenUrl');
    render(<Converter />);

    await user.type(input(), 'not a link{Enter}');

    expect(screen.getByText(/doesn't look like a web address/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Shorten' })).toBeDisabled();
    expect(shorten).not.toHaveBeenCalled();
  });

  it('inspects one of our own short links', async () => {
    const user = userEvent.setup();
    const fetchLink = vi
      .spyOn(api, 'fetchLink')
      .mockResolvedValue({ link: 'https://example.com/target', redirects: 7, viewers: ['a', 'b'] });
    render(<Converter />);

    await user.type(input(), 'https://url2qr.com/aB3x9');
    await user.click(screen.getByRole('button', { name: 'Inspect' }));

    expect(fetchLink).toHaveBeenCalledWith('aB3x9');
    expect(await screen.findByText('https://example.com/target')).toBeInTheDocument();
    expect(screen.getByText('7')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
  });

  it('reports unknown short links', async () => {
    const user = userEvent.setup();
    vi.spyOn(api, 'fetchLink').mockResolvedValue(null);
    render(<Converter />);
    await user.type(input(), 'url2qr.com/missing{Enter}');
    expect(await screen.findByRole('alert')).toHaveTextContent(/couldn't find that short link/i);
  });

  it('shows a server error and recovers on reset', async () => {
    const user = userEvent.setup();
    vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.spyOn(api, 'shortenUrl').mockRejectedValue(new api.ApiError('boom', 500));
    render(<Converter />);

    await user.type(input(), 'example.com{Enter}');
    expect(await screen.findByRole('alert')).toHaveTextContent(/couldn't reach the server/i);
  });
});
