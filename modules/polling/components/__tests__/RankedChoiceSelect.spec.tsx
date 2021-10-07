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

describe('RankedChoiceSelect', () => {
  beforeAll(async () => {
    maker = await getMaker();
    await createTestPolls(maker);
  });

  beforeEach(async () => {
    accountsApi.setState({ currentAccount: undefined });
    render(<PollingOverviewPage categories={mockCategories as PollCategory[]} polls={mockPolls as Poll[]} />);
    await act(async () => {
      await connectAccount();
    });
  });

  test('ranked choice options render properly', async () => {
    const select = await screen.findByTestId('ranked choice');
    const options = await screen.findAllByTestId('ranked choice option');

    expect(select).toBeInTheDocument();
    expect(options.length).toBe(7);
    expect(await screen.findByText('0', { selector: 'li' })).toBeInTheDocument();
    expect(await screen.findByText('0.25', { selector: 'li' })).toBeInTheDocument();
    expect(await screen.findByText('0.5', { selector: 'li' })).toBeInTheDocument();
    expect(await screen.findByText('1', { selector: 'li' })).toBeInTheDocument();
    expect(await screen.findByText('2', { selector: 'li' })).toBeInTheDocument();
    expect(await screen.findByText('4', { selector: 'li' })).toBeInTheDocument();
  });
});
