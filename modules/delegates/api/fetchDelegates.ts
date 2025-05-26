/*

SPDX-FileCopyrightText: © 2023 Dai Foundation <www.daifoundation.org>

SPDX-License-Identifier: AGPL-3.0-or-later

*/

import { fetchChainDelegates } from './fetchChainDelegates';
import {
  DelegateOrderByEnum,
  DelegateStatusEnum,
  DelegateTypeEnum
} from 'modules/delegates/delegates.constants';
import { fetchGithubDelegate, fetchGithubDelegates } from './fetchGithubDelegates';
import { fetchDelegationEventsByAddresses } from './fetchDelegationEventsByAddresses';
import { DEFAULT_NETWORK, SupportedNetworks } from 'modules/web3/constants/networks';
import {
  Delegate,
  DelegateContractInformation,
  DelegateRepoInformation,
  DelegatesValidatedQueryParams,
  DelegatesPaginatedAPIResponse,
  DelegatePaginated,
  AllDelegatesEntryWithName,
  DelegateInfo,
  DelegateListItem
} from 'modules/delegates/types';
import { getGithubExecutives } from 'modules/executive/api/fetchExecutives';
import { networkNameToChainId, getGaslessNetwork } from 'modules/web3/helpers/chain';
import { gqlRequest } from 'modules/gql/gqlRequest';
import {
  delegatesQuerySubsequentPages,
  delegatesQueryFirstPage
} from 'modules/gql/queries/subgraph/delegates';
import { lastVotedArbitrum } from 'modules/gql/queries/subgraph/lastVotedArbitrum';
import { fetchDelegatesExecSupport } from './fetchDelegatesExecSupport';
import { fetchDelegateAddresses } from './fetchDelegateAddresses';
import getDelegatesCounts from '../helpers/getDelegatesCounts';
import { filterDelegates } from '../helpers/filterDelegates';
import { fetchDelegationMetrics } from './fetchDelegationMetrics';
import { formatEther } from 'viem';

function mergeDelegateInfo({
  onChainDelegate,
  githubDelegate
}: {
  onChainDelegate: DelegateContractInformation;
  githubDelegate?: DelegateRepoInformation;
}): Delegate {
  return {
    voteDelegateAddress: onChainDelegate.voteDelegateAddress,
    address: onChainDelegate.address,
    status: githubDelegate ? DelegateStatusEnum.aligned : DelegateStatusEnum.shadow,
    description: githubDelegate?.description || '',
    name: githubDelegate?.name || 'Shadow Delegate',
    picture: githubDelegate?.picture || '',
    id: onChainDelegate.voteDelegateAddress,
    externalUrl: githubDelegate?.externalUrl,
    lastVoteDate: onChainDelegate.lastVoteDate,
    communication: githubDelegate?.communication,
    combinedParticipation: githubDelegate?.combinedParticipation,
    pollParticipation: githubDelegate?.pollParticipation,
    executiveParticipation: githubDelegate?.executiveParticipation,
    skyDelegated: onChainDelegate.skyDelegated,
    proposalsSupported: onChainDelegate.proposalsSupported,
    execSupported: undefined,
    skyLockedDelegate: onChainDelegate.skyLockedDelegate,
    blockTimestamp: onChainDelegate.blockTimestamp
  };
}

// Returns info for one delegate mixing onchain and repo info (requires the delegate contract address as parameter)
export async function fetchDelegate(
  voteDelegateAddress: string,
  network?: SupportedNetworks
): Promise<Delegate | undefined> {
  const currentNetwork = network ? network : DEFAULT_NETWORK.network;
  const onChainDelegates = await fetchChainDelegates(currentNetwork);

  const onChainDelegate = onChainDelegates.find(
    i => i.voteDelegateAddress.toLowerCase() === voteDelegateAddress.toLowerCase()
  );

  if (!onChainDelegate) {
    return Promise.resolve(undefined);
  }

  const delegationEvents = await fetchDelegationEventsByAddresses(
    [onChainDelegate.voteDelegateAddress],
    network || SupportedNetworks.MAINNET
  );

  onChainDelegate.skyLockedDelegate = delegationEvents;

  // fetch github info for delegate
  const { data: githubDelegate } = await fetchGithubDelegate(
    onChainDelegate.voteDelegateAddress,
    currentNetwork
  );

  return mergeDelegateInfo({ onChainDelegate, githubDelegate });
}

