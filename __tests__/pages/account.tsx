import { act, fireEvent, configure, screen } from '@testing-library/react';
import CreateDelegate from '../../pages/account';
import { connectAccount, renderWithAccountSelect as render } from '../helpers';
import { SWRConfig } from 'swr';

jest.mock('@theme-ui/match-media', () => {
  return {
    useBreakpointIndex: jest.fn(() => 3)
  };
});

// TODO: The address is deterministic when using the default account, but we should programmatically retrieve this
const DELEGATE_ADDRESS = '0xfcdD2B5501359B70A20e3D79Fd7C41c5155d7d07';

const { click } = fireEvent;

async function setup() {
  const view = render(
    <SWRConfig value={{ dedupingInterval: 0, refreshInterval: 10 }}>
      <CreateDelegate />
    </SWRConfig>
  );

  await act(async () => {
    // This sets the account in state
    await connectAccount();
  });
  return view;
}

describe('Delegate Create page', () => {
  beforeAll(async () => {
    jest.setTimeout(30000);
    configure({ asyncUtilTimeout: 4500 });
  });

  beforeEach(async () => {
    await setup();
  });

  test('can create a delegate contract', async () => {
    const checkbox = screen.getByRole('checkbox');
    act(() => {
      click(checkbox);
    });

    const createButton = screen.getByTestId('create-button');

    act(() => {
      click(createButton);
    });

    // Transaction is initialized
    await screen.findByText('Confirm transaction');

    // Transaction state moved to pending
    await screen.findByText('Transaction pending');

    // Transaction state moved to mined
    await screen.findByText('Transaction Sent');

    const closeButton = screen.getByText('Close');

    act(() => {
      click(closeButton);
    });

    await screen.findByText(DELEGATE_ADDRESS);
  });
});
