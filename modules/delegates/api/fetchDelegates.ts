import { fetchChainDelegates } from './fetchChainDelegates';
import { DelegateStatusEnum } from 'modules/delegates/delegates.constants';
import { fetchGithubDelegate, fetchGithubDelegates } from './fetchGithubDelegates';
import { add, isBefore } from 'date-fns';
import { BigNumber as BigNumberJS } from 'bignumber.js';
import { DEFAULT_NETWORK, SupportedNetworks } from 'modules/web3/constants/networks';
import {
  DelegatesAPIResponse,
  Delegate,
  DelegateContractInformation,
  DelegateRepoInformation
} from 'modules/delegates/types';
import { getExecutiveProposals } from 'modules/executive/api/fetchExecutives';
import { getContracts } from 'modules/web3/helpers/getContracts';
import { networkNameToChainId } from 'modules/web3/helpers/chain';
import { ZERO_SLATE_HASH } from 'modules/executive/helpers/zeroSlateHash';
import { getSlateAddresses } from 'modules/executive/helpers/getSlateAddresses';
import { CMSProposal } from 'modules/executive/types';
import { fetchAddressPollVoteHistory } from 'modules/polling/api/fetchAddressPollVoteHistory';

function mergeDelegateInfo(
  onChainDelegate: DelegateContractInformation,
  githubDelegate?: DelegateRepoInformation
): Delegate {
  // check if contract is expired to assing the status
  const expirationDate = add(new Date(onChainDelegate.blockTimestamp), { years: 1 });
  const isExpired = isBefore(new Date(expirationDate), new Date());

  return {
    voteDelegateAddress: onChainDelegate.voteDelegateAddress,
    address: onChainDelegate.address,
    status: githubDelegate ? DelegateStatusEnum.recognized : DelegateStatusEnum.shadow,
    expired: isExpired,
    expirationDate,
    description: githubDelegate?.description || '',
    name: githubDelegate?.name || 'Shadow Delegate',
    picture: githubDelegate?.picture || '',
    id: onChainDelegate.voteDelegateAddress,
    externalUrl: githubDelegate?.externalUrl,
    lastVote: null,
    communication: githubDelegate?.communication,
    combinedParticipation: githubDelegate?.combinedParticipation,
    pollParticipation: githubDelegate?.pollParticipation,
    executiveParticipation: githubDelegate?.executiveParticipation,
    disclosures: githubDelegate?.disclosures,
    mkrDelegated: onChainDelegate.mkrDelegated,
    proposalsSupported: onChainDelegate.proposalsSupported,
    execSupported: onChainDelegate.execSupported,
    pollVoteHistory: onChainDelegate.pollVoteHistory
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

  const { data: githubDelegate } = await fetchGithubDelegate(voteDelegateAddress, currentNetwork);

  return mergeDelegateInfo(onChainDelegate, githubDelegate);
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

    return mergeDelegateInfo(onChainDelegate, githubDelegate);
  });

  return mergedDelegates;
}

// Returns a list of delegates, mixin onchain and repo information
export async function fetchDelegates(network?: SupportedNetworks): Promise<DelegatesAPIResponse> {
  const currentNetwork = network ? network : DEFAULT_NETWORK.network;

  const delegatesInfo = await fetchDelegatesInformation(currentNetwork);

  const contracts = getContracts(networkNameToChainId(currentNetwork));
  const executives = await getExecutiveProposals(0, 10, currentNetwork);
  const delegates = await Promise.all(
    delegatesInfo.map(async delegate => {
      const votedSlate = await contracts.chief.votes(delegate.voteDelegateAddress);
      const votedProposals =
        votedSlate !== ZERO_SLATE_HASH ? await getSlateAddresses(contracts.chief, votedSlate) : [];
      const proposalsSupported: number = votedProposals?.length || 0;
      const execSupported: CMSProposal | undefined = executives?.find(proposal =>
        votedProposals?.find(vp => vp.toLowerCase() === proposal?.address?.toLowerCase())
      );
      const pollVoteHistory = await fetchAddressPollVoteHistory(delegate.voteDelegateAddress, currentNetwork);
      return {
        ...delegate,
        proposalsSupported,
        execSupported,
        pollVoteHistory
      };
    })
  );

  const delegatesResponse: DelegatesAPIResponse = {
    delegates,
    stats: {
      total: delegates.length,
      shadow: delegates.filter(d => d.status === DelegateStatusEnum.shadow).length,
      recognized: delegates.filter(d => d.status === DelegateStatusEnum.recognized).length,
      totalMKRDelegated: new BigNumberJS(
        delegates.reduce((prev, next) => {
          const mkrDelegated = new BigNumberJS(next.mkrDelegated);
          return prev.plus(mkrDelegated);
        }, new BigNumberJS(0))
      ).toString()
    }
  };

  return delegatesResponse;
}
