import { screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, vi, beforeEach, expect } from 'vitest';
import AccountPage from '../../pages/account';
import * as useAccountModule from 'modules/app/hooks/useAccount';
import * as useLockedSkyModule from 'modules/sky/hooks/useLockedSky';
import * as useAddressInfoModule from 'modules/app/hooks/useAddressInfo';
import * as useDelegateCreateModule from 'modules/delegates/hooks/useDelegateCreate';
import * as useReadContractModule from 'wagmi';
import * as useSimulateContractModule from 'wagmi';
import * as useDelegateVoteModule from 'modules/executive/hooks/useDelegateVote';
import * as useVotedProposalsModule from 'modules/executive/hooks/useVotedProposals';
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
vi.mock('modules/executive/hooks/useVotedProposals');

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

    // Mock useVotedProposals - default to empty array (not voted for address zero)
    vi.mocked(useVotedProposalsModule.useVotedProposals).mockReturnValue({
      data: [],
      loading: false,
      error: null,
      mutate: vi.fn()
    });
  });

  it('should show "No vote delegate contract detected" when no delegate contract exists', () => {
    renderWithTheme(<AccountPage />);

    expect(screen.getByText('No vote delegate contract detected')).toBeInTheDocument();
  });

  it('should disable create button when warning checkbox is unchecked and user has a chief balance', () => {
    // Mock a non-zero locked SKY balance
    vi.mocked(useLockedSkyModule.useLockedSky).mockReturnValue({
      data: 100000000000000000000n, // 100 SKY
      loading: false,
      error: null,
      mutate: vi.fn()
    });

    renderWithTheme(<AccountPage />);

    const createButton = screen.getByTestId('create-button');
    expect(createButton).toBeInTheDocument();
    expect(createButton).toBeDisabled();
  });

  it('should enable create button when warning checkbox is checked when user has a chief balance', () => {
    // Mock a non-zero locked SKY balance
    vi.mocked(useLockedSkyModule.useLockedSky).mockReturnValue({
      data: 100000000000000000000n, // 100 SKY
      loading: false,
      error: null,
      mutate: vi.fn()
    });

    renderWithTheme(<AccountPage />);

    const warningLabel = screen.getByTestId('checkbox-create-delegate');
    const createButton = screen.getByTestId('create-button');

    // Initial state - button should be disabled
    expect(createButton).toBeDisabled();

    // Click the checkbox
    fireEvent.click(warningLabel);

    // Button should now be enabled
    expect(createButton).toBeEnabled();
  });

  it('shows modal with "Support address(0)" after creating delegate contract', async () => {
    renderWithTheme(<AccountPage />);

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

  it('should show warning about losing UI voting capability with existing chief balance', () => {
    // Mock a non-zero chief balance
    vi.mocked(useLockedSkyModule.useLockedSky).mockReturnValue({
      data: 100000000000000000000n, // 100 SKY
      loading: false,
      error: null,
      mutate: vi.fn()
    });

    renderWithTheme(<AccountPage />);

    // Verify the warning message is shown
    expect(screen.getByText(/deposited in the voting contract/i)).toBeInTheDocument();
    const balanceSpan = screen.getByText((content, element) => {
      return element?.tagName.toLowerCase() === 'span' && content.includes('100');
    });
    expect(balanceSpan).toBeInTheDocument();
    expect(
      screen.getByText(
        /If you become a delegate, you will only be able to vote as a delegate through the portal. It is recommended you either withdraw your SKY and delegate it to yourself or use a different account to create the delegate contract\./i
      )
    ).toBeInTheDocument();
  });

  it('should open modal when clicking "Create delegate contract"', () => {
    renderWithTheme(<AccountPage />);

    // Click "Create delegate contract"
    const createButton = screen.getByTestId('create-button');
    fireEvent.click(createButton);

    // Verify modal is open by checking for modal content
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByLabelText('Delegate modal')).toBeInTheDocument();
  });

  it('should show "You are supporting address(0)" message when user has already voted for address(0)', () => {
    // Mock a delegate contract address
    vi.mocked(useAccountModule.useAccount).mockReturnValue({
      account: '0x123',
      mutate: vi.fn(),
      voteDelegateContractAddress: '0x456',
      votingAccount: '0x123'
    });

    // Mock that the user has already voted for address(0)
    vi.mocked(useVotedProposalsModule.useVotedProposals).mockReturnValue({
      data: ['0x0000000000000000000000000000000000000000'], // ZERO_ADDRESS
      loading: false,
      error: null,
      mutate: vi.fn()
    });

    renderWithTheme(<AccountPage />);

    // Verify the "You are supporting address(0)" message is displayed
    expect(
      screen.getByText(
        /you are supporting address\(0\)\. thank you for contributing to the launch of sky governance\./i
      )
    ).toBeInTheDocument();
  });

  it('should not show "Support address(0)" section when chief is live', () => {
    // Mock a delegate contract address
    vi.mocked(useAccountModule.useAccount).mockReturnValue({
      account: '0x123',
      mutate: vi.fn(),
      voteDelegateContractAddress: '0x456',
      votingAccount: '0x123'
    });

    // Mock that the chief is live (value of 1n)
    vi.mocked(useReadContractModule.useReadContract).mockReturnValue({
      data: 1n, // Chief is live
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

    renderWithTheme(<AccountPage />);

    // Verify the "Support the Launch of SKY Governance" section is not displayed
    expect(screen.queryByText(/support the launch of sky governance/i)).not.toBeInTheDocument();

    // Verify the "Support address(0)" button is not displayed
    expect(screen.queryByTestId('vote-button')).not.toBeInTheDocument();
  });

  it('should display the delegate contract address when it exists', () => {
    // Mock a delegate contract address
    vi.mocked(useAccountModule.useAccount).mockReturnValue({
      account: '0x123',
      mutate: vi.fn(),
      voteDelegateContractAddress: '0x456',
      votingAccount: '0x123'
    });

    renderWithTheme(<AccountPage />);

    // Verify the delegate contract address label is displayed
    expect(screen.getByText('Your delegate contract address:')).toBeInTheDocument();

    // Verify the delegate contract address is displayed (it's displayed as "0x456...x456")
    expect(
      screen.getByText((content, element) => {
        return element?.tagName.toLowerCase() === 'span' && content.includes('0x456');
      })
    ).toBeInTheDocument();
  });

  it('should display the delegate contract address when it exists (after creation)', () => {
    // Mock a delegate contract address directly
    vi.mocked(useAccountModule.useAccount).mockReturnValue({
      account: '0x123',
      mutate: vi.fn(),
      voteDelegateContractAddress: '0x456', // Already have a delegate contract
      votingAccount: '0x123'
    });

    renderWithTheme(<AccountPage />);

    // Verify the delegate contract address label is displayed
    expect(screen.getByText('Your delegate contract address:')).toBeInTheDocument();

    // Verify the delegate contract address is displayed (it's displayed as "0x456...x456")
    expect(
      screen.getByText((content, element) => {
        return element?.tagName.toLowerCase() === 'span' && content.includes('0x456');
      })
    ).toBeInTheDocument();
  });
});
