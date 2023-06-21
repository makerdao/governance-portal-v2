/*

SPDX-FileCopyrightText: © 2023 Dai Foundation <www.daifoundation.org>

SPDX-License-Identifier: AGPL-3.0-or-later

*/

import { fetchChainDelegates } from './fetchChainDelegates';
import { DelegateStatusEnum, DelegateTypeEnum } from 'modules/delegates/delegates.constants';
import { fetchGithubDelegate, fetchGithubDelegates } from './fetchGithubDelegates';
import { fetchDelegationEventsByAddresses } from './fetchDelegationEventsByAddresses';
import { add, isBefore } from 'date-fns';
import { BigNumberJS } from 'lib/bigNumberJs';
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
import { getContracts } from 'modules/web3/helpers/getContracts';
import { networkNameToChainId } from 'modules/web3/helpers/chain';
import { ZERO_SLATE_HASH } from 'modules/executive/helpers/zeroSlateHash';
import { getSlateAddresses } from 'modules/executive/helpers/getSlateAddresses';
import { formatDelegationHistory } from 'modules/delegates/helpers/formatDelegationHistory';
import { CMSProposal } from 'modules/executive/types';
import { fetchLastPollVote } from 'modules/polling/api/fetchLastPollvote';
import { isAboutToExpireCheck } from 'modules/migration/helpers/expirationChecks';
import { getNewOwnerFromPrevious, getPreviousOwnerFromNew } from 'modules/migration/delegateAddressLinks';
import { allDelegatesCacheKey } from 'modules/cache/constants/cache-keys';
import { cacheGet, cacheSet } from 'modules/cache/cache';
import { TEN_MINUTES_IN_MS } from 'modules/app/constants/time';
import { gqlRequest } from 'modules/gql/gqlRequest';
import { delegatesQuery } from 'modules/gql/queries/delegates';
import { fetchDelegatesExecSupport } from './fetchDelegatesExecSupport';
import { fetchDelegateAddresses } from './fetchDelegateAddresses';
import getDelegatesCounts from '../helpers/getDelegatesCounts';
import { filterDelegates } from '../helpers/filterDelegates';
import { delegationMetricsQuery } from 'modules/gql/queries/delegationMetrics';
import { CvcWithCountAndDelegates } from '../types/cvc';
import { fetchCvcsTotalDelegated } from './fetchCvcsTotalDelegated';

