import { fetchChainDelegates } from './fetchChainDelegates';
import { DelegateStatusEnum } from 'modules/delegates/delegates.constants';
import { fetchGithubDelegate, fetchGithubDelegates } from './fetchGithubDelegates';
import { add, isBefore } from 'date-fns';
import { SupportedNetworks } from 'modules/web3/constants/networks';
import { getNetwork } from 'lib/maker';
import {
  DelegatesAPIResponse,
  Delegate,
  DelegateContractInformation,
  DelegateRepoInformation
} from 'modules/delegates/types';

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
    name: githubDelegate?.name || '',
    picture: githubDelegate?.picture || '',
    id: onChainDelegate.voteDelegateAddress,
    externalUrl: githubDelegate?.externalUrl,
    lastVote: null,
    communication: githubDelegate?.communication,
    combinedParticipation: githubDelegate?.combinedParticipation,
    pollParticipation: githubDelegate?.pollParticipation,
    executiveParticipation: githubDelegate?.executiveParticipation,
    mkrDelegated: onChainDelegate.mkrDelegated
  };
}

// Returns info for one delegate mixing onchain and repo info
export async function fetchDelegate(
  voteDelegateAddress: string,
  network?: SupportedNetworks
): Promise<Delegate | undefined> {
  const currentNetwork = network ? network : getNetwork();

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

// Returns a list of delegates, mixin onchain and repo information
export async function fetchDelegates(network?: SupportedNetworks): Promise<DelegatesAPIResponse> {
  const currentNetwork = network ? network : getNetwork();

  const { data: gitHubDelegates } = await fetchGithubDelegates(currentNetwork);

  const onChainDelegates = await fetchChainDelegates(currentNetwork);

  // Map all the raw delegates info and map it to Delegate structure with the github info
  const delegates: Delegate[] = onChainDelegates.map(onChainDelegate => {
    const githubDelegate = gitHubDelegates
      ? gitHubDelegates.find(
          i => i.voteDelegateAddress.toLowerCase() === onChainDelegate.voteDelegateAddress.toLowerCase()
        )
      : undefined;

    return mergeDelegateInfo(onChainDelegate, githubDelegate);
  });

  const delegatesResponse: DelegatesAPIResponse = {
    delegates,
    stats: {
      total: delegates.length,
      shadow: delegates.filter(d => d.status === DelegateStatusEnum.shadow).length,
      recognized: delegates.filter(d => d.status === DelegateStatusEnum.recognized).length,
      totalMKRDelegated: delegates.reduce((prev, next) => prev + next.mkrDelegated, 0)
    }
  };

  return delegatesResponse;
}
