import { ExecutiveOverview } from '../../pages/executive';
import proposals from '../../mocks/proposals.json';
import { injectProvider, connectAccount, renderWithAccountSelect as render } from '../helpers'; 
import { act, fireEvent } from '@testing-library/react';
import mixpanel from 'mixpanel-browser';
import { SWRConfig } from 'swr';
import { accountsApi } from '../../stores/accounts';
import { configure } from '@testing-library/react';

jest.mock('@theme-ui/match-media', () => {
  return {
    useBreakpointIndex: jest.fn(() => 3)
  };
});


const { click } = fireEvent;
let component;

async function setup() {
  const comp = render(
  <SWRConfig value={{ dedupingInterval: 0, refreshInterval: 10 }}>
    <ExecutiveOverview proposals={proposals} />
  </SWRConfig>
  );
  await act(async () => {
    await connectAccount(click, comp);
  });
  return comp;
}


describe('Executive page', () => {
  
  beforeAll(async () => {
    configure({ asyncUtilTimeout: 4500 });
    injectProvider();
    mixpanel.track = () => {};
  });

  beforeEach(async () => {
    await act(async () => {
      component = await setup();
    })
  });

  afterEach(async () => {
    accountsApi.getState().disconnectAccount();
  });

  test('can deposit and withdraw', async () => {

    const depositButton = await component.findByTestId('deposit-button');
    
    await act(() => {
      click(depositButton);
    });

    await component.findByText('Approve voting contract');
    const approveButton = component.getByTestId('deposit-approve-button');
   
    await act(() => {
      click(approveButton);
    });

    await component.findByText('Deposit into voting contract');
    const input = component.getByTestId('mkr-input');
    fireEvent.change(input, { target: { value: '10' } });
    const finalDepositButton = await component.findByText('Deposit MKR');
    expect(finalDepositButton.disabled).toBe(false);
    
    await act(() => {
      click(finalDepositButton);
    });

    const withdrawButton = await component.findByTestId('withdraw-button');
    
    await act(() => {
      click(withdrawButton);
    });

    await component.findByText('Approve voting contract');
    const approveButtonWithdraw = component.getByTestId('withdraw-approve-button');

    await act(() => {
      click(approveButtonWithdraw);
    });

    await component.findByText('Withdraw from voting contract');
    const inputWithdraw = component.getByTestId('mkr-input');
    fireEvent.change(inputWithdraw, { target: { value: '10' } });
    
    const finalDepositButtonWithdraw = await component.findByText('Withdraw MKR');
    
    expect(finalDepositButtonWithdraw.disabled).toBe(false);
    
    await act(() => {
      click(finalDepositButtonWithdraw);
    });

    const lockedMKR = await component.findByTestId('locked-mkr');

    expect(lockedMKR).toHaveTextContent('0.00');


  });

  test('can vote', async () => {
    const [voteButtonOne, ] = await component.findAllByTestId('vote-button-exec-overview-card');
    click(voteButtonOne);
    const submitButton = await component.findByText('Submit Vote');
    click(submitButton);
    //TODO: get the UI to reflect the vote and test for that
  });
})