import { renderWithTheme as render } from '../../helpers'; 
import { fireEvent } from '@testing-library/react';
import { ethers } from 'ethers';
import WrappedAccountSelect from '../../../components/header/AccountSelect';

const { click } = fireEvent;

beforeAll(() => {
  (window as any).ethereum = new Proxy (new ethers.providers.JsonRpcProvider('http://localhost:2000'), {
    get(target, key) {
      if (key === 'enable') {
        return async () => ['0x16Fb96a5fa0427Af0C8F7cF1eB4870231c8154B6'];
      }
      if (key === '_state') {
        return {
          accounts: ['0x16Fb96a5fa0427Af0C8F7cF1eB4870231c8154B6']
        }
      }
      // uncomment the following to debug window.ethereum errors
      // if (!target[key]) console.log(key);
      return target[key];
    }
  });
});

test('can connect an account', async () => {
    const { findByText } = render(<WrappedAccountSelect />);
    click(await findByText('Connect wallet'));
    click(await findByText('MetaMask'));
    await findByText('0x16F', { exact: false });
});