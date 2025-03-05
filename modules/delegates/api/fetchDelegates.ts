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
import { isAboutToExpireCheck } from 'modules/migration/helpers/expirationChecks';
import { getLatestOwnerFromOld, getOriginalOwnerFromNew } from 'modules/migration/delegateAddressLinks';
import { allDelegatesCacheKey } from 'modules/cache/constants/cache-keys';
import { cacheGet, cacheSet } from 'modules/cache/cache';
import { TEN_MINUTES_IN_MS } from 'modules/app/constants/time';
import { gqlRequest } from 'modules/gql/gqlRequest';
import { delegatesQuery } from 'modules/gql/queries/subgraph/delegates';
import { fetchDelegatesExecSupport } from './fetchDelegatesExecSupport';
import { fetchDelegateAddresses } from './fetchDelegateAddresses';
import getDelegatesCounts from '../helpers/getDelegatesCounts';
import { filterDelegates } from '../helpers/filterDelegates';
import { fetchDelegationMetrics } from './fetchDelegationMetrics';

function mergeDelegateInfo({
  onChainDelegate,
  originalOnChainDelegate,
  newOnChainDelegate,
  githubDelegate
}: {
  onChainDelegate: DelegateContractInformation;
  githubDelegate?: DelegateRepoInformation;
  originalOnChainDelegate?: DelegateContractInformation;
  newOnChainDelegate?: DelegateContractInformation;
}): Delegate {
  // check if contract is expired to assing the status
  const expirationDate =
    onChainDelegate.delegateVersion === 2
      ? undefined
      : add(new Date(onChainDelegate.blockTimestamp), { years: 1 });
  const isExpired =
    onChainDelegate.delegateVersion === 2 ? false : isBefore(new Date(expirationDate!), new Date());
  const isAboutToExpire =
    onChainDelegate.delegateVersion === 2 ? false : isAboutToExpireCheck(expirationDate);

  return {
    voteDelegateAddress: onChainDelegate.voteDelegateAddress,
    address: onChainDelegate.address,
    status: isExpired
      ? DelegateStatusEnum.expired
      : githubDelegate
      ? DelegateStatusEnum.aligned
      : DelegateStatusEnum.shadow,
    expired: isExpired,
    expirationDate,
    isAboutToExpire,
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
    cuMember: githubDelegate?.cuMember,
    mkrDelegated: onChainDelegate.mkrDelegated,
    proposalsSupported: onChainDelegate.proposalsSupported,
    execSupported: undefined,
    mkrLockedDelegate: onChainDelegate.mkrLockedDelegate,
    blockTimestamp: onChainDelegate.blockTimestamp,
    ...(originalOnChainDelegate && {
      previous: {
        address: originalOnChainDelegate.address,
        voteDelegateAddress: originalOnChainDelegate.voteDelegateAddress
      }
    }),
    ...(newOnChainDelegate && {
      next: {
        address: newOnChainDelegate.address,
        voteDelegateAddress: newOnChainDelegate.voteDelegateAddress
      }
    }),
    delegateVersion: onChainDelegate.delegateVersion || 1
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
  const originalOwnerAddress = getOriginalOwnerFromNew(onChainDelegate.address, currentNetwork);

  // fetch the original contract if so
  const originalOnChainDelegate = originalOwnerAddress
    ? onChainDelegates.find(i => i.address.toLowerCase() === originalOwnerAddress.toLowerCase())
    : undefined;

  // check if delegate owner has a link to a newer contract
  const latestOwnerAddress = getLatestOwnerFromOld(onChainDelegate.address, currentNetwork);

  // fetch the newer contract if so
  const newOnChainDelegate = latestOwnerAddress
    ? onChainDelegates.find(i => i.address.toLowerCase() === latestOwnerAddress.toLowerCase())
    : undefined;

  // fetch github info for delegate (if they have a link to prev contract, prev contract is the info directory key)
  const { data: githubDelegate } = await fetchGithubDelegate(
    originalOnChainDelegate
      ? originalOnChainDelegate.voteDelegateAddress
      : onChainDelegate.voteDelegateAddress,
    currentNetwork
  );

  return mergeDelegateInfo({ onChainDelegate, originalOnChainDelegate, githubDelegate, newOnChainDelegate });
}

// Returns the delegate info without the chain data about votes
export async function fetchDelegatesInformation(network?: SupportedNetworks): Promise<Delegate[]> {
  const currentNetwork = network ? network : DEFAULT_NETWORK.network;

  const { data: gitHubDelegates } = await fetchGithubDelegates(currentNetwork);

  const onChainDelegates = await fetchChainDelegates(currentNetwork);

  // Map all the raw delegates info and map it to Delegate structure with the github info
  const mergedDelegates: Delegate[] = onChainDelegates.map(onChainDelegate => {
    // check if delegate owner has link to a previous contract
    const originalOwnerAddress = getOriginalOwnerFromNew(onChainDelegate.address, currentNetwork);

    // fetch the original contract if so
    const originalOnChainDelegate = originalOwnerAddress
      ? onChainDelegates.find(i => i.address.toLowerCase() === originalOwnerAddress.toLowerCase())
      : undefined;

    // check if delegate owner has a link to a newer contract
    const latestOwnerAddress = getLatestOwnerFromOld(onChainDelegate.address, currentNetwork);

    // fetch the newer contract if so
    const newOnChainDelegate = latestOwnerAddress
      ? onChainDelegates.find(i => i.address.toLowerCase() === latestOwnerAddress.toLowerCase())
      : undefined;

    const githubDelegate = gitHubDelegates
      ? gitHubDelegates.find(
          i =>
            i.voteDelegateAddress.toLowerCase() ===
            (originalOnChainDelegate ?? onChainDelegate).voteDelegateAddress.toLowerCase()
        )
      : undefined;

    return mergeDelegateInfo({
      onChainDelegate,
      originalOnChainDelegate,
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

  // This contains all the delegates including info merged with aligned delegates
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
      const bSupport = b.mkrDelegated ? b.mkrDelegated : 0;
      const aSupport = a.mkrDelegated ? a.mkrDelegated : 0;
      return new BigNumberJS(aSupport).gt(new BigNumberJS(bSupport)) ? -1 : 1;
    } else if (sortBy === 'date') {
      return a.expirationDate && b.expirationDate ? (a.expirationDate > b.expirationDate ? -1 : 1) : 0;
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
      aligned: dedupedDelegates.filter(d => d.status === DelegateStatusEnum.aligned).length,
      totalMKRDelegated: new BigNumberJS(
        delegates.reduce((prev, next) => {
          const mkrDelegated = new BigNumberJS(next.mkrDelegated);
          return prev.plus(mkrDelegated);
        }, new BigNumberJS(0))
      ).toNumber(),
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
    const originalOwner = getOriginalOwnerFromNew(delegate.delegate, network);
    const latestOwner = getLatestOwnerFromOld(delegate.delegate, network);

    const oldContractAddress = allDelegateAddresses.find(del => del.delegate === originalOwner)?.voteDelegate;
    const newContractAddress = allDelegateAddresses.find(del => del.delegate === latestOwner)?.voteDelegate;

    const ghDelegate = githubDelegates?.find(del =>
      [delegate.voteDelegate, oldContractAddress, newContractAddress].includes(
        del.voteDelegateAddress.toLowerCase()
      )
    );

    const expirationDate =
      delegate.delegateVersion === 2 ? undefined : add(new Date(delegate.blockTimestamp), { years: 1 });
    const expired =
      delegate.delegateVersion === 2 ? false : expirationDate && expirationDate > new Date() ? false : true;
    const isAboutToExpire = delegate.delegateVersion === 2 ? false : isAboutToExpireCheck(expirationDate);
    return {
      ...delegate,
      delegateType: ghDelegate ? DelegateTypeEnum.ALIGNED : DelegateTypeEnum.SHADOW,
      blockTimestamp: delegate.blockTimestamp,
      expirationDate,
      expired,
      isAboutToExpire,
      name: ghDelegate?.name,
      picture: ghDelegate?.picture,
      previous:
        originalOwner && oldContractAddress
          ? { address: originalOwner, voteDelegateAddress: oldContractAddress }
          : undefined,
      next:
        latestOwner && newContractAddress
          ? { address: latestOwner, voteDelegateAddress: newContractAddress }
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
    status: foundGithubDelegate ? DelegateStatusEnum.aligned : DelegateStatusEnum.shadow,
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
    next: foundDelegate.next,
    delegateVersion: foundDelegate.delegateVersion
  };
}

export async function fetchDelegatesInfo(
  network: SupportedNetworks,
  alignedOnly: boolean,
  includeExpired: boolean
): Promise<DelegateInfo[]> {
  const [githubDelegates, allDelegatesWithNamesAndLinks] = await fetchAndMergeDelegates(network);

  const delegatesInfo = allDelegatesWithNamesAndLinks
    .filter(
      delegate =>
        (alignedOnly ? delegate.delegateType === DelegateTypeEnum.ALIGNED : true) &&
        (includeExpired ? true : !delegate.expired)
    )
    .filter((delegate, i, arr) =>
      alignedOnly && !includeExpired ? arr.findIndex(d => d.name === delegate.name) === i : true
    )
    .sort((a, b) => new Date(a.blockTimestamp).getTime() - new Date(b.blockTimestamp).getTime())
    .map(delegate => {
      const githubDelegate = githubDelegates?.find(d => d.name === delegate.name);
      return {
        name: delegate.name || 'Shadow Delegate',
        picture: githubDelegate?.picture,
        address: delegate.delegate,
        voteDelegateAddress: delegate.voteDelegate,
        status: delegate.name ? DelegateStatusEnum.aligned : DelegateStatusEnum.shadow,
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
        next: delegate.next,
        delegateVersion: delegate.delegateVersion
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

  let delegatesQueryFilter;
  if (delegateType !== DelegateTypeEnum.ALIGNED && delegateType !== DelegateTypeEnum.SHADOW) {
    delegatesQueryFilter = searchTerm ? { voteDelegate: { in: filteredDelegateAddresses } } : null;
  } else {
    delegatesQueryFilter = {
      and: [
        {
          voteDelegate:
            delegateType === DelegateTypeEnum.ALIGNED
              ? { in: alignedDelegatesAddresses }
              : { notIn: alignedDelegatesAddresses }
        }
      ]
    };
    searchTerm && delegatesQueryFilter.and.push({ voteDelegate: { in: filteredDelegateAddresses } });
  }

  const delegatesQueryVariables = {
    first: pageSize,
    skip: (page - 1) * pageSize,
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

  const [githubExecutives, delegatesExecSupport, delegatesQueryRes, delegationMetrics] = await Promise.all([
    getGithubExecutives(network),
    fetchDelegatesExecSupport(network),
    gqlRequest<any>({
      chainId,
      query: delegatesQuery,
      useSubgraph: true,
      variables: delegatesQueryVariables
    }),
    fetchDelegationMetrics(network)
  ]);
  const delegatesData = {
    paginationInfo: {
      totalCount: delegatesQueryRes.delegates.totalCount,
      page,
      numPages: Math.ceil(delegatesQueryRes.delegates.totalCount / pageSize),
      hasNextPage: true //TODO: update
    },
    stats: {
      total: totalDelegatesCount,
      shadow: shadowDelegatesCount,
      aligned: alignedDelegatesCount,
      totalMKRDelegated: delegationMetrics.totalMkrDelegated || 0,
      totalDelegators: delegationMetrics.delegatorCount || 0
    },
    delegates: delegatesQueryRes.delegates.map(delegate => {
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

      let expirationDate: Date | null = null;
      if (delegate.version == '1') {
        try {
          const tempExpDate = add(new Date(blockTimestampNum * 1000), { years: 1 });
          // Validate the date is valid
          tempExpDate.toISOString();
          expirationDate = tempExpDate;
        } catch (e) {
          // If date is invalid, use null as fallback
          expirationDate = null;
        }
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

      // Handle expirationDate from delegate object
      let finalExpirationDate: Date | null = null;
      if (delegate.delegateVersion !== 2 && delegate.expirationDate) {
        try {
          const tempDate = new Date(delegate.expirationDate);
          // Validate the date is valid
          tempDate.toISOString();
          finalExpirationDate = tempDate;
        } catch (e) {
          // If date is invalid, use the previously calculated expirationDate as fallback
          finalExpirationDate = expirationDate;
        }
      } else if (expirationDate) {
        finalExpirationDate = expirationDate;
      }

      return {
        name: githubDelegate?.name || 'Shadow Delegate',
        voteDelegateAddress: delegate.id,
        address: delegate.ownerAddress,
        status: delegate.expired
          ? DelegateStatusEnum.expired
          : githubDelegate
          ? DelegateStatusEnum.aligned
          : DelegateStatusEnum.shadow,
        creationDate: finalCreationDate,
        expirationDate: delegate.delegateVersion === 2 ? undefined : finalExpirationDate,
        expired: delegate.expired,
        isAboutToExpire:
          delegate.delegateVersion === 2
            ? false
            : finalExpirationDate
            ? isAboutToExpireCheck(finalExpirationDate)
            : false,
        picture: githubDelegate?.picture,
        communication: githubDelegate?.communication,
        combinedParticipation: githubDelegate?.combinedParticipation,
        pollParticipation: githubDelegate?.pollParticipation,
        executiveParticipation: githubDelegate?.executiveParticipation,
        cuMember: githubDelegate?.cuMember,
        mkrDelegated: delegate.totalDelegated,
        delegatorCount: delegate.delegators,
        lastVoteDate:
          delegate.voter.lastVotedTimestamp && new Date(Number(delegate.voter.lastVotedTimestamp) * 1000),
        proposalsSupported: votedProposals?.length || 0,
        execSupported: execSupported && { title: execSupported.title, address: execSupported.address },
        previous: allDelegatesEntry?.previous,
        next: allDelegatesEntry?.next,
        delegateVersion: delegate.version ? parseInt(delegate.version) : 1
      };
    }) as DelegatePaginated[]
  };

  return delegatesData;
}
