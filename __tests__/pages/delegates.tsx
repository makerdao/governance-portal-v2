import { act, fireEvent, configure } from '@testing-library/react';
import getMaker from '../../lib/maker';
import DelegatesPage from '../../pages/delegates';
import {
  injectProvider,
  connectAccount,
  renderWithAccountSelect as render,
  createDelegate,
  switchAccount,
  DEMO_ACCOUNT_TESTS,
  sendMkrToAddress
} from '../helpers';
import mixpanel from 'mixpanel-browser';
import { SWRConfig } from 'swr';
import * as utils from '../../lib/utils';
import { accountsApi } from 'stores/accounts';

const NEXT_ACCOUNT = '0x81431b69b1e0e334d4161a13c2955e0f3599381e';
const DELEGATE_ADDRESS = '0xfcdD2B5501359B70A20e3D79Fd7C41c5155d7d07';

const MOCK_DELEGATES = [
  {
    address: DEMO_ACCOUNT_TESTS,
    description: 'I AM DELEGATEMAN',
    expirationDate: '2022-07-08T14:00:24.000Z',
    expired: false,
    id: '0xc8829647c8e4131a01354ccac993388568d12d00',
    lastVote: '2021-07-19T23:40:18.158Z',
    name: 'Lee Robinson',
    picture:
      'https://raw.githubusercontent.com/makerdao-dux/voting-delegates/main/delegates/0xc8829647c8e4131a01354ccac993388568d12d00/profile.jpg',
    status: 'active',
    voteDelegateAddress: DELEGATE_ADDRESS
  }
];

const mockGetUsers = jest.spyOn(utils, 'fetchJson');
mockGetUsers.mockResolvedValue(MOCK_DELEGATES);

jest.mock('@theme-ui/match-media', () => {
  return {
    useBreakpointIndex: jest.fn(() => 3)
  };
});

const { click } = fireEvent;
let component, maker;

async function setup(maker) {
  const comp = render(
    <SWRConfig value={{ dedupingInterval: 0, refreshInterval: 10 }}>
      <DelegatesPage delegates={[]} />
    </SWRConfig>
  );

  await act(async () => {
    // This sets the account in state
    await connectAccount(comp, maker.currentAccount().address);
  });
  return comp;
}

describe('Delegate Create page', () => {
  const mkrToDeposit = '3.2';

  beforeAll(async () => {
    jest.setTimeout(30000);
    configure({ asyncUtilTimeout: 4500 });
    maker = await getMaker();
    injectProvider();

    sendMkrToAddress(maker, NEXT_ACCOUNT, '5');

    await createDelegate(maker);
    // Change to a new, non-delegate account
    await switchAccount(maker);
    mixpanel.track = () => {};
  });

  beforeEach(async () => {
    component = await setup(maker);
  });

  // //TODO does it need to be async?
  // afterEach(async () => {
  //   await act(async () => {
  //     await accountsApi.getState().disconnectAccount();
  //   });
  // });

  test('can delegate MKR to a delegate', async () => {
    await component.findByText('Recognized delegates');

    // Open delegate modal
    const delegateButton = component.getByText('Delegate');
    click(delegateButton);

    // Approval Process
    const approveMKRButton = component.getByText('Approve Delegate Contract', { selector: 'button' });
    click(approveMKRButton);

    // Transaction is initialized
    await component.findByText('Confirm transaction');
    // Transaction state moved to pending
    await component.findByText('Transaction pending');
    // Deposit input appears
    await component.findByText('Deposit into delegate contract');

    const input = component.getByTestId('mkr-input');
    fireEvent.change(input, { target: { value: mkrToDeposit } });

    // Delegate Process
    const delegateMKRButton = component.getByText('Delegate MKR', { selector: 'button' });
    click(delegateMKRButton);

    // Make sure modal displays etherscan links correctly
    component.getByText(/You are delegating/);
    //TODO install type defs
    expect(component.getByText(DELEGATE_ADDRESS).closest('a')).toHaveAttribute(
      'href',
      `https://etherscan.io/address/${DELEGATE_ADDRESS}`
    );
    component.getByText(/This delegate contract was created by/);
    expect(component.getByText(DEMO_ACCOUNT_TESTS).closest('a')).toHaveAttribute(
      'href',
      `https://etherscan.io/address/${DEMO_ACCOUNT_TESTS}`
    );

    const confirmButton = await component.findByText(/Confirm Transaction/, { selector: 'button' });
    click(confirmButton);

    // Wait for transactions again...
    await component.findByText('Transaction pending');
    await component.findByText('Transaction Sent');

    // UI updates to display totals correctly
    const [delegatedTotal, delegatedByYou] = await component.findAllByText(/3.20/);
    expect(delegatedTotal.parentElement).toHaveTextContent(/Total MKR delegated/);
    expect(delegatedByYou.parentElement).toHaveTextContent(/MKR delegated by you/);

    // Open undelegate modal
    const unDelegateButton = component.getByText('Undelegate');
    click(unDelegateButton);

    // IOU Approval Process
    const approveIOUButton = component.getByText('Approve Delegate Contract', { selector: 'button' });
    click(approveIOUButton);

    // More transaction screens...
    await component.findByText('Confirm transaction');
    await component.findByText('Transaction pending');
    await component.findByText('Withdraw from delegate contract');

    // Set max button adds input value correctly
    const setMaxButton = component.getByText(/Set max/, { selector: 'button' });
    click(setMaxButton);
    expect(component.getByDisplayValue(/3.2/)).toBeInTheDocument();
  });
});
