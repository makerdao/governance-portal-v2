import { screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, vi, beforeEach, expect } from 'vitest';
import AccountPage from '../../pages/account';
import * as useAccountModule from 'modules/app/hooks/useAccount';
import * as useLockedSkyModule from 'modules/mkr/hooks/useLockedSky';
import * as useAddressInfoModule from 'modules/app/hooks/useAddressInfo';
import * as useDelegateCreateModule from 'modules/delegates/hooks/useDelegateCreate';
import * as useReadContractModule from 'wagmi';
import * as useSimulateContractModule from 'wagmi';
import * as useDelegateVoteModule from 'modules/executive/hooks/useDelegateVote';
import { renderWithTheme } from '../helpers';

vi.mock('lottie-web', () => ({
  default: {
    loadAnimation: vi.fn()
  }
}));

vi.mock('modules/app/hooks/useAccount');
vi.mock('modules/mkr/hooks/useLockedSky');
vi.mock('modules/app/hooks/useAddressInfo');
vi.mock('modules/delegates/hooks/useDelegateCreate');
vi.mock('wagmi');
vi.mock('modules/executive/hooks/useDelegateVote');

describe('AccountPage', () => {
  beforeEach(() => {
    // Mock account and delegate contract not yet created
    vi.mocked(useAccountModule.useAccount).mockReturnValue({
      account: '0x123',
      mutate: vi.fn(),
      voteDelegateContractAddress: undefined,
      votingAccount: '0x123'
    });

    vi.mocked(useLockedSkyModule.useLockedSky).mockReturnValue({
      data: 0n,
      loading: false,
      error: new Error(),
      mutate: vi.fn()
    });

    vi.mocked(useAddressInfoModule.useAddressInfo).mockReturnValue({
      data: undefined,
      error: new Error()
    });

    const mockExecute = vi.fn().mockImplementation(() => {
      // After successful execution, update the account to show delegate contract is created
      vi.mocked(useAccountModule.useAccount).mockReturnValue({
        account: '0x123',
        mutate: vi.fn(),
        voteDelegateContractAddress: '0x456', // Now we have a delegate contract
        votingAccount: '0x123'
      });
      return Promise.resolve({ hash: '0x789' });
    });

    vi.mocked(useDelegateCreateModule.useDelegateCreate).mockReturnValue({
      isLoading: false,
      prepared: true,
      execute: mockExecute,
      data: undefined,
      error: null,
      retryPrepare: vi.fn(),
      prepareError: null
    });

    vi.mocked(useReadContractModule.useReadContract).mockReturnValue({
      data: 0n,
      isError: false,
      error: null,
      isPending: false,
      isLoading: false,
      isLoadingError: false,
      isRefetchError: false,
      isSuccess: true,
      isPlaceholderData: false,
      status: 'success',
      dataUpdatedAt: Date.now(),
      errorUpdatedAt: Date.now(),
      failureCount: 0,
      failureReason: null,
      errorUpdateCount: 0,
      isFetched: true,
      isFetchedAfterMount: true,
      isFetching: false,
      isRefetching: false,
      isStale: false,
      isInitialLoading: false,
      isPaused: false,
      refetch: vi.fn(),
      fetchStatus: 'idle',
      promise: Promise.resolve(),
      queryKey: []
    });

    // Mock useSimulateContract
    vi.mocked(useSimulateContractModule.useSimulateContract).mockReturnValue({
      data: {
        request: {} as any,
        result: undefined
      },
      error: null,
      isError: false,
      isPending: false,
      isLoading: false,
      isLoadingError: false,
      isRefetchError: false,
      isSuccess: true,
      isPlaceholderData: false,
      status: 'success',
      dataUpdatedAt: Date.now(),
      errorUpdatedAt: Date.now(),
      failureCount: 0,
      failureReason: null,
      errorUpdateCount: 0,
      isFetched: true,
      isFetchedAfterMount: true,
      isFetching: false,
      isRefetching: false,
      isStale: false,
      isInitialLoading: false,
      isPaused: false,
      refetch: vi.fn(),
      fetchStatus: 'idle',
      promise: Promise.resolve(),
      queryKey: []
    });

    // Mock useDelegateVote
    vi.mocked(useDelegateVoteModule.useDelegateVote).mockReturnValue({
      isLoading: false,
      prepared: true,
      execute: vi.fn(),
      data: undefined,
      error: null,
      retryPrepare: vi.fn(),
      prepareError: null
    });
  });

  it('shows modal with "Support address(0)" after creating delegate contract', async () => {
    renderWithTheme(<AccountPage />);

    // Accept warning checkbox
    const warningLabel = screen.getByTestId('checkbox-create-delegate');
    fireEvent.click(warningLabel);

    // Click "Create delegate contract"
    const createButton = screen.getByTestId('create-button');
    expect(createButton).toBeInTheDocument();
    fireEvent.click(createButton);

    // Wait for the vote button to appear
    await waitFor(() => {
      expect(screen.getByTestId('vote-button')).toBeInTheDocument();
    });

    // Verify the modal content
    expect(screen.getByText(/voting for address\(0\) now, even with 0 sky delegated/i)).toBeInTheDocument();
  });
});
