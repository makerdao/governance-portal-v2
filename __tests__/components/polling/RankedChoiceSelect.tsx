import { fireEvent } from '@testing-library/react';
import mockPolls from '../../../mocks/polls.json';
import { accountsApi } from '../../../stores/accounts';
import { injectProvider, connectAccount, createTestPolls, renderWithAccountSelect as render } from '../../helpers'; 
import getMaker from '../../../lib/maker';
import PollingOverviewPage from '../../../pages/polling';

let maker;

jest.mock('@theme-ui/match-media', () => {
  return {
    useBreakpointIndex: jest.fn(() => 3)
  };
});

beforeAll(async () => {
  injectProvider();
  maker = await getMaker();
  await createTestPolls(maker);
});

let component;
beforeEach(async() => {
  accountsApi.setState({ currentAccount: undefined });
  component = render(<PollingOverviewPage polls={mockPolls as any} />);
  await connectAccount(fireEvent.click, component);
});

test('ranked choice options render properly', async () => {
  const select = await component.findByTestId('ranked choice');
  const options = await component.findAllByTestId('ranked choice option');

  expect(select).toBeDefined();
  expect(options.length).toBe(7);
  expect(await component.findByText('0')).toBeDefined();
  expect(await component.findByText('0.25')).toBeDefined();
  expect(await component.findByText('0.5')).toBeDefined();
  expect(await component.findByText('1')).toBeDefined();
  expect(await component.findByText('2')).toBeDefined();
  expect(await component.findByText('4')).toBeDefined();
});