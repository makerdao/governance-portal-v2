import { act, fireEvent, configure } from '@testing-library/react';
import CreateDelegate from '../../../pages/delegates/me';
import { injectProvider, connectAccount, renderWithAccountSelect as render } from '../../helpers';
import mixpanel from 'mixpanel-browser';
import { SWRConfig } from 'swr';
import { accountsApi } from '../../../stores/accounts';

jest.mock('@theme-ui/match-media', () => {
  return {
    useBreakpointIndex: jest.fn(() => 3)
  };
});

// TODO: The address is deterministic when using the default account, but we should programmatically retrieve this
const DELEGATE_ADDRESS = '0xfcdD2B5501359B70A20e3D79Fd7C41c5155d7d07';

const { click } = fireEvent;
let component;

async function setup() {
  const comp = render(
    <SWRConfig value={{ dedupingInterval: 0, refreshInterval: 10 }}>
      <CreateDelegate />
    </SWRConfig>
  );

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
    injectProvider();
    mixpanel.track = () => {};
  });

  beforeEach(async () => {
    await act(async () => {
      component = await setup();
    });
  });

  test('can create a delegate contract', async () => {
    const createButton = component.getByTestId('create-button');

    act(() => {
      click(createButton);
    });

    // Transaction is initialized
    await component.findByText('Confirm transaction');

    // Transaction state moved to pending
    await component.findByText('Transaction pending');

    // Transaction state moved to mined
    await component.findByText('Transaction Sent');

    const closeButton = component.getByText('Close');

    act(() => {
      click(closeButton);
    });

    await component.findByText(DELEGATE_ADDRESS);
  });
});
