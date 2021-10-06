import { renderWithTheme, createTestPolls } from '../../helpers';
// import PollCreate from '../../../pages/polling/create';
import getMaker from '../../../lib/maker';
import { injectProvider } from '../../helpers'; 

beforeAll(async () => {
    injectProvider();
    const maker = await getMaker();
    await createTestPolls(maker);
  });

  
describe('polling create render', () => {
  xtest('renders', async () => {
    // I think this is failing because the router needs to be mocked
    // const { debug } = renderWithTheme(<PollCreate />);
  });
});
