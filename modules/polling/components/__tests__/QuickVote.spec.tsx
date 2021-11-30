// @ts-nocheck
import { act, screen } from '@testing-library/react';
import mockPolls from 'modules/polling/api/mocks/polls.json';
import mockCategories from '../__mocks__/categories.json';

import {
  connectAccount,
  createTestPolls,
  renderWithAccountSelect as render
} from '../../../../__tests__/helpers';
import { Poll, PollCategory } from 'modules/polling/types';
import getMaker from 'lib/maker';
import { accountsApi } from 'stores/accounts';
import PollingOverviewPage from '../../../../pages/polling';
let maker;

jest.mock('@theme-ui/match-media', () => {
  return {
    useBreakpointIndex: jest.fn(() => 3)
  };
});

describe('QuickVote', () => {
  beforeAll(async () => {
    maker = await getMaker();
    accountsApi.getState().addAccountsListener(maker);
    await createTestPolls(maker);
    jest.setTimeout(30000);
  });

  beforeEach(async () => {
    accountsApi.setState({ currentAccount: undefined });
    render(<PollingOverviewPage categories={mockCategories as PollCategory[]} polls={mockPolls as Poll[]} />);

    await act(async () => {
      await connectAccount();
    });
  });

  test('renders QuickVote component', async () => {
    expect(await screen.findByText('Your Ballot')).toBeInTheDocument();
    expect((await screen.findAllByText('View Details')).length).toBe(2);
    expect((await screen.findAllByText('Add vote to ballot')).length).toBe(2);
    expect((await screen.findAllByTestId('countdown timer')).length).toBe(2);

    // Find a heading and checkbox with the text.
    const activePollsText = screen.getAllByText('Active Polls');
    expect(activePollsText.length).toBe(2);
    screen.getByText(/MIP14:/i);
  });
});
