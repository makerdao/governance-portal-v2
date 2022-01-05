// @ts-nocheck
import { act, fireEvent, configure, screen } from '@testing-library/react';
import getMaker, { MKR } from 'lib/maker';
import DelegatesPage from '../../pages/delegates';
import {
  connectAccount,
  renderWithAccountSelect as render,
  createDelegate,
  switchAccount,
  DEMO_ACCOUNT_TESTS,
  sendMkrToAddress
} from '../helpers';
import { SWRConfig } from 'swr';
import { DelegatesAPIResponse } from 'modules/delegates/types';
import { DelegateStatusEnum } from 'modules/delegates/delegates.constants';

const NEXT_ACCOUNT = '0x81431b69b1e0e334d4161a13c2955e0f3599381e';

export const aproveDelegateContractAndAddMKR = async (
  maker,
  voteDelegateAddress: string,
  mkrToDeposit: number
): void => {
  const mkr = await maker.getToken(MKR);
  await mkr.approveUnlimited(voteDelegateAddress);

  // this is only to verify the lock deposits worked, it can be deleted:
  const preLockDeposits = await maker.service('chief').getNumDeposits(voteDelegateAddress);
  console.log('preLockDeposits', preLockDeposits);

  await maker.service('voteDelegate').lock(voteDelegateAddress, mkrToDeposit);

  // this is only to verify the lock deposits worked, it can be deleted:
  const postLockDeposits = await maker.service('chief').getNumDeposits(voteDelegateAddress);
  console.log('postLockDeposits', postLockDeposits);
};

const getMockedDelegates = delegatesConfig => [
  {
    address: DEMO_ACCOUNT_TESTS,
    description: 'I AM DELEGATEMAN',
    expirationDate: new Date('2022-07-08T14:00:24.000Z'),
    expired: false,
    id: '0xc8829647c8e4131a01354ccac993388568d12d00',
    lastVote: new Date('2021-07-19T23:40:18.158Z'),
    name: 'Lee Robinson',
    picture:
      'https://raw.githubusercontent.com/makerdao-dux/voting-delegates/main/delegates/0xc8829647c8e4131a01354ccac993388568d12d00/profile.jpg',
    status: DelegateStatusEnum.recognized,
    voteDelegateAddress: delegatesConfig.voteDelegateAddress,
    mkrDelegated: 0
  },
  {
    address: '0x000',
    description: 'Delegate Two',
    expirationDate: new Date('2022-07-08T14:00:24.000Z'),
    expired: false,
    id: '0x000',
    lastVote: new Date('2021-07-19T23:40:18.158Z'),
    name: 'James McClaunkin',
    picture:
      'https://raw.githubusercontent.com/makerdao-dux/voting-delegates/main/delegates/0xc8829647c8e4131a01354ccac993388568d12d00/profile.jpg',
    status: DelegateStatusEnum.shadow,
    voteDelegateAddress: '0x000',
    mkrDelegated: 0
  }
];

const getMockApiResponse = (config): DelegatesAPIResponse => ({
  delegates: getMockedDelegates(config.delegates),
  stats: {
    total: 2,
    shadow: 1,
    recognized: 1,
    totalMKRDelegated: 10.24
  }
});

jest.mock('@theme-ui/match-media', () => {
  return {
    useBreakpointIndex: jest.fn(() => 3)
  };
});

const { click } = fireEvent;
let maker, voteDelegateAddress;

async function setup(maker, mockResponse) {
  const view = render(
    <SWRConfig value={{ dedupingInterval: 0, refreshInterval: 10 }}>
      <DelegatesPage delegates={mockResponse.delegates} stats={mockResponse.stats} />
    </SWRConfig>
  );

  await act(async () => {
    // This sets the account in state
    await connectAccount(maker.currentAccount().address);
  });
  return view;
}