export async function fetchAndMergeDelegates(
  network: SupportedNetworks
): Promise<[DelegateListItem[] | undefined, AllDelegatesEntryWithName[]]> {
  const [{ data: githubDelegates }, allDelegateAddresses] = await Promise.all([
    fetchGithubDelegates(network),
    fetchDelegateAddresses(network)
  ]);

  const allDelegatesWithNamesAndLinks = allDelegateAddresses.map(delegate => {
    const ghDelegate = githubDelegates?.find(
      del => delegate.voteDelegate.toLowerCase() === del.voteDelegateAddress.toLowerCase()
    );

    return {
      ...delegate,
      delegateType: ghDelegate ? DelegateTypeEnum.ALIGNED : DelegateTypeEnum.SHADOW,
      blockTimestamp: delegate.blockTimestamp,
      name: ghDelegate?.name,
      picture: ghDelegate?.picture
    };
  });

  return [githubDelegates, allDelegatesWithNamesAndLinks];
}

export async function fetchSingleDelegateInfo(
  address: string,
  network: SupportedNetworks
): Promise<DelegateInfo | null> {
  const [githubDelegates, allDelegatesWithNamesAndLinks] = await fetchAndMergeDelegates(network);

  const foundDelegate = allDelegatesWithNamesAndLinks.find(
    delegate => delegate.voteDelegate.toLowerCase() === address.toLowerCase()
  );

  if (!foundDelegate) {
    return null;
  }

  const foundGithubDelegate = githubDelegates?.find(delegate => delegate.name === foundDelegate?.name);

  return {
    name: foundDelegate.name || 'Shadow Delegate',
    picture: foundGithubDelegate?.picture,
    address: foundDelegate.delegate,
    voteDelegateAddress: foundDelegate.voteDelegate,
    status: foundGithubDelegate ? DelegateStatusEnum.aligned : DelegateStatusEnum.shadow,
    pollParticipation: foundGithubDelegate?.pollParticipation,
    executiveParticipation: foundGithubDelegate?.executiveParticipation,
    combinedParticipation: foundGithubDelegate?.combinedParticipation,
    communication: foundGithubDelegate?.communication,
    blockTimestamp: foundDelegate.blockTimestamp
  };
}

export async function fetchDelegatesInfo(
  network: SupportedNetworks,
  alignedOnly: boolean
): Promise<DelegateInfo[]> {
  const [githubDelegates, allDelegatesWithNamesAndLinks] = await fetchAndMergeDelegates(network);

  const delegatesInfo = allDelegatesWithNamesAndLinks
    .filter(delegate => (alignedOnly ? delegate.delegateType === DelegateTypeEnum.ALIGNED : true))
    .filter((delegate, i, arr) => (alignedOnly ? arr.findIndex(d => d.name === delegate.name) === i : true))
    .sort((a, b) => new Date(a.blockTimestamp).getTime() - new Date(b.blockTimestamp).getTime())
    .map(delegate => {
      const githubDelegate = githubDelegates?.find(d => d.name === delegate.name);
      return {
        name: delegate.name || 'Shadow Delegate',
        picture: githubDelegate?.picture,
        address: delegate.delegate,
        voteDelegateAddress: delegate.voteDelegate,
        status: delegate.name ? DelegateStatusEnum.aligned : DelegateStatusEnum.shadow,
        pollParticipation: githubDelegate?.pollParticipation,
        executiveParticipation: githubDelegate?.executiveParticipation,
        combinedParticipation: githubDelegate?.combinedParticipation,
        communication: githubDelegate?.communication,
        blockTimestamp: delegate.blockTimestamp
      };
    });

  return delegatesInfo;
}

