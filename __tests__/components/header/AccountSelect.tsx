import { renderWithWeb3ReactProvider as render } from '../../helpers'; 
import { fireEvent } from '@testing-library/react';
import { ethers } from 'ethers';
import WrappedAccountSelect from '../../../components/header/AccountSelect';
import { act } from 'react-dom/test-utils';

const { click } = fireEvent;

beforeAll(() => {
  (window as any).ethereum = new ethers.providers.JsonRpcProvider('http://localhost:8545');
})

test('can connect an account', async () => {
  // await act(async () => {
    const { debug, findByText } = render(<WrappedAccountSelect />);
    click(await findByText('Connect wallet'));
    click(await findByText('MetaMask'));
    // web3react errors here
    debug();
  // });
});