/*

SPDX-FileCopyrightText: © 2023 Dai Foundation <www.daifoundation.org>

SPDX-License-Identifier: AGPL-3.0-or-later

*/

import { DEPLOYMENT_BLOCK } from 'modules/contracts/contracts.constants';
import { getSlateAddresses } from '../helpers/getSlateAddresses';
import { formatValue } from 'lib/string';
import { paddedBytes32ToAddress } from 'lib/utils';
import { SupportedNetworks } from 'modules/web3/constants/networks';
import { networkNameToChainId } from 'modules/web3/helpers/chain';
import { chiefAbi, chiefAddress } from 'modules/contracts/generated';
import { getPublicClient } from 'modules/web3/helpers/getPublicClient';

type AddressWithVotes = {
  votes: string[];
  slate: `0x${string}`;
  address: string;
  deposits: bigint;
};

export async function fetchExecutiveVoteTally(network: SupportedNetworks): Promise<any | null> {
  const chainId = networkNameToChainId(network);
  const publicClient = getPublicClient(chainId);

  const locks = await publicClient.getLogs({
    fromBlock: DEPLOYMENT_BLOCK[chiefAddress[chainId]],
    toBlock: 'latest',
    address: chiefAddress[chainId],
    event: chiefAbi[2],
    args: { sig: '0xdd46706400000000000000000000000000000000000000000000000000000000' }
  });
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
        publicClient
          .readContract({
            address: chiefAddress[chainId],
            abi: chiefAbi,
            functionName: 'deposits',
            args: [voter as `0x${string}`]
          })
          .then(deposits => ({
            address: voter,
            deposits
          }))
      )
    );

    const withSlates = await Promise.all(
      withDeposits.map(addressDeposit =>
        publicClient
          .readContract({
            address: chiefAddress[chainId],
            abi: chiefAbi,
            functionName: 'votes',
            args: [addressDeposit.address as `0x${string}`]
          })
          .then(slate => ({
            ...addressDeposit,
            slate
          }))
      )
    );

    const withVotes = await Promise.all(
      withSlates.map(withSlate =>
        getSlateAddresses(chainId, chiefAddress[chainId], chiefAbi, withSlate.slate).then(addresses => ({
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
