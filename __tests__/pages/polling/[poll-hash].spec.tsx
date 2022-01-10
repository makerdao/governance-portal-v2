import { act, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import getMaker from '../../../lib/maker';
import {
  connectAccount,
  createTestPolls,
  renderWithAccountSelect as render,
  DEMO_ACCOUNT_TESTS
} from '../../helpers';
import { formatAddress } from 'lib/utils';
import { accountsApi } from '../../../modules/app/stores/accounts';
import PollHashPage from '../../../pages/polling/[poll-hash]';
import mockPolls from 'modules/polling/api/mocks/polls.json';
// import mockTally from 'modules/polling/api/mocks/tally.json';
// import { usePollTally } from '../../../modules/polling/hooks/usePollTally';

// jest.mock('../../../modules/polling/hooks/usePollTally', () => ({
//   usePollTally: () => ({ tally: mockTally })
// }));

jest.mock('next/router', () => ({
  replace: () => null,
  useRouter() {
    return {
      route: '/',
      pathname: '',
      query: '',
      asPath: ''
    };
  }
}));

jest.mock('@theme-ui/match-media', () => {
  return {
    useBreakpointIndex: jest.fn(() => 3)
  };
});

let maker;

describe('/polling/[poll-hash] page', () => {
  beforeAll(async () => {
    maker = await getMaker();
    accountsApi.getState().addAccountsListener(maker);
    await createTestPolls(maker);
  });

  beforeEach(async () => {
    accountsApi.setState({ currentAccount: undefined });
    render(<PollHashPage poll={mockPolls[1] as Poll} />);
    await act(async () => {
      await connectAccount();
    });
  });

  test('renders page without connected account', async () => {
    act(() => {
      accountsApi.setState({ currentAccount: undefined });
    });
    const pollTitle = screen.getAllByText('MIP4c2-SP2: Inclusion Poll for MIP8 Amendments');
    expect(pollTitle[0]).toBeInTheDocument();
    const date = screen.getByText(/POSTED Jun 08 2020/i);
    expect(date).toBeInTheDocument();
    const yourVote = screen.queryByText('Your Vote');
    expect(yourVote).not.toBeInTheDocument();
  });

  test('renders vote section with connected account', async () => {
    const address = screen.getByText(formatAddress(DEMO_ACCOUNT_TESTS));
    expect(address).toBeInTheDocument();
    const pollTitle = screen.getAllByText('MIP4c2-SP2: Inclusion Poll for MIP8 Amendments');
    expect(pollTitle[0]).toBeInTheDocument();
    const date = screen.getByText(/POSTED Jun 08 2020/i);
    expect(date).toBeInTheDocument();
    const yourVote = screen.getAllByText('Your Vote');
    expect(yourVote[0]).toBeInTheDocument();
  });

  xtest('can click tabs', async () => {
    // poll detail tab by default
    const summary = screen.getByTestId('poll-detail');
    expect(summary).toBeInTheDocument();

    // vote breakdown tab
    const voteBreakdownButton = screen.getByText('Vote Breakdown');
    userEvent.click(voteBreakdownButton);
    expect(screen.getByTestId('vote-breakdown')).toBeInTheDocument();
    expect(screen.getByTestId('voting-stats')).toBeInTheDocument();
    expect(screen.getByTestId('voting-by-address')).toBeInTheDocument();
  });
});
