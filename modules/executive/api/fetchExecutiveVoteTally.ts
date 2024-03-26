/*

SPDX-FileCopyrightText: © 2023 Dai Foundation <www.daifoundation.org>

SPDX-License-Identifier: AGPL-3.0-or-later

*/

import { Chief } from '.dethcrypto/eth-sdk-client/esm/types';
import { DEPLOYMENT_BLOCK } from 'modules/contracts/contracts.constants';
import { getChiefDeposits } from 'modules/web3/api/getChiefDeposits';
import { getSlateAddresses } from '../helpers/getSlateAddresses';
import { formatValue } from 'lib/string';
import { paddedBytes32ToAddress } from 'lib/utils';
import { BigNumber } from 'ethers';

type AddressWithVotes = {
  votes: string[];
  slate: string;
  address: string;
  deposits: BigNumber;
};

export async function fetchExecutiveVoteTally(chief: Chief): Promise<any | null> {
  const filter = {
    fromBlock: DEPLOYMENT_BLOCK[chief.address],
    toBlock: 'latest',
    address: chief.address,
    // TODO: get the encoded function signature from ethers
    topics: ['0xdd46706400000000000000000000000000000000000000000000000000000000']
  };
  const locks = await chief.provider.getLogs(filter);
  const voters: string[] = [];

  // get unique voters
  locks.forEach(lock => {
    const voter = paddedBytes32ToAddress(lock.topics[1]);
    if (!voters.includes(voter)) {
      voters.push(voter);
    }
  });

  // We need to split the voters array into chunks because our
  // Alchemy key doesn't support batch requests larger than 1000 queries each
  const chunkSize = 900;
  const voterChunks = Array.from({ length: Math.ceil(voters.length / chunkSize) }, (_, i) =>
    voters.slice(i * chunkSize, i * chunkSize + chunkSize)
  );

  const addressesWithVotes: AddressWithVotes[] = [];

  for (const chunk of voterChunks) {
    const withDeposits = await Promise.all(
      chunk.map(voter =>
        getChiefDeposits(voter, chief).then(deposits => ({
          address: voter,
          deposits
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
        getSlateAddresses(chief, withSlate.slate).then(addresses => ({
          ...withSlate,
          votes: addresses
        }))
      )
    );

    addressesWithVotes.push(...withVotes);
  }

  const voteTally = {};

  for (const voteObj of addressesWithVotes) {
    for (let vote of voteObj.votes) {
      vote = vote.toLowerCase();
      if (voteTally[vote] === undefined) {
        voteTally[vote] = {
          approvals: voteObj.deposits,
          addresses: [{ address: voteObj.address, deposits: voteObj.deposits }]
        };
      } else {
        voteTally[vote].approvals = voteTally[vote].approvals.add(voteObj.deposits);
        voteTally[vote].addresses.push({
          address: voteObj.address,
          deposits: voteObj.deposits
        });
      }
    }
  }

  for (const [key, value] of Object.entries(voteTally)) {
    const sortedAddresses = (value as any).addresses.sort(
      (a, b) =>
        parseFloat(formatValue(b.deposits, 'wad', 6, false)) -
        parseFloat(formatValue(a.deposits, 'wad', 6, false))
    );
    const approvals = voteTally[key].approvals;
    const withPercentages = sortedAddresses.map(shapedVoteObj => ({
      ...shapedVoteObj,
      deposits: formatValue(shapedVoteObj.deposits, 'wad', 6, false),
      percent: ((shapedVoteObj.deposits * 100) / approvals).toFixed(2)
    }));
    voteTally[key] = withPercentages;
  }

  return voteTally;
}
