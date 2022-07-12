import { fetchChainDelegates } from './fetchChainDelegates';
import { DelegateStatusEnum } from 'modules/delegates/delegates.constants';
import { fetchGithubDelegate, fetchGithubDelegates } from './fetchGithubDelegates';
import { fetchDelegationEventsByAddresses } from './fetchDelegationEventsByAddresses';
import { add, isBefore } from 'date-fns';
import { BigNumberJS } from 'lib/bigNumberJs';
import { DEFAULT_NETWORK, SupportedNetworks } from 'modules/web3/constants/networks';
import {
  DelegatesAPIResponse,
  Delegate,
  DelegateContractInformation,
  DelegateRepoInformation
} from 'modules/delegates/types';
import { getGithubExecutives } from 'modules/executive/api/fetchExecutives';
import { getContracts } from 'modules/web3/helpers/getContracts';
import { networkNameToChainId } from 'modules/web3/helpers/chain';
import { ZERO_SLATE_HASH } from 'modules/executive/helpers/zeroSlateHash';
import { getSlateAddresses } from 'modules/executive/helpers/getSlateAddresses';
import { formatDelegationHistory } from 'modules/delegates/helpers/formatDelegationHistory';
import { CMSProposal } from 'modules/executive/types';
import { fetchLastPollVote } from 'modules/polling/api/fetchLastPollvote';
import { getDelegateTags } from './getDelegateTags';
import { Tag } from 'modules/app/types/tag';
import { isAboutToExpireCheck } from 'modules/migration/helpers/expirationChecks';
import {
  getNewOwnerFromPrevious,
  getPreviousOwnerFromNew,
  hardcodedExpired
} from 'modules/migration/delegateAddressLinks';

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
  // TODO: Remove hardcoded delegates
  const isHardcoded = hardcodedExpired.find(c => c.toLowerCase() === onChainDelegate.address.toLowerCase());
  const expirationDate = isHardcoded
    ? add(new Date(), { weeks: 1 })
    : add(new Date(onChainDelegate.blockTimestamp), { years: 1 });
  const isExpired = isBefore(new Date(expirationDate), new Date());
  const tags = getDelegateTags();

  return {
    voteDelegateAddress: onChainDelegate.voteDelegateAddress,
    address: onChainDelegate.address,
    status: githubDelegate
      ? DelegateStatusEnum.recognized
      : isExpired || isHardcoded
      ? DelegateStatusEnum.expired
      : DelegateStatusEnum.shadow,
    expired: isExpired,
    expirationDate,
    isAboutToExpire: isAboutToExpireCheck(expirationDate),
    description: githubDelegate?.description || '',
    name: githubDelegate?.name || 'Shadow Delegate',
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
    tags: (githubDelegate?.tags || []).map(tag => tags.find(t => t.id === tag)).filter(t => !!t) as Tag[],
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

// Returns info for one delegate mixing onchain and repo info
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

  // This contains all the delegates including info merged with recognized delegates
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
        ({ immediateCaller }) => immediateCaller.toLowerCase() === delegate.voteDelegateAddress.toLowerCase()
      );

      const lastVote = await fetchLastPollVote(delegate.voteDelegateAddress, currentNetwork);

      return {
        ...delegate,
        proposalsSupported,
        execSupported,
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

  const delegatesResponse: DelegatesAPIResponse = {
    delegates: sortedDelegates,
    stats: {
      total: sortedDelegates.length,
      shadow: sortedDelegates.filter(d => d.status === DelegateStatusEnum.shadow).length,
      recognized: sortedDelegates.filter(d => d.status === DelegateStatusEnum.recognized).length,
      totalMKRDelegated: new BigNumberJS(
        delegates.reduce((prev, next) => {
          const mkrDelegated = new BigNumberJS(next.mkrDelegated);
          return prev.plus(mkrDelegated);
        }, new BigNumberJS(0))
      ).toString(),
      totalDelegators: delegationHistory.filter(d => parseFloat(d.lockAmount) > 0).length
    }
  };

  return delegatesResponse;
}
