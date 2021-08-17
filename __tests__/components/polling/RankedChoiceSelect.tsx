import { act, screen } from '@testing-library/react';
import mockPolls from '../../../mocks/polls.json';
import mockCategories from '../../../mocks/categories.json';
import { accountsApi } from '../../../stores/accounts';
import { connectAccount, createTestPolls, renderWithAccountSelect as render } from '../../helpers';
import getMaker from '../../../lib/maker';
import PollingOverviewPage from '../../../pages/polling';
import { Poll } from '../../../types/poll';
import { PollCategory } from '../../../types/pollCategory';

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
