import { act, configure, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import getMaker from '../../lib/maker';
import CreateDelegate from '../../pages/account';
import { connectAccount, renderWithAccountSelect as render } from '../helpers';
import { SWRConfig } from 'swr';

jest.mock('@theme-ui/match-media', () => {
  return {
    useBreakpointIndex: jest.fn(() => 3)
  };
});

let maker;

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

describe('/account page', () => {
  beforeAll(async () => {
    jest.setTimeout(30000);
    configure({ asyncUtilTimeout: 4500 });
    maker = await getMaker();
  });

  beforeEach(async () => {
    await setup();
  });

  test('can create a delegate contract', async () => {
    const checkbox = screen.getByRole('checkbox');
    act(() => {
      userEvent.click(checkbox);
    });

    const createButton = screen.getByTestId('create-button');

    act(() => {
      userEvent.click(createButton);
    });

    // Transaction is initialized
    await screen.findByText('Confirm Transaction');

    // Transaction state moved to pending
    await screen.findByText('Transaction Pending');

    // Transaction state moved to mined
    await screen.findByText('Transaction Sent');

    const closeButton = screen.getByText('Close');

    act(() => {
      userEvent.click(closeButton);
    });

    // Fetch address of our newly create vote delegate contract
    const { voteDelegate } = await maker
      .service('voteDelegateFactory')
      .getVoteDelegate(maker.currentAccount().address);

    await screen.findByText(voteDelegate.getVoteDelegateAddress());
  });
});
