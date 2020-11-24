import { renderWithWeb3ReactProvider as render } from '../../helpers'; 
import { fireEvent } from '@testing-library/react';
import { ethers } from 'ethers';
import WrappedAccountSelect from '../../../components/header/AccountSelect';
import { act } from 'react-dom/test-utils';

const { click } = fireEvent;

beforeAll(() => {
  (window as any).ethereum = {
    ...new ethers.providers.JsonRpcProvider('http://localhost:8545'),
    send: async () => { return ['0x16Fb96a5fa0427Af0C8F7cF1eB4870231c8154B6'] }
  }
});

test('can connect an account', async () => {
  // await act(async () => {
    const { debug, findByText } = render(<WrappedAccountSelect />);
    click(await findByText('Connect wallet'));
    click(await findByText('MetaMask'))
    // debug();
  // });
});