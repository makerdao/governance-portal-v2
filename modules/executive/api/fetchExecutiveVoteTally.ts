import { Chief } from '.dethcrypto/eth-sdk-client/esm/types';
import { DEPLOYMENT_BLOCK } from 'modules/contracts/contracts.constants';
import { getChiefDeposits } from 'modules/web3/api/getChiefDeposits';
import { uniq, nth, memoizeWith, identity } from 'ramda';
import { getSlateAddresses } from '../helpers/getSlateAddresses';
import { formatValue } from 'lib/string';
import { paddedBytes32ToAddress } from 'lib/utils';

export async function fetchExecutiveVoteTally(chief: Chief): Promise<any | null> {
  // helper for when we might call getSlateAddresses with the same slate several times
  const memoizedGetSlateAddresses = memoizeWith(identity, slate => getSlateAddresses(chief, slate));

  const filter = {
    fromBlock: DEPLOYMENT_BLOCK[chief.address],
    toBlock: 'latest',
    address: chief.address,
    // TODO: get the encoded function signature from ethers
    topics: ['0xdd46706400000000000000000000000000000000000000000000000000000000']
  };
  const locks = await chief.provider.getLogs(filter);
  const voters = uniq(locks.map(logObj => nth(1, logObj.topics)).map(paddedBytes32ToAddress));

  const withDeposits = await Promise.all(
    voters.map(voter =>
      getChiefDeposits(voter, chief).then(deposits => ({
        address: voter,
        deposits: parseFloat(formatValue(deposits, 'wad', 6, false))
      }))
    )
  );

  const withSlates = await Promise.all(
    withDeposits.map(addressDeposit =>
      chief.votes(addressDeposit.address).then(slate => ({
        ...addressDeposit,
        slate
      }))
    )
  );

  const withVotes = await Promise.all(
    withSlates.map(withSlate =>
      memoizedGetSlateAddresses(withSlate.slate).then(addresses => ({
        ...withSlate,
        votes: addresses
      }))
    )
  );

  const voteTally = {};

  for (const voteObj of withVotes) {
    for (let vote of voteObj.votes) {
      vote = vote.toLowerCase();
      if (voteTally[vote] === undefined) {
        voteTally[vote] = {
          approvals: voteObj.deposits,
          addresses: [{ address: voteObj.address, deposits: voteObj.deposits }]
        };
      } else {
        voteTally[vote].approvals += voteObj.deposits;
        voteTally[vote].addresses.push({
          address: voteObj.address,
          deposits: voteObj.deposits
        });
      }
    }
  }

  for (const [key, value] of Object.entries(voteTally)) {
    const sortedAddresses = (value as any).addresses.sort((a, b) => b.deposits - a.deposits);
    const approvals = voteTally[key].approvals;
    const withPercentages = sortedAddresses.map(shapedVoteObj => ({
      ...shapedVoteObj,
      percent: ((shapedVoteObj.deposits * 100) / approvals).toFixed(2)
    }));
    voteTally[key] = withPercentages;
  }

  return voteTally;
}
