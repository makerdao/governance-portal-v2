import { Delegate, DelegateOnchainInformation, DelegateRepoInformation } from '../../types/delegate';
import { DelegateStatusEnum } from './constants';
import { fetchGithubDelegate, fetchGithubDelegates } from './fetchGithubDelegates';

// TODO: Fetch onchain

const millisecondsMonth = 1000 * 60 * 60 * 24 * 31;

const onChainDelegates: DelegateOnchainInformation[] = [
  {
    address: '0x889bA247C9C768ca0047db8804c03011E06eE6B3',
    owner: '0x16Fb96a5fa0427Af0C8F7cF1eB4870231c8154B6',
    expirationDate: new Date(Date.now() + millisecondsMonth * 3)
  },
  {
    address: '0x0000000000000000000000000000000000000000',
    owner: '0x0000000000000000000000000000000000000000',
    expirationDate: new Date(Date.now() + millisecondsMonth * 3)
  },
  {
    address: '0x8200000000033434000000000000000000000000',
    owner: '0x8200000000033434000000000000000000000000',
    expirationDate: new Date(Date.now() + millisecondsMonth * 4)
  },
  {
    address: '0x5600000000033434033444450000000000000000',
    owner: '0x5600000000033434033444450000000000000000',
    expirationDate: new Date(Date.now() - millisecondsMonth * 3)
  }
];

function mergeDelegateInformaation(
  onChainDelegate: DelegateOnchainInformation,
  githubDelegate?: DelegateRepoInformation
): Delegate {
  // Check if contract is expired to assing the status
  const isExpired = onChainDelegate.expirationDate.getTime() < Date.now();

  return {
    address: onChainDelegate.address,
    owner: onChainDelegate.owner,
    status: githubDelegate ? DelegateStatusEnum.active : DelegateStatusEnum.unrecognized,
    expired: isExpired,
    contractExpireDate: onChainDelegate.expirationDate,
    description: githubDelegate?.description || '',
    name: githubDelegate?.name || '',
    picture: githubDelegate?.picture || '',
    id: onChainDelegate.address,
    lastVote: new Date() // TODO: See where to get this info
  };
}

// Returns info for one delegate mixing onchain and repo info
export async function fetchDelegate(address: string): Promise<Delegate | undefined> {
  const onChainDelegate = onChainDelegates.find(i => i.address === address);

  if (!onChainDelegate) {
    return Promise.resolve(undefined);
  }

  const { data: githubDelegate } = await fetchGithubDelegate(address);

  return mergeDelegateInformaation(onChainDelegate, githubDelegate);
}

// Returns a list of delegates, mixin onchain and repo information
export async function fetchDelegates(): Promise<Delegate[]> {
  const { data: gitHubDelegates } = await fetchGithubDelegates();

  // Map all the raw delegates info and map it to Delegate structure with the github info
  const delegates: Delegate[] = onChainDelegates.map(onChainDelegate => {
    const githubDelegate = gitHubDelegates
      ? gitHubDelegates.find(i => i.address === onChainDelegate.address)
      : undefined;

    return mergeDelegateInformaation(onChainDelegate, githubDelegate);
  });

  return Promise.resolve(delegates);
}
