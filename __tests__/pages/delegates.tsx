import { act, fireEvent, configure, screen } from '@testing-library/react';
import getMaker from '../../lib/maker';
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
import * as utils from '../../lib/utils';
import { DelegatesAPIResponse } from 'types/delegatesAPI';
import { DelegateStatusEnum } from 'lib/delegates/constants';

const NEXT_ACCOUNT = '0x81431b69b1e0e334d4161a13c2955e0f3599381e';
const DELEGATE_ADDRESS = '0xfcdD2B5501359B70A20e3D79Fd7C41c5155d7d07';

const MOCK_DELEGATES = [
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
    voteDelegateAddress: DELEGATE_ADDRESS,
    mkrDelegated: 0
  }
];

const MOCK_API_RESPONSE: DelegatesAPIResponse = {
  delegates: MOCK_DELEGATES,
  stats: {
    total: 1,
    shadow: 0,
    recognized: 1,
    totalMKRDelegated: 10.24
  }
};

const mockGetUsers = jest.spyOn(utils, 'fetchJson');
mockGetUsers.mockResolvedValue(MOCK_API_RESPONSE);

jest.mock('@theme-ui/match-media', () => {
  return {
    useBreakpointIndex: jest.fn(() => 3)
  };
});

const { click } = fireEvent;
let maker;

async function setup(maker) {
  const view = render(
    <SWRConfig value={{ dedupingInterval: 0, refreshInterval: 10 }}>
      <DelegatesPage delegates={[]} stats={MOCK_API_RESPONSE.stats}/>
    </SWRConfig>
  );

  await act(async () => {
    // This sets the account in state
    await connectAccount(view, maker.currentAccount().address);
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

    await createDelegate(maker);
    // Change to a new, non-delegate account
    await switchAccount(maker);

    await setup(maker);
  });

  test('can delegate MKR to a delegate', async () => {
    await screen.findByText('Recognized Delegates');

    // Open delegate modal
    const delegateButton = screen.getByText('Delegate');
    click(delegateButton);

    // Approval Process
    const approveMKRButton = screen.getByText('Approve Delegate Contract', { selector: 'button' });
    click(approveMKRButton);

    // Transaction is initialized
    await screen.findByText('Confirm transaction');
    // Transaction state moved to pending
    await screen.findByText('Transaction pending');
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

    expect(delegateLink).toHaveAttribute('href', `https://etherscan.io/address/${DELEGATE_ADDRESS}`);
    screen.getByText(/This delegate contract was created by/);
    expect(creatorLink).toHaveAttribute('href', `https://etherscan.io/address/${DEMO_ACCOUNT_TESTS}`);

    const confirmButton = await screen.findByText(/Confirm Transaction/, { selector: 'button' });
    click(confirmButton);

    // Wait for transactions again...
    await screen.findByText('Transaction pending');
    await screen.findByText('Transaction Sent');

    // UI updates to display totals correctly
    const [delegatedTotal, delegatedByYou] = await screen.findAllByText(/3.20/);
    expect(delegatedTotal.parentElement).toHaveTextContent(/Total MKR delegated/);
    expect(delegatedByYou.parentElement).toHaveTextContent(/MKR delegated by you/);

    // Open undelegate modal
    const unDelegateButton = screen.getByText('Undelegate');
    click(unDelegateButton);

    // IOU Approval Process
    const approveIOUButton = screen.getByText('Approve Delegate Contract', { selector: 'button' });
    click(approveIOUButton);

    // More transaction screens...
    await screen.findByText('Confirm transaction');
    await screen.findByText('Transaction pending');
    await screen.findByText('Withdraw from delegate contract');

    // Set max button adds input value correctly
    const setMaxButton = screen.getByRole('button', { name: /Set max/ });
    click(setMaxButton);

    const unInput = screen.getByRole('spinbutton') as HTMLInputElement;
    expect(unInput.value).toBe('3.2');

    const undelegateMKRButton = screen.getByText('Undelegate MKR', { selector: 'button' });
    click(undelegateMKRButton);

    // Wait for transactions again...
    await screen.findByText('Transaction pending');
    await screen.findByText('Transaction Sent');

    // Close the modal
    const closeUndelegateBtn = screen.getByText(/Close/, { selector: 'button' });
    click(closeUndelegateBtn);

    // Voting weights are returned to 0 after undelegating
    const newTotal = screen.getByTestId('total-mkr-delegated');
    const newByYou = await screen.findByText(/MKR delegated by you/);

    expect(newTotal).toHaveTextContent('0.00');
    expect(newByYou.previousSibling).toHaveTextContent('0.00');
  });


  describe('Delegates system info', async () => {
    await screen.findByText('Delegate System Info');
    
    const totalDelegatesSystemInfo = screen.getByTestId('total-delegates-system-info');
    expect(totalDelegatesSystemInfo).toHaveTextContent('1');

    const totalRecognizedDelegatesSystemInfo = screen.getByTestId('total-recognized-delegates-system-info');
    expect(totalRecognizedDelegatesSystemInfo).toHaveTextContent('1');

    const totalShadowDelegatesSystemInfo = screen.getByTestId('total-shadow-delegates-system-info');
    expect(totalShadowDelegatesSystemInfo).toHaveTextContent('0');
    
    const totalMkr = screen.getByTestId('total-mkr-system-info');
    expect(totalMkr).toHaveTextContent('10.00');
    
  });
});