export async function fetchDelegatesPaginated({
  network,
  pageSize,
  page,
  orderBy,
  orderDirection,
  seed,
  delegateType,
  searchTerm
}: DelegatesValidatedQueryParams): Promise<DelegatesPaginatedAPIResponse> {
  const chainId = networkNameToChainId(network);

  const [githubDelegates, allDelegatesWithNamesAndLinks] = await fetchAndMergeDelegates(network);

  const { alignedDelegatesAddresses, filteredDelegateAddresses, filteredDelegateEntries } = filterDelegates(
    allDelegatesWithNamesAndLinks,
    searchTerm,
    delegateType
  );

  const { alignedDelegatesCount, shadowDelegatesCount, totalDelegatesCount } =
    getDelegatesCounts(filteredDelegateEntries);

  // If there are no aligned delegates, the id_not_in filter will filter out everything if we give it an empty array
  const alignedDelegatesAddressesForNotInQuery =
    alignedDelegatesAddresses.length > 0
      ? alignedDelegatesAddresses
      : ['0x0000000000000000000000000000000000000000'];

  const baseDelegatesQueryFilter: any = { and: [{ version: '3' }] };
  if (searchTerm) {
    baseDelegatesQueryFilter.and.push({ id_in: filteredDelegateAddresses });
    if (delegateType === DelegateTypeEnum.ALIGNED) {
      baseDelegatesQueryFilter.and.push({ id_in: alignedDelegatesAddresses });
      baseDelegatesQueryFilter.and.push({ id_not_in: alignedDelegatesAddressesForNotInQuery });
    }
  } else if (delegateType === DelegateTypeEnum.ALIGNED) {
    baseDelegatesQueryFilter.and.push({ id_in: alignedDelegatesAddresses });
  } else if (delegateType === DelegateTypeEnum.SHADOW) {
    baseDelegatesQueryFilter.and.push({ id_not_in: alignedDelegatesAddressesForNotInQuery });
  }

  //get all aligned delegates (that match the filter)for the first page
  const alignedFilterFirstPage = {
    and: [...(baseDelegatesQueryFilter.and || []), { id_in: alignedDelegatesAddresses }]
  };
  //use this for subsequent pages as well as part of the first page
  const shadowFilterFirstPage = {
    and: [...(baseDelegatesQueryFilter.and || []), { id_not_in: alignedDelegatesAddressesForNotInQuery }]
  };

  const queryOrderBy = orderBy === DelegateOrderByEnum.RANDOM ? DelegateOrderByEnum.SKY : orderBy;

  const delegatesQueryFirstPageVariables = {
    first: pageSize,
    orderBy: queryOrderBy,
    orderDirection,
    alignedFilter: alignedFilterFirstPage,
    shadowFilter: shadowFilterFirstPage,
    alignedDelegates: alignedDelegatesAddresses
  };

  const delegatesQuerySubsequentPagesVariables = {
    first: pageSize,
    skip: (page - 1) * pageSize,
    orderBy: queryOrderBy,
    orderDirection,
    filter: shadowFilterFirstPage
  };

  const [githubExecutives, delegatesExecSupport, delegatesQueryRes, delegationMetrics] = await Promise.all([
    getGithubExecutives(network),
    fetchDelegatesExecSupport(network),
    gqlRequest<any>({
      chainId,
      query: page === 1 ? delegatesQueryFirstPage : delegatesQuerySubsequentPages,
      variables: page === 1 ? delegatesQueryFirstPageVariables : delegatesQuerySubsequentPagesVariables
    }),
    fetchDelegationMetrics(network)
  ]);

  let combinedDelegates = [
    // Include aligned delegates if the filter doesn't specify to only show shadow delegates
    ...((delegateType !== DelegateTypeEnum.SHADOW && delegatesQueryRes.alignedDelegates) || []),
    // Include shadow delegates if the filter doesn't specify to only show aligned delegates
    ...((delegateType !== DelegateTypeEnum.ALIGNED && delegatesQueryRes.delegates) || [])
  ];

  const combinedDelegateOwnerAddresses = combinedDelegates.map(delegate =>
    delegate.ownerAddress.toLowerCase()
  );

  const lastVotedArbitrumArray = await gqlRequest<any>({
    chainId: networkNameToChainId(getGaslessNetwork(network)),
    query: lastVotedArbitrum,
    variables: { argAddresses: combinedDelegateOwnerAddresses }
  });

  const lastVotedArbitrumObj = lastVotedArbitrumArray.arbitrumVoters.reduce((acc, voter) => {
    acc[voter.id] = voter.pollVotes && voter.pollVotes.length > 0 ? Number(voter.pollVotes[0].blockTime) : 0;
    return acc;
  }, {});

  // Apply random sorting on the frontend if orderBy is RANDOM
  if (orderBy === DelegateOrderByEnum.RANDOM) {
    combinedDelegates = combinedDelegates.sort(() => Math.random() - 0.5);
  }

  const delegatesData = {
    paginationInfo: {
      totalCount: delegatesQueryRes.delegates.totalCount,
      page,
      numPages: Math.ceil(delegatesQueryRes.delegates.totalCount / pageSize),
      hasNextPage: true
    },
    stats: {
      total: totalDelegatesCount,
      shadow: shadowDelegatesCount,
      aligned: alignedDelegatesCount,
      totalSkyDelegated: delegationMetrics.totalSkyDelegated,
      totalDelegators: delegationMetrics.delegatorCount
    },
    delegates: combinedDelegates.map(delegate => {
      const allDelegatesEntry = allDelegatesWithNamesAndLinks.find(del => del.voteDelegate === delegate.id);

      const githubDelegate = githubDelegates?.find(ghDelegate => ghDelegate.name === allDelegatesEntry?.name);

      const votedProposals = delegatesExecSupport.data?.find(
        del => del.voteDelegate === delegate.id
      )?.votedProposals;
      const execSupported = githubExecutives.find(proposal =>
        votedProposals?.find(vp => vp.toLowerCase() === proposal?.address?.toLowerCase())
      );

      // Ensure blockTimestamp is a valid number
      const blockTimestampNum = delegate.blockTimestamp ? Number(delegate.blockTimestamp) : 0;
      let creationDate;
      try {
        creationDate = new Date(blockTimestampNum * 1000);
        // Validate the date is valid
        creationDate.toISOString();
      } catch (e) {
        // If date is invalid, use current date as fallback
        creationDate = new Date();
      }

      // Handle creationDate from delegate object
      let finalCreationDate;
      try {
        finalCreationDate = delegate.creationDate ? new Date(delegate.creationDate) : creationDate;
        // Validate the date is valid
        finalCreationDate.toISOString();
      } catch (e) {
        // If date is invalid, use the previously calculated creationDate as fallback
        finalCreationDate = creationDate;
      }

      const lastVoteMainnet = delegate.voter.lastVotedTimestamp || 0;

      const lastVoteArbitrum = lastVotedArbitrumObj[delegate.ownerAddress.toLowerCase()] || 0;

      const lastVoteTimestamp = Math.max(lastVoteMainnet, lastVoteArbitrum);

      const totalDelegated: bigint = delegate.delegations.reduce(
        (acc, curr) => acc + BigInt(curr?.amount || 0n),
        0n
      );

      return {
        name: githubDelegate?.name || 'Shadow Delegate',
        voteDelegateAddress: delegate.id,
        address: delegate.ownerAddress,
        status: githubDelegate ? DelegateStatusEnum.aligned : DelegateStatusEnum.shadow,
        creationDate: finalCreationDate,
        picture: githubDelegate?.picture,
        communication: githubDelegate?.communication,
        combinedParticipation: githubDelegate?.combinedParticipation,
        pollParticipation: githubDelegate?.pollParticipation,
        executiveParticipation: githubDelegate?.executiveParticipation,
        skyDelegated: formatEther(totalDelegated),
        delegatorCount: delegate.delegators,
        lastVoteDate: lastVoteTimestamp > 0 ? new Date(lastVoteTimestamp * 1000) : null,
        proposalsSupported: votedProposals?.length || 0,
        execSupported: execSupported && { title: execSupported.title, address: execSupported.address }
      };
    }) as DelegatePaginated[]
  };

  return delegatesData;
}
