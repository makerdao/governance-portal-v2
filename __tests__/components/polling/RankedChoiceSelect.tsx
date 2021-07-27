import { act, screen } from '@testing-library/react';
import mockPolls from '../../../mocks/polls.json';
import { accountsApi } from '../../../stores/accounts';
import { connectAccount, createTestPolls, renderWithAccountSelect as render } from '../../helpers';
import getMaker from '../../../lib/maker';
import PollingOverviewPage from '../../../pages/polling';

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
    const view = render(<PollingOverviewPage polls={mockPolls as any} />);
    await act(async () => {
      await connectAccount();
    });
  });

  test('ranked choice options render properly', async () => {
    const select = await screen.findByTestId('ranked choice');
    const options = await screen.findAllByTestId('ranked choice option');

    expect(select).toBeInTheDocument();
    expect(options.length).toBe(7);
    expect(await screen.findByText('0')).toBeInTheDocument();
    expect(await screen.findByText('0.25')).toBeInTheDocument();
    expect(await screen.findByText('0.5')).toBeInTheDocument();
    expect(await screen.findByText('1')).toBeInTheDocument();
    expect(await screen.findByText('2')).toBeInTheDocument();
    expect(await screen.findByText('4')).toBeInTheDocument();
  });
});
