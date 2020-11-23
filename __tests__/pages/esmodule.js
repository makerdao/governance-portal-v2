import React from 'react';
import { renderWithTheme } from '../helpers';
import { act, cleanup, fireEvent, render, wait, waitForElement, screen, waitFor } from '@testing-library/react';

import { ESM } from '@makerdao/dai-plugin-governance/dist/utils/constants';

import { MKR } from '@makerdao/dai';
import { TestAccountProvider } from '@makerdao/test-helpers';
import userEvent from '@testing-library/user-event'
import { cache, SWRConfig } from "swr";
import waitForExpect from 'wait-for-expect';
import ESModule from '../../pages/esmodule';
import getMaker from '../../lib/maker';
import { accountsApi } from '../../stores/accounts';

// const { click } = fireEvent;
// // import configureMockStore from 'redux-mock-store';
// // import thunk from 'redux-thunk';
// const middlewares = [thunk];
// const mockStore = configureMockStore(middlewares);

const SWRESModule = () => (
    <SWRConfig value={{ dedupingInterval: 0}}>
        <ESModule />
    </SWRConfig>
)
let maker;


beforeAll(async () => {
  maker = await getMaker();
  expect(accountsApi.getState().currentAccount).toBeUndefined();

  const nextAccount = TestAccountProvider.nextAccount();
  await maker.service('accounts').addAccount('test-account', {
    type: 'privateKey',
    key: nextAccount.key
  });
  maker.useAccount('test-account');
  await waitForExpect(() => {
    const currentAccount = accountsApi.getState().currentAccount;
    expect(currentAccount.address).toBe(nextAccount.address);
    expect(currentAccount.name).toBe('test-account');
  });
});

afterEach(() => {
    cache.clear();
    cleanup()
});

function setup(props) {
  // mock functions
  const utils = render(<SWRESModule {...props} />);
  // grab items
  // const input = utils.getByLabelText()
  return {
    ...utils
  };
}

describe('emergency shutdown render', () => {

  test('renders', async () => {
    const { debug } = renderWithTheme(<ESModule />);
  });

  // tests render on mobile view automatically
  test('show progress bar', () => {
    const { getByTestId } = setup();
    getByTestId('progress-ring')
  });

  test('show esm history', async () => {
    jest.setTimeout(10000)
    const { getByText, container, debug, findByText } = render(<ESModule />);
    
    await findByText('ESM History');
    await findByText('Dec 5, 2019, 11:04 UTC', {}, {timeout: 5000})

  });

  test('show "Burn your MKR" button', async () => {
    jest.setTimeout(10000)
    const { getByText, findByText } = render(<ESModule />);

    await findByText('Burn Your MKR', {}, {timeout: 5000})
  });

  test.only('Burn MKR Modal Flow', async () => {
    jest.setTimeout(10000)
    const { getByTestId, getAllByTestId, getByText, getByRole, findByText, debug } = renderWithTheme(
      <ESModule />
    );

    // Intro Render
    // await wait(() =>
    //   getByText('The Emergency Shutdown Module (ESM) is responsible for', {
    //     exact: false
    //   })
    // );
    // click(getByText('Continue'));

    // First Step Render
    const burnButton = await findByText('Burn Your MKR', {}, {timeout: 5000})
    // debug()
    fireEvent.click(getByText('Burn Your MKR'));
    await findByText('Are you sure you want to burn MKR?');
    fireEvent.click(getByText('Continue'));

    // Second Step Render
    await findByText('Burn your MKR in the ESM')

    // Not Enough MKR Check
    const amount = 3;
    fireEvent.change(getByRole('spinbutton'), { target: { value: amount } });
    await findByText('MKR balance too low')
    // await wait(() => getByText("You don't have enough MKR"));
    const continueButton = getByText('Continue');
    expect(continueButton.disabled).toBeTruthy();

    // Set Max Check
    fireEvent.click(getByText('Set max'));
    // debug()
    waitFor(() => expect(getByRole('spinbutton').value).toEqual('2.0000'));

    // MKR is Chief Check
    // getByTestId('voting-power');

    // Valid Amount Check
    fireEvent.change(getByRole('spinbutton'), { target: { value: amount - 2 } });
    waitFor(() => expect(continueButton.disabled).toBeFalsy());
    fireEvent.click(continueButton);

    // Third Step Render
    waitFor(() => getByText('Burn amount'));
    // waitFor(() => getByText('New ESM total'))
    await findByText('New ESM total');
    // let confirmInput;
    // await act(() => {
    //   confirmInput = getAllByTestId('confirm-input')[2];
    // });
    // let burnMKRbutton;
    // await act(() => {
    //   burnMKRbutton = getByText('Continue');
    // });
    // expect(burnMKRbutton.disabled).toBeTruthy();

    // // click the terms of service
    // const tos = getByTestId('tosCheck');
    // click(tos);
    // expect(tos.checked).toBeTruthy();

  //   // click the unlock mkr
  //   const allowanceBtn = getByTestId('allowance-toggle').children[0];
  //   await waitForElement(() => !allowanceBtn.disabled);
  //   click(allowanceBtn);
  //   await waitForElement(() => allowanceBtn.disabled);

  //   // Incorrect Input Check
  //   fireEvent.change(confirmInput, { target: { value: 'I am burning 2 MKR' } });
  //   expect(burnMKRbutton.disabled).toBeTruthy();

  //   // Correct Input Check
  //   fireEvent.change(confirmInput, { target: { value: 'I am burning 1 MKR' } });
  //   const step2 = await waitForElement(() => getByTestId('step2'));

  //   await waitForElement(() => !burnMKRbutton.disabled);
  //   click(burnMKRbutton);

  //   // Third Step Render
  //   await wait(() => getByText('Your MKR is being burned'));

  //   // Fourth Step Success Render
  //   await wait(() => getByText('MKR Burned'));
  });

});

// test('show Initiate Shutdown button on threshold reached', async () => {
//   let newESM = Object.assign({}, { ...esm, canFire: true, totalStaked: MKR(50000), thresholdAmount: 50000 });
//   let subStore = mockStore({ accounts, esm: newESM });
//   const { getByText } = await render(<Modules store={subStore} />);
//   await wait(() => getByText('Initiate Emergency Shutdown'));
// });

// test('show disabled Initiate Shutdown button on shutdown initiated', async () => {
//   let newESM = Object.assign(
//     {},
//     {
//       ...esm,
//       canFire: false,
//       totalStaked: MKR(50000),
//       thresholdAmount: 50000,
//       // hack to allow for bigNumber
//       cageTime: MKR(1580326770128)
//     }
//   );
//   let subStore = mockStore({ accounts, esm: newESM });
//   const { getByText, getByTestId, debug } = await render(<Modules store={subStore} />);
//   const initiateButton = getByText('Initiate Emergency Shutdown');
//   expect(initiateButton.disabled).toBeTruthy();
//   await wait(() => getByTestId('shutdown-initiated'));
// });

