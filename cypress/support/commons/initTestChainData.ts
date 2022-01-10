import { SupportedNetworks } from 'lib/constants';
import getMaker from 'lib/maker';
import mockPolls from 'modules/polling/api/mocks/polls.json';

export async function initTestchainPolls() {
    const maker = await getMaker(SupportedNetworks.TESTNET);
    const pollingService = maker.service('govPolling');
    const hash = 'dummy hash';
  
    // This detects whether the mock polls have been deployed yet
    const testTx = await pollingService.createPoll(now(), now() + 500000, hash, hash);
    if (testTx !== 0) return;
  
    console.log('setting up some polls on the testchain...');
    return mockPolls.map(async poll => {
      const id = await pollingService.createPoll(now(), now() + 50000, hash, poll.url);
      console.log(`created poll #${id}`);
    });
  }
  
  function now() {
    return Math.floor(new Date().getTime());
  }