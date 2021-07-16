import { act, fireEvent, configure } from '@testing-library/react';
import { TestAccountProvider } from '@makerdao/test-helpers';
// import { ExecutiveOverview } from '../../pages/executive';
import CreateDelegate from '../../../pages/delegates/me';
import proposals from '../../../mocks/proposals.json';
import getMaker from '../../../lib/maker';
import { injectProvider, connectAccount, renderWithAccountSelect as render } from '../../helpers';
import mixpanel from 'mixpanel-browser';
import { SWRConfig } from 'swr';
import { accountsApi } from '../../../stores/accounts';

jest.mock('@theme-ui/match-media', () => {
  return {
    useBreakpointIndex: jest.fn(() => 3)
  };
});

const { click } = fireEvent;
let component, maker;

async function setup() {
  console.log('running setup');
  const comp = render(
    <SWRConfig value={{ dedupingInterval: 0, refreshInterval: 10 }}>
      <CreateDelegate />
    </SWRConfig>
  );

  act(() => {
    // This adds the account to the provider (ethers)
    injectProvider();
  });

  await act(async () => {
    // This sets the account in state
    await connectAccount(comp);
  });
  return comp;
}

describe('Delegate Create page', () => {
  beforeAll(async () => {
    jest.setTimeout(30000);
    configure({ asyncUtilTimeout: 4500 });
    // injectProvider();
    mixpanel.track = () => {};
  });

  beforeEach(async () => {
    await act(async () => {
      component = await setup();
    });
  });

  afterEach(async () => {
    accountsApi.getState().disconnectAccount();
  });

  test('can create a delegate contract', async () => {
    const createButton = component.getByTestId('create-button');
    // const createButton = await component.getByText('Create a delegate contract', { selector: 'button' });
    console.log('Current Account:', accountsApi.getState().currentAccount);
    act(() => {
      click(createButton);
    });

    await component.findByText('Confirm transaction');
    // component.debug();
    await component.findByText('Your delegate contract');
    // const approveButton = component.getByTestId('deposit-approve-button');
    // act(() => {
    //   click(approveButton);
    // });
    // await component.findByText('Deposit into voting contract');
    // const input = component.getByTestId('mkr-input');
    // fireEvent.change(input, { target: { value: '10' } });
    // const finalDepositButton = await component.findByText('Deposit MKR');
    // expect(finalDepositButton.disabled).toBe(false);
    // act(() => {
    //   click(finalDepositButton);
    // });
    // const withdrawButton = await component.findByTestId('withdraw-button');
    // act(() => {
    //   click(withdrawButton);
    // });
    // await component.findByText('Approve voting contract');
    // const approveButtonWithdraw = component.getByTestId('withdraw-approve-button', {}, { timeout: 15000 });
    // act(() => {
    //   click(approveButtonWithdraw);
    // });
    // await component.findByText('Withdraw from voting contract');
    // const inputWithdraw = component.getByTestId('mkr-input');
    // fireEvent.change(inputWithdraw, { target: { value: '10' } });
    // const finalDepositButtonWithdraw = await component.findByText('Withdraw MKR');
    // expect(finalDepositButtonWithdraw.disabled).toBe(false);
    // act(() => {
    //   click(finalDepositButtonWithdraw);
    // });
    // const lockedMKR = await component.findByTestId('locked-mkr');
    // expect(lockedMKR).toHaveTextContent('0.00');
  });

  // test('can vote', async () => {
  //   const [voteButtonOne] = await component.findAllByTestId('vote-button-exec-overview-card');
  //   act(() => {
  //     click(voteButtonOne);
  //   });
  //   const submitButton = await component.findByText('Submit Vote', {}, { timeout: 15000 });
  //   act(() => {
  //     click(submitButton);
  //   });
  //   //TODO: get the UI to reflect the vote and test for that
  // });
});
