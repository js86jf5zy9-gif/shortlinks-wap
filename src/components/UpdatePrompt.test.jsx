import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useRegisterSW } from 'virtual:pwa-register/react';
import UpdatePrompt from './UpdatePrompt';
import * as swUpdates from '../lib/swUpdates';

vi.mock('virtual:pwa-register/react', () => ({ useRegisterSW: vi.fn() }));

const mockSW = (needRefresh) => {
  const updateServiceWorker = vi.fn();
  useRegisterSW.mockReturnValue({
    needRefresh: [needRefresh, vi.fn()],
    offlineReady: [false, vi.fn()],
    updateServiceWorker,
  });
  return updateServiceWorker;
};

describe('UpdatePrompt', () => {
  it('stays hidden when there is no update', () => {
    mockSW(false);
    render(<UpdatePrompt />);
    expect(screen.queryByText(/new version/i)).not.toBeInTheDocument();
  });

  it('activates the waiting worker when the user reloads', async () => {
    const updateServiceWorker = mockSW(true);
    const apply = vi.spyOn(swUpdates, 'applyUpdate').mockResolvedValue();
    render(<UpdatePrompt />);
    expect(screen.getByText(/new version/i)).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Reload' }));
    expect(apply).toHaveBeenCalledWith(updateServiceWorker);
  });
});
