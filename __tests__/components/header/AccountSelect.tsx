import { injectProvider, renderWithTheme as render } from '../../helpers'; 
import { fireEvent } from '@testing-library/react';
import WrappedAccountSelect from '../../../components/header/AccountSelect';

const { click } = fireEvent;

beforeAll(() => {
  injectProvider();
});

test('can connect an account', async () => {
    const { findByText, findAllByText } = render(<WrappedAccountSelect />);
    const connectButton = await findByText('Connect wallet');
    expect(connectButton).toBeDefined();
    
    click(connectButton);
    click(await findByText('MetaMask'));

    const copyButton = await findByText('Copy Address');
    expect(copyButton).toBeDefined();
    const etherscanButton = await findByText('etherscan', { exact: false });
    expect(etherscanButton).toBeDefined();
    const displayedAddress = await findAllByText('0x16F', { exact: false });
    expect(displayedAddress.length).toBe(2);
  });