import { DEMO_ACCOUNT_TESTS, injectProvider, renderWithTheme as render } from '../../helpers'; 
import { act, fireEvent } from '@testing-library/react';
import WrappedAccountSelect from '../../../components/header/AccountSelect';
import { accountsApi } from 'stores/accounts';

const { click } = fireEvent;

describe('Account select', () => {

  beforeAll(() => {
    injectProvider();
  });

  test('can connect an account', async () => {
    const { findByText, findAllByText, findByTestId } = render(<WrappedAccountSelect />);
    const connectButton = await findByText('Connect wallet');
    expect(connectButton).toBeDefined();
    
    await act(async () => {
      click(connectButton);
    });
    
    await act(async () => {
      await click(await findByText('MetaMask'));
    });

    accountsApi.setState({ currentAccount: {
      address: DEMO_ACCOUNT_TESTS,
      name: '',
      type: ''
    } });

    await act(async () => {
      await click(connectButton);
    });

    const copyButton = await findByTestId('copy-address');
    expect(copyButton).toBeDefined();
    const etherscanButton = await findByText('etherscan', { exact: false });
    expect(etherscanButton).toBeDefined();
    const displayedAddress = await findAllByText('0x16F', { exact: false });
    expect(displayedAddress.length).toBe(2);
  });

});