function mergeDelegateInfo({
  onChainDelegate,
  previousOnChainDelegate,
  newOnChainDelegate,
  githubDelegate
}: {
  onChainDelegate: DelegateContractInformation;
  githubDelegate?: DelegateRepoInformation;
  previousOnChainDelegate?: DelegateContractInformation;
  newOnChainDelegate?: DelegateContractInformation;
}): Delegate {
  // check if contract is expired to assing the status
  const expirationDate = add(new Date(onChainDelegate.blockTimestamp), { years: 1 });
  const isExpired = isBefore(new Date(expirationDate), new Date());

  return {
    voteDelegateAddress: onChainDelegate.voteDelegateAddress,
    address: onChainDelegate.address,
    status: isExpired
      ? DelegateStatusEnum.expired
      : githubDelegate
      ? DelegateStatusEnum.constitutional
      : DelegateStatusEnum.shadow,
    expired: isExpired,
    expirationDate,
    isAboutToExpire: isAboutToExpireCheck(expirationDate),
    description: githubDelegate?.description || '',
    name: githubDelegate?.name || 'Shadow Delegate',
    cvc_name: githubDelegate?.cvc_name,
    picture: githubDelegate?.picture || '',
    id: onChainDelegate.voteDelegateAddress,
    externalUrl: githubDelegate?.externalUrl,
    lastVoteDate: null,
    communication: githubDelegate?.communication,
    combinedParticipation: githubDelegate?.combinedParticipation,
    pollParticipation: githubDelegate?.pollParticipation,
    executiveParticipation: githubDelegate?.executiveParticipation,
    cuMember: githubDelegate?.cuMember,
    mkrDelegated: onChainDelegate.mkrDelegated,
    proposalsSupported: onChainDelegate.proposalsSupported,
    execSupported: undefined,
    mkrLockedDelegate: onChainDelegate.mkrLockedDelegate,
    blockTimestamp: onChainDelegate.blockTimestamp,
    ...(previousOnChainDelegate && {
      previous: {
        address: previousOnChainDelegate.address,
        voteDelegateAddress: previousOnChainDelegate.voteDelegateAddress
      }
    }),
    ...(newOnChainDelegate && {
      next: {
        address: newOnChainDelegate.address,
        voteDelegateAddress: newOnChainDelegate.voteDelegateAddress
      }
    })
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

  // check if delegate owner has link to a previous contract
  const previousOwnerAddress = getPreviousOwnerFromNew(onChainDelegate.address, currentNetwork);

  // fetch the previous contract if so
  const previousOnChainDelegate = previousOwnerAddress
    ? onChainDelegates.find(i => i.address.toLowerCase() === previousOwnerAddress.toLowerCase())
    : undefined;

  // check if delegate owner has a link to a newer contract
  const newOwnerAddress = getNewOwnerFromPrevious(onChainDelegate.address, currentNetwork);

  // fetch the newer contract if so
  const newOnChainDelegate = newOwnerAddress
    ? onChainDelegates.find(i => i.address.toLowerCase() === newOwnerAddress.toLowerCase())
    : undefined;

  // note: this will only go back one contract relationship
  // TODO: create a helper to fetch the earliest contract address
  // fetch github info for delegate (if they have a link to prev contract, prev contract is the info directory key)
  const { data: githubDelegate } = await fetchGithubDelegate(
    previousOnChainDelegate
      ? previousOnChainDelegate.voteDelegateAddress
      : onChainDelegate.voteDelegateAddress,
    currentNetwork
  );

  return mergeDelegateInfo({ onChainDelegate, previousOnChainDelegate, githubDelegate, newOnChainDelegate });
}

// Returns the delegate info without the chain data about votes
export async function fetchDelegatesInformation(network?: SupportedNetworks): Promise<Delegate[]> {
  const currentNetwork = network ? network : DEFAULT_NETWORK.network;

  const { data: gitHubDelegates } = await fetchGithubDelegates(currentNetwork);

  const onChainDelegates = await fetchChainDelegates(currentNetwork);

  // Map all the raw delegates info and map it to Delegate structure with the github info
  const mergedDelegates: Delegate[] = onChainDelegates.map(onChainDelegate => {
    // check if delegate owner has link to a previous contract
    const previousOwnerAddress = getPreviousOwnerFromNew(onChainDelegate.address, currentNetwork);

    // fetch the previous contract if so
    const previousOnChainDelegate = previousOwnerAddress
      ? onChainDelegates.find(i => i.address.toLowerCase() === previousOwnerAddress.toLowerCase())
      : undefined;

    // check if delegate owner has a link to a newer contract
    const newOwnerAddress = getNewOwnerFromPrevious(onChainDelegate.address, currentNetwork);

    // fetch the newer contract if so
    const newOnChainDelegate = newOwnerAddress
      ? onChainDelegates.find(i => i.address.toLowerCase() === newOwnerAddress.toLowerCase())
      : undefined;

    // note: this will only go back one contract relationship
    // TODO: create a helper to fetch the earliest contract address
    const githubDelegate = gitHubDelegates
      ? gitHubDelegates.find(
          i =>
            i.voteDelegateAddress.toLowerCase() ===
            (previousOnChainDelegate ?? onChainDelegate).voteDelegateAddress.toLowerCase()
        )
      : undefined;

    return mergeDelegateInfo({
      onChainDelegate,
      previousOnChainDelegate,
      githubDelegate,
      newOnChainDelegate
    });
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

  // This contains all the delegates including info merged with constitutional delegates
  const delegatesInfo = await fetchDelegatesInformation(currentNetwork);

  const contracts = getContracts(networkNameToChainId(currentNetwork), undefined, undefined, true);
  const executives = await getGithubExecutives(currentNetwork);

  const delegateAddresses = delegatesInfo.map(d => d.voteDelegateAddress.toLowerCase());
  // Fetch all delegate lock events to calculate total number of delegators
  const lockEvents = await fetchDelegationEventsByAddresses(delegateAddresses, currentNetwork);
  const delegationHistory = formatDelegationHistory(lockEvents);

  const delegates = await Promise.all(
    delegatesInfo.map(async delegate => {
      const votedSlate = await contracts.chief.votes(delegate.voteDelegateAddress);
      const votedProposals =
        votedSlate !== ZERO_SLATE_HASH ? await getSlateAddresses(contracts.chief, votedSlate) : [];
      const proposalsSupported: number = votedProposals?.length || 0;
      const execSupported: CMSProposal | undefined = executives?.find(proposal =>
        votedProposals?.find(vp => vp.toLowerCase() === proposal?.address?.toLowerCase())
      );

      // Filter the lock events to get only the ones for this delegate address
      const mkrLockedDelegate = lockEvents.filter(
        ({ delegateContractAddress }) =>
          delegateContractAddress.toLowerCase() === delegate.voteDelegateAddress.toLowerCase()
      );

      const lastVote = await fetchLastPollVote(delegate.voteDelegateAddress, currentNetwork);

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
        lastVoteDate: lastVote ? lastVote.blockTimestamp : null,
        mkrLockedDelegate
      };
    })
  );

  const sortedDelegates = delegates.sort((a, b) => {
    if (sortBy === 'mkr') {
      const bSupport = b.mkrDelegated ? b.mkrDelegated : 0;
      const aSupport = a.mkrDelegated ? a.mkrDelegated : 0;
      return new BigNumberJS(aSupport).gt(new BigNumberJS(bSupport)) ? -1 : 1;
    } else if (sortBy === 'date') {
      return a.expirationDate > b.expirationDate ? -1 : 1;
    } else if (sortBy === 'delegators') {
      const delegationHistoryA = formatDelegationHistory(a.mkrLockedDelegate);
      const delegationHistoryB = formatDelegationHistory(b.mkrLockedDelegate);
      const activeDelegatorsA = delegationHistoryA.filter(({ lockAmount }) =>
        new BigNumberJS(lockAmount).gt(0)
      ).length;
      const activeDelegatorsB = delegationHistoryB.filter(({ lockAmount }) =>
        new BigNumberJS(lockAmount).gt(0)
      ).length;
      return activeDelegatorsA > activeDelegatorsB ? -1 : 1;
    } else {
      // Random sorting
      return Math.random() * 1 > 0.5 ? -1 : 1;
    }
  });

  // Exclude expired, and dedupe migrated delegates for stats purposes
  const dedupedDelegates = sortedDelegates
    .filter(({ status }) => status !== DelegateStatusEnum.expired)
    .filter(({ next }) => !next);

  const delegatesResponse: DelegatesAPIResponse = {
    delegates: sortedDelegates,
    stats: {
      total: dedupedDelegates.length,
      shadow: dedupedDelegates.filter(d => d.status === DelegateStatusEnum.shadow).length,
      constitutional: dedupedDelegates.filter(d => d.status === DelegateStatusEnum.constitutional).length,
      totalMKRDelegated: new BigNumberJS(
        delegates.reduce((prev, next) => {
          const mkrDelegated = new BigNumberJS(next.mkrDelegated);
          return prev.plus(mkrDelegated);
        }, new BigNumberJS(0))
      ).toString(),
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
    const oldOwner = getPreviousOwnerFromNew(delegate.delegate, network);
    const newOwner = getNewOwnerFromPrevious(delegate.delegate, network);

    const oldContractAddress = allDelegateAddresses.find(del => del.delegate === oldOwner)?.voteDelegate;
    const newContractAddress = allDelegateAddresses.find(del => del.delegate === newOwner)?.voteDelegate;

    const ghDelegate = githubDelegates?.find(del =>
      [delegate.voteDelegate, oldContractAddress, newContractAddress].includes(
        del.voteDelegateAddress.toLowerCase()
      )
    );

    const expirationDate = add(new Date(delegate.blockTimestamp), { years: 1 });

    return {
      ...delegate,
      delegateType: ghDelegate ? DelegateTypeEnum.CONSTITUTIONAL : DelegateTypeEnum.SHADOW,
      blockTimestamp: delegate.blockTimestamp,
      expirationDate,
      expired: expirationDate > new Date() ? false : true,
      isAboutToExpire: isAboutToExpireCheck(expirationDate),
      name: ghDelegate?.name,
      picture: ghDelegate?.picture,
      cvc_name: ghDelegate?.cvc_name,
      previous:
        oldOwner && oldContractAddress
          ? { address: oldOwner, voteDelegateAddress: oldContractAddress }
          : undefined,
      next:
        newOwner && newContractAddress
          ? { address: newOwner, voteDelegateAddress: newContractAddress }
          : undefined
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
    status: foundGithubDelegate ? DelegateStatusEnum.constitutional : DelegateStatusEnum.shadow,
    cuMember: foundGithubDelegate?.cuMember,
    pollParticipation: foundGithubDelegate?.pollParticipation,
    executiveParticipation: foundGithubDelegate?.executiveParticipation,
    combinedParticipation: foundGithubDelegate?.combinedParticipation,
    communication: foundGithubDelegate?.communication,
    blockTimestamp: foundDelegate.blockTimestamp,
    expirationDate: foundDelegate.expirationDate,
    expired: foundDelegate.expired,
    isAboutToExpire: foundDelegate.isAboutToExpire,
    previous: foundDelegate.previous,
    next: foundDelegate.next
  };
}

export async function fetchDelegatesInfo(
  network: SupportedNetworks,
  constitutionalOnly: boolean,
  includeExpired: boolean
): Promise<DelegateInfo[]> {
  const [githubDelegates, allDelegatesWithNamesAndLinks] = await fetchAndMergeDelegates(network);

  const delegatesInfo = allDelegatesWithNamesAndLinks
    .filter(
      delegate =>
        (constitutionalOnly ? delegate.delegateType === DelegateTypeEnum.CONSTITUTIONAL : true) &&
        (includeExpired ? true : !delegate.expired)
    )
    .filter((delegate, i, arr) =>
      constitutionalOnly && !includeExpired ? arr.findIndex(d => d.name === delegate.name) === i : true
    )
    .sort((a, b) => new Date(a.blockTimestamp).getTime() - new Date(b.blockTimestamp).getTime())
    .map(delegate => {
      const githubDelegate = githubDelegates?.find(d => d.name === delegate.name);
      return {
        name: delegate.name || 'Shadow Delegate',
        picture: githubDelegate?.picture,
        address: delegate.delegate,
        voteDelegateAddress: delegate.voteDelegate,
        status: delegate.name ? DelegateStatusEnum.constitutional : DelegateStatusEnum.shadow,
        cuMember: githubDelegate?.cuMember,
        pollParticipation: githubDelegate?.pollParticipation,
        executiveParticipation: githubDelegate?.executiveParticipation,
        combinedParticipation: githubDelegate?.combinedParticipation,
        communication: githubDelegate?.communication,
        blockTimestamp: delegate.blockTimestamp,
        expirationDate: delegate.expirationDate,
        expired: delegate.expired,
        isAboutToExpire: delegate.isAboutToExpire,
        previous: delegate.previous,
        next: delegate.next
      };
    });

  return delegatesInfo;
}

export async function fetchDelegatesPaginated({
  network,
  pageSize,
  page,
  includeExpired,
  orderBy,
  orderDirection,
  seed,
  delegateType,
  searchTerm,
  cvcs
}: DelegatesValidatedQueryParams): Promise<DelegatesPaginatedAPIResponse> {
  const chainId = networkNameToChainId(network);

  const [githubDelegates, allDelegatesWithNamesAndLinks] = await fetchAndMergeDelegates(network);

  const { alignedDelegatesAddresses, filteredDelegateAddresses, filteredDelegateEntries } = filterDelegates(
    allDelegatesWithNamesAndLinks,
    cvcs,
    searchTerm,
    delegateType
  );

  const { constitutionalDelegatesCount, shadowDelegatesCount, totalDelegatesCount } =
    getDelegatesCounts(filteredDelegateEntries);

  const cvcAndCount = allDelegatesWithNamesAndLinks
    .filter(delegate => !delegate.expired && delegate.name && delegate.cvc_name)
    .filter((delegate, i, thisArr) => thisArr.findIndex(del => del.name === delegate.name) === i)
    .reduce((acc, cur) => {
      if (!cur.cvc_name) return acc;

      const prev = acc.findIndex(cvc => cvc.cvc_name === cur.cvc_name);
      const foundInFilteredDelegates = filteredDelegateAddresses.includes(cur.voteDelegate);
      if (prev !== -1) {
        if (foundInFilteredDelegates) {
          acc[prev].count += 1;
        }
        acc[prev].delegates.push(cur.voteDelegate);
        if (cur.picture) {
          acc[prev].picture = cur.picture;
        }
      } else {
        acc.push({
          cvc_name: cur.cvc_name,
          count: foundInFilteredDelegates ? 1 : 0,
          delegates: [cur.voteDelegate],
          ...(cur.picture ? { picture: cur.picture } : {})
        });
      }

      return acc;
    }, [] as CvcWithCountAndDelegates[]);

  let delegatesQueryFilter;
  if (delegateType !== DelegateTypeEnum.CONSTITUTIONAL && delegateType !== DelegateTypeEnum.SHADOW) {
    delegatesQueryFilter = searchTerm || cvcs ? { voteDelegate: { in: filteredDelegateAddresses } } : null;
  } else {
    delegatesQueryFilter = {
      and: [
        {
          voteDelegate:
            delegateType === DelegateTypeEnum.CONSTITUTIONAL
              ? { in: alignedDelegatesAddresses }
              : { notIn: alignedDelegatesAddresses }
        }
      ]
    };
    (searchTerm || cvcs) &&
      delegatesQueryFilter.and.push({ voteDelegate: { in: filteredDelegateAddresses } });
  }

  const delegatesQueryVariables = {
    first: pageSize,
    offset: (page - 1) * pageSize,
    includeExpired,
    orderBy,
    orderDirection,
    constitutionalDelegates: alignedDelegatesAddresses
  };
  if (delegatesQueryFilter) {
    delegatesQueryVariables['filter'] = delegatesQueryFilter;
  }
  if (seed) {
    delegatesQueryVariables['seed'] = seed;
  }

  const [githubExecutives, delegatesExecSupport, delegatesQueryRes, delegationMetricsRes, cvcStats] =
    await Promise.all([
      getGithubExecutives(network),
      fetchDelegatesExecSupport(network),
      gqlRequest<any>({
        chainId,
        query: delegatesQuery,
        variables: delegatesQueryVariables
      }),
      gqlRequest<any>({
        chainId,
        query: delegationMetricsQuery
      }),
      fetchCvcsTotalDelegated(cvcAndCount, network)
    ]);

  const delegatesData = {
    paginationInfo: {
      totalCount: delegatesQueryRes.delegates.totalCount,
      page,
      numPages: Math.ceil(delegatesQueryRes.delegates.totalCount / pageSize),
      hasNextPage: delegatesQueryRes.delegates.pageInfo.hasNextPage
    },
    stats: {
      total: totalDelegatesCount,
      shadow: shadowDelegatesCount,
      constitutional: constitutionalDelegatesCount,
      totalMKRDelegated: delegationMetricsRes.delegationMetrics.totalMkrDelegated || 0,
      totalDelegators: +delegationMetricsRes.delegationMetrics.delegatorCount || 0
    },
    delegates: delegatesQueryRes.delegates.nodes.map(delegate => {
      const allDelegatesEntry = allDelegatesWithNamesAndLinks.find(
        del => del.voteDelegate === delegate.voteDelegate
      );

      const githubDelegate = githubDelegates?.find(ghDelegate => ghDelegate.name === allDelegatesEntry?.name);

      const votedProposals = delegatesExecSupport.data?.find(
        del => del.voteDelegate === delegate.voteDelegate
      )?.votedProposals;
      const execSupported = githubExecutives.find(proposal =>
        votedProposals?.find(vp => vp.toLowerCase() === proposal?.address?.toLowerCase())
      );

      return {
        name: githubDelegate?.name || 'Shadow Delegate',
        cvc_name: githubDelegate?.cvc_name,
        voteDelegateAddress: delegate.voteDelegate,
        address: delegate.delegate,
        status: delegate.expired
          ? DelegateStatusEnum.expired
          : githubDelegate
          ? DelegateStatusEnum.constitutional
          : DelegateStatusEnum.shadow,
        creationDate: new Date(delegate.creationDate),
        expirationDate: new Date(delegate.expirationDate),
        expired: delegate.expired,
        isAboutToExpire: isAboutToExpireCheck(new Date(delegate.expirationDate)),
        picture: githubDelegate?.picture,
        communication: githubDelegate?.communication,
        combinedParticipation: githubDelegate?.combinedParticipation,
        pollParticipation: githubDelegate?.pollParticipation,
        executiveParticipation: githubDelegate?.executiveParticipation,
        cuMember: githubDelegate?.cuMember,
        mkrDelegated: delegate.totalMkr,
        delegatorCount: delegate.delegatorCount,
        lastVoteDate: delegate.lastVoted && new Date(delegate.lastVoted),
        proposalsSupported: votedProposals?.length || 0,
        execSupported: execSupported && { title: execSupported.title, address: execSupported.address },
        previous: allDelegatesEntry?.previous,
        next: allDelegatesEntry?.next
      };
    }) as DelegatePaginated[],
    cvcs: cvcStats
  };

  return delegatesData;
}
