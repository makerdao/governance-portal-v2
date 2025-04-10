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
  DelegatesAPIResponse,
  Delegate,
  DelegateContractInformation,
  DelegateRepoInformation,
  DelegatesValidatedQueryParams,
  DelegatesPaginatedAPIResponse,
  DelegatePaginated,
  AllDelegatesEntryWithName,
  DelegateInfo
} from 'modules/delegates/types';
import { getGithubExecutives } from 'modules/executive/api/fetchExecutives';
import { networkNameToChainId } from 'modules/web3/helpers/chain';
import { ZERO_SLATE_HASH } from 'modules/executive/helpers/zeroSlateHash';
import { getSlateAddresses } from 'modules/executive/helpers/getSlateAddresses';
import { formatDelegationHistory } from 'modules/delegates/helpers/formatDelegationHistory';
import { CMSProposal } from 'modules/executive/types';
import { allDelegatesCacheKey } from 'modules/cache/constants/cache-keys';
import { cacheGet, cacheSet } from 'modules/cache/cache';
import { TEN_MINUTES_IN_MS } from 'modules/app/constants/time';
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
import { chiefAbi, chiefAddress } from 'modules/contracts/generated';
import { getPublicClient } from 'modules/web3/helpers/getPublicClient';
import { formatEther, parseEther } from 'viem';

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
    mkrDelegated: onChainDelegate.mkrDelegated,
    proposalsSupported: onChainDelegate.proposalsSupported,
    execSupported: undefined,
    mkrLockedDelegate: onChainDelegate.mkrLockedDelegate,
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

  onChainDelegate.mkrLockedDelegate = delegationEvents;

  // fetch github info for delegate
  const { data: githubDelegate } = await fetchGithubDelegate(
    onChainDelegate.voteDelegateAddress,
    currentNetwork
  );

  return mergeDelegateInfo({ onChainDelegate, githubDelegate });
}

// Returns the delegate info without the chain data about votes
export async function fetchDelegatesInformation(network?: SupportedNetworks): Promise<Delegate[]> {
  const currentNetwork = network ? network : DEFAULT_NETWORK.network;

  const { data: gitHubDelegates } = await fetchGithubDelegates(currentNetwork);

  const onChainDelegates = await fetchChainDelegates(currentNetwork);

  // Map all the raw delegates info and map it to Delegate structure with the github info
  const mergedDelegates: Delegate[] = onChainDelegates.map(onChainDelegate => {
    const githubDelegate = gitHubDelegates
      ? gitHubDelegates.find(
          i => i.voteDelegateAddress.toLowerCase() === onChainDelegate.voteDelegateAddress.toLowerCase()
        )
      : undefined;

    return mergeDelegateInfo({ onChainDelegate, githubDelegate });
  });

  return mergedDelegates;
}

