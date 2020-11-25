import { injectProvider, renderWithTheme as render } from '../../helpers'; 
import { fireEvent } from '@testing-library/react';
import WrappedAccountSelect from '../../../components/header/AccountSelect';

const { click } = fireEvent;

beforeAll(() => {
  injectProvider();
});

test('can connect an account', async () => {
    const { findByText } = render(<WrappedAccountSelect />);
    click(await findByText('Connect wallet'));
    click(await findByText('MetaMask'));
    await findByText('0x16F', { exact: false });
});