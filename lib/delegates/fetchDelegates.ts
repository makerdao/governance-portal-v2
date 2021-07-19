import { fetchChainDelegates } from './fetchChainDelegates';
import { Delegate, DelegateContractInformation, DelegateRepoInformation } from 'types/delegate';
import { DelegateStatusEnum } from './constants';
import { fetchGithubDelegate, fetchGithubDelegates } from './fetchGithubDelegates';
import moment from 'moment';
import { SupportedNetworks } from 'lib/constants';
import { getNetwork } from 'lib/maker';

function mergeDelegateInfo(
  onChainDelegate: DelegateContractInformation,
  githubDelegate?: DelegateRepoInformation
): Delegate {
  // check if contract is expired to assing the status
  const expirationDate = moment(onChainDelegate.blockTimestamp).add(365, 'days');
  const isExpired = expirationDate.isBefore(moment());

  return {
    voteDelegateAddress: onChainDelegate.voteDelegateAddress,
    address: onChainDelegate.address,
    status: githubDelegate ? DelegateStatusEnum.active : DelegateStatusEnum.unrecognized,
    expired: isExpired,
    expirationDate: expirationDate.toDate(),
    description: githubDelegate?.description || '',
    name: githubDelegate?.name || '',
    picture: githubDelegate?.picture || '',
    id: onChainDelegate.voteDelegateAddress,
    externalUrl: githubDelegate?.externalUrl,
    lastVote: new Date() // TODO: See where to get this info
  };
}

// Returns info for one delegate mixing onchain and repo info
export async function fetchDelegate(
  voteDelegateAddress: string,
  network?: SupportedNetworks
): Promise<Delegate | undefined> {
  const currentNetwork = network ? network : getNetwork();

  const onChainDelegates = await fetchChainDelegates(currentNetwork);
  const onChainDelegate = onChainDelegates.find(i => i.voteDelegateAddress === voteDelegateAddress);

  if (!onChainDelegate) {
    return Promise.resolve(undefined);
  }

  const { data: githubDelegate } = await fetchGithubDelegate(voteDelegateAddress, currentNetwork);

  return mergeDelegateInfo(onChainDelegate, githubDelegate);
}

// Returns a list of delegates, mixin onchain and repo information
export async function fetchDelegates(network?: SupportedNetworks): Promise<Delegate[]> {
  const currentNetwork = network ? network : getNetwork();

  const { data: gitHubDelegates } = await fetchGithubDelegates(currentNetwork);

  const onChainDelegates = await fetchChainDelegates(currentNetwork);

  // Map all the raw delegates info and map it to Delegate structure with the github info
  const delegates: Delegate[] = onChainDelegates.map(onChainDelegate => {
    const githubDelegate = gitHubDelegates
      ? gitHubDelegates.find(i => i.voteDelegateAddress === onChainDelegate.voteDelegateAddress)
      : undefined;

    return mergeDelegateInfo(onChainDelegate, githubDelegate);
  });
  return Promise.resolve(delegates);
}