describe('Delegates list page', () => {
  const mkrToDeposit = '3.2';

  beforeAll(async () => {
    jest.setTimeout(30000);
    configure({ asyncUtilTimeout: 4500 });
    maker = await getMaker();

    sendMkrToAddress(maker, NEXT_ACCOUNT, '5');

    voteDelegateAddress = await createDelegate(maker);

    /**
     * This breaks the test 'can delegate MKR to a delegate'
     * because now there is additional MKR delegated in the UI.
     * Need to update the values expected in that test.
     */
    const amountToLock = 1;
    await aproveDelegateContractAndAddMKR(maker, voteDelegateAddress, amountToLock);

    // Change to a new, non-delegate account
    await switchAccount(maker);
  });

  beforeEach(async () => {
    const mockResponse = getMockApiResponse({ delegates: { voteDelegateAddress } });
    await setup(maker, mockResponse);
  });

  test('List delegates, shows all delegates', async () => {
    // Should show a list of delegates
    await screen.findAllByText('Recognized Delegates');

    // finds the shadow delegates title
    await screen.findAllByText('Shadow Delegates');

    const delegateCards = await screen.findAllByTestId('delegate-card');

    // There should be 2 delegates
    expect(delegateCards.length).toEqual(2);

    const buttonFilter = await screen.findByTestId('delegate-type-filter');

    click(buttonFilter);

    const buttonFilterRecognized = await screen.findByTestId('delegate-type-filter-show-recognized');
    await screen.findByTestId('delegate-type-filter-show-shadow');

    // Filters by only recognized delegates
    click(buttonFilterRecognized);

    const delegateCardsFiltered = await screen.findAllByTestId('delegate-card');

    expect(delegateCardsFiltered.length).toEqual(1);

    // Clear filters
    const buttonResetFilters = await screen.findByTestId('delegate-reset-filters');
    click(buttonResetFilters);

    const delegatesRestored = await screen.findAllByTestId('delegate-card');
    expect(delegatesRestored.length).toEqual(2);
  });

  test('Delegates System Info', async () => {
    await screen.findByText(
      'System Info',
      {},
      {
        timeout: 30000
      }
    );

    const totalDelegatesSystemInfo = screen.getByTestId('total-delegates-system-info');
    expect(totalDelegatesSystemInfo).toHaveTextContent('2');

    const totalRecognizedDelegatesSystemInfo = screen.getByTestId('total-recognized-delegates-system-info');
    expect(totalRecognizedDelegatesSystemInfo).toHaveTextContent('1');

    const totalShadowDelegatesSystemInfo = screen.getByTestId('total-shadow-delegates-system-info');
    expect(totalShadowDelegatesSystemInfo).toHaveTextContent('1');

    // Checks that the percentage of MKR delegated appears on the screen
    const percentMKRDelegated = screen.getByTestId('percent-mkr-system-info');
    const hasPercent = percentMKRDelegated.textContent.indexOf('%') !== -1;
    expect(hasPercent).toBe(true);

    const totalMkr = screen.getByTestId('total-mkr-system-info');
    expect(totalMkr).toHaveTextContent('10.24');
  });

  test('can delegate MKR to a delegate', async () => {
    await screen.findAllByText('Recognized Delegates');

    // Open delegate modal
    const delegateButton = screen.getAllByText('Delegate');
    click(delegateButton[0]);

    // Approval Process
    const approveMKRButton = screen.getByText('Approve Delegate Contract', { selector: 'button' });
    click(approveMKRButton);

    // Transaction is initialized
    await screen.findByText('Confirm Transaction');
    // Transaction state moved to pending
    await screen.findByText('Transaction Pending');
    // Deposit input appears
    await screen.findByText('Deposit into delegate contract');

    const input = screen.getByTestId('mkr-input');
    fireEvent.change(input, { target: { value: mkrToDeposit } });

    // Delegate Process
    const delegateMKRButton = screen.getByText('Delegate MKR', { selector: 'button' });
    click(delegateMKRButton);

    // Make sure modal displays etherscan links correctly
    screen.getByText(/You are delegating/);
    const [delegateLink, creatorLink] = screen.getAllByRole('link');

    expect(delegateLink).toHaveAttribute('href', `https://etherscan.io/address/${voteDelegateAddress}`);
    screen.getByText(/This delegate contract was created by/);
    expect(creatorLink).toHaveAttribute('href', `https://etherscan.io/address/${DEMO_ACCOUNT_TESTS}`);

    const confirmButton = await screen.findByText(/Confirm Transaction/, { selector: 'button' });
    click(confirmButton);

    // Wait for transactions again...
    await screen.findByText('Transaction Pending');
    await screen.findByText('Transaction Sent');

    // UI updates to display totals correctly
    const [delegatedTotal, delegatedByYou] = await screen.findAllByText(/3.20/);
    expect(delegatedTotal.parentElement).toHaveTextContent(/Total MKR delegated/);
    expect(delegatedByYou.parentElement).toHaveTextContent(/MKR delegated by you/);

    // Open undelegate modal
    const unDelegateButton = screen.getAllByText('Undelegate');
    click(unDelegateButton[0]);

    // IOU Approval Process
    const approveIOUButton = screen.getByText('Approve Delegate Contract', { selector: 'button' });
    click(approveIOUButton);

    // More transaction screens...
    await screen.findByText('Confirm Transaction');
    await screen.findByText('Transaction Pending');
    await screen.findByText('Withdraw from delegate contract');

    // Set max button adds input value correctly
    const setMaxButton = screen.getByRole('button', { name: /Set max/ });
    click(setMaxButton);

    const unInput = screen.getByRole('spinbutton') as HTMLInputElement;
    expect(unInput.value).toBe('3.2');

    const undelegateMKRButton = screen.getByText('Undelegate MKR', { selector: 'button' });
    click(undelegateMKRButton);

    // Wait for transactions again...
    await screen.findByText('Transaction Pending');
    await screen.findByText('Transaction Sent');

    // Close the modal
    const closeUndelegateBtn = screen.getByText(/Close/, { selector: 'button' });
    click(closeUndelegateBtn);

    // Voting weights are returned to 0 after undelegating
    const newTotal = screen.getAllByTestId('total-mkr-delegated');
    const newByYou = await screen.findAllByText(/MKR delegated by you/);

    expect(newTotal[0]).toHaveTextContent('0.00');
    expect(newByYou[0].previousSibling).toHaveTextContent('0.00');
  });
});
