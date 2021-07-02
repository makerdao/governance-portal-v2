import { getChainDelegates } from 'lib/api';
import { Delegate, DelegateContractInformation, DelegateRepoInformation } from 'types/delegate';
import { DelegateStatusEnum } from './constants';
import { fetchGithubDelegate, fetchGithubDelegates } from './fetchGithubDelegates';

const millisecondsYear = 1000 * 60 * 60 * 24 * 365;

function mergeDelegateInfo(
  onChainDelegate: DelegateContractInformation,
  githubDelegate?: DelegateRepoInformation
): Delegate {
  // check if contract is expired to assing the status
  const isExpired = onChainDelegate.expirationDate.getTime() < Date.now();

  return {
    voteDelegateAddress: onChainDelegate.voteDelegateAddress,
    delegateAddress: onChainDelegate.delegateAddress,
    status: githubDelegate ? DelegateStatusEnum.active : DelegateStatusEnum.unrecognized,
    expired: isExpired,
    expirationDate: onChainDelegate.expirationDate,
    description: githubDelegate?.description || '',
    name: githubDelegate?.name || '',
    picture: githubDelegate?.picture || '',
    id: onChainDelegate.voteDelegateAddress,
    lastVote: new Date() // TODO: See where to get this info
  };
}

// Returns info for one delegate mixing onchain and repo info
export async function fetchDelegate(voteDelegateAddress: string): Promise<Delegate | undefined> {
  const onChainDelegates = await getChainDelegates();
  const onChainDelegate = onChainDelegates.find(i => i.voteDelegateAddress === voteDelegateAddress);

  if (!onChainDelegate) {
    return Promise.resolve(undefined);
  }

  const { data: githubDelegate } = await fetchGithubDelegate(voteDelegateAddress);

  return mergeDelegateInfo(onChainDelegate, githubDelegate);
}

// Returns a list of delegates, mixin onchain and repo information
export async function fetchDelegates(): Promise<Delegate[]> {
  const { data: gitHubDelegates } = await fetchGithubDelegates();
  const onChainDelegates = await getChainDelegates();

  // Map all the raw delegates info and map it to Delegate structure with the github info
  const delegates: Delegate[] = onChainDelegates.map(onChainDelegate => {
    const githubDelegate = gitHubDelegates
      ? gitHubDelegates.find(i => i.voteDelegateAddress === onChainDelegate.voteDelegateAddress)
      : undefined;

    return mergeDelegateInfo(onChainDelegate, githubDelegate);
  });

  return Promise.resolve(delegates);
}