// Returns a list of delegates, mixin onchain and repo information
export async function fetchDelegates(
  network?: SupportedNetworks,
  sortBy: 'mkr' | 'random' | 'delegators' | 'date' = 'random'
): Promise<DelegatesAPIResponse> {
  const currentNetwork = network ? network : DEFAULT_NETWORK.network;

  const cacheKey = allDelegatesCacheKey;
  const cachedResponse = await cacheGet(cacheKey, network);
  if (cachedResponse) {
    return JSON.parse(cachedResponse);
  }

  // This contains all the delegates including info merged with aligned delegates
  const delegatesInfo = await fetchDelegatesInformation(currentNetwork);

  const chainId = networkNameToChainId(currentNetwork);
  const publicClient = getPublicClient(chainId);

  const executives = await getGithubExecutives(currentNetwork);

  const delegateAddresses = delegatesInfo.map(d => d.voteDelegateAddress.toLowerCase());
  // Fetch all delegate lock events to calculate total number of delegators
  const lockEvents = await fetchDelegationEventsByAddresses(delegateAddresses, currentNetwork);
  const delegationHistory = formatDelegationHistory(lockEvents);

  const delegates = await Promise.all(
    delegatesInfo.map(async delegate => {
      const votedSlate = await publicClient.readContract({
        address: chiefAddress[chainId],
        abi: chiefAbi,
        functionName: 'votes',
        args: [delegate.voteDelegateAddress as `0x${string}`]
      });
      const votedProposals =
        votedSlate !== ZERO_SLATE_HASH
          ? await getSlateAddresses(chainId, chiefAddress[chainId], chiefAbi, votedSlate)
          : [];
      const proposalsSupported: number = votedProposals?.length || 0;
      const execSupported: CMSProposal | undefined = executives?.find(proposal =>
        votedProposals?.find(vp => vp.toLowerCase() === proposal?.address?.toLowerCase())
      );

      // Filter the lock events to get only the ones for this delegate address
      const mkrLockedDelegate = lockEvents.filter(
        ({ delegateContractAddress }) =>
          delegateContractAddress.toLowerCase() === delegate.voteDelegateAddress.toLowerCase()
      );

      return {
        ...delegate,
        // Trim the description when fetching all the delegates
        description: delegate.description.substring(0, 100) + '...',
        proposalsSupported,
        execSupported: execSupported
          ? {
              ...execSupported,
              content: '...',
              about: '...',
              proposalBlurb: '...'
            }
          : undefined,
        lastVoteDate: delegate.lastVoteDate ? delegate.lastVoteDate : null,
        mkrLockedDelegate
      };
    })
  );

  const sortedDelegates = delegates.sort((a, b) => {
    if (sortBy === 'mkr') {
      const bSupport = b.mkrDelegated ? b.mkrDelegated : '0';
      const aSupport = a.mkrDelegated ? a.mkrDelegated : '0';
      return parseEther(aSupport) > parseEther(bSupport) ? -1 : 1;
    } else if (sortBy === 'delegators') {
      const delegationHistoryA = formatDelegationHistory(a.mkrLockedDelegate);
      const delegationHistoryB = formatDelegationHistory(b.mkrLockedDelegate);
      const activeDelegatorsA = delegationHistoryA.filter(
        ({ lockAmount }) => parseEther(lockAmount) > 0n
      ).length;
      const activeDelegatorsB = delegationHistoryB.filter(
        ({ lockAmount }) => parseEther(lockAmount) > 0n
      ).length;
      return activeDelegatorsA > activeDelegatorsB ? -1 : 1;
    } else {
      // Random sorting
      return Math.random() * 1 > 0.5 ? -1 : 1;
    }
  });

  const delegatesResponse: DelegatesAPIResponse = {
    delegates: sortedDelegates,
    stats: {
      total: sortedDelegates.length,
      shadow: sortedDelegates.filter(d => d.status === DelegateStatusEnum.shadow).length,
      aligned: sortedDelegates.filter(d => d.status === DelegateStatusEnum.aligned).length,
      totalMKRDelegated: Number(
        formatEther(
          delegates.reduce((prev, next) => {
            const mkrDelegated = parseEther(next.mkrDelegated);
            return prev + mkrDelegated;
          }, 0n)
        )
      ),
      totalDelegators: delegationHistory.filter(d => parseFloat(d.lockAmount) > 0).length
    }
  };

  cacheSet(cacheKey, JSON.stringify(delegatesResponse), network, TEN_MINUTES_IN_MS);

  return delegatesResponse;
}

export async function fetchAndMergeDelegates(
  network: SupportedNetworks
): Promise<[DelegateRepoInformation[] | undefined, AllDelegatesEntryWithName[]]> {
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

  const baseDelegatesQueryFilter: any = { and: [] };
  if (searchTerm) {
    baseDelegatesQueryFilter.and.push({ id_in: filteredDelegateAddresses });
    if (delegateType === DelegateTypeEnum.ALIGNED) {
      baseDelegatesQueryFilter.and.push({ id_in: alignedDelegatesAddresses });
      baseDelegatesQueryFilter.and.push({ id_not_in: alignedDelegatesAddresses });
    }
  } else if (delegateType === DelegateTypeEnum.ALIGNED) {
    baseDelegatesQueryFilter.and.push({ id_in: alignedDelegatesAddresses });
  } else if (delegateType === DelegateTypeEnum.SHADOW) {
    baseDelegatesQueryFilter.and.push({ id_not_in: alignedDelegatesAddresses });
  }

  //get all aligned delegates (that match the filter)for the first page
  const alignedFilterFirstPage = {
    and: [...(baseDelegatesQueryFilter.and || []), { id_in: alignedDelegatesAddresses }]
  };
  //use this for subsequent pages as well as part of the first page
  const shadowFilterFirstPage = {
    and: [...(baseDelegatesQueryFilter.and || []), { id_not_in: alignedDelegatesAddresses }]
  };

  const queryOrderBy = orderBy === DelegateOrderByEnum.RANDOM ? DelegateOrderByEnum.MKR : orderBy;

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
    ...(delegatesQueryRes.alignedDelegates || []),
    ...(delegatesQueryRes.delegates || [])
  ];

  const combinedDelegateOwnerAddresses = combinedDelegates.map(delegate =>
    delegate.ownerAddress.toLowerCase()
  );

  const lastVotedArbitrumArray = await gqlRequest<any>({
    chainId: networkNameToChainId('arbitrum'), //TODO: update this if we add arbitrum sepolia support
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
      totalMKRDelegated: delegationMetrics.totalMkrDelegated || 0,
      totalDelegators: delegationMetrics.delegatorCount || 0
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
        mkrDelegated: delegate.totalDelegated,
        delegatorCount: delegate.delegators,
        lastVoteDate: lastVoteTimestamp > 0 ? new Date(lastVoteTimestamp * 1000) : null,
        proposalsSupported: votedProposals?.length || 0,
        execSupported: execSupported && { title: execSupported.title, address: execSupported.address }
      };
    }) as DelegatePaginated[]
  };

  return delegatesData;
}
