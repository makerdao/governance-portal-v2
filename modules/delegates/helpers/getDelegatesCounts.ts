import { SupportedNetworks } from 'modules/web3/constants/networks';
import { AllDelegatesEntry, DelegateRepoInformation } from '../types';
import { add } from 'date-fns';
import { getNewOwnerFromPrevious } from 'modules/migration/delegateAddressLinks';

export default function getDelegatesCounts(
  githubDelegates: DelegateRepoInformation[] | undefined,
  allDelegateAddresses: AllDelegatesEntry[],
  network: SupportedNetworks
): {
  recognizedDelegatesCount: number;
  shadowDelegatesCount: number;
  totalDelegatesCount: number;
} {
  if (!githubDelegates) {
    return {
      recognizedDelegatesCount: 0,
      shadowDelegatesCount: allDelegateAddresses.length,
      totalDelegatesCount: allDelegateAddresses.length
    };
  }

  const allDelegatesWithExpiration = allDelegateAddresses.map(delegate => ({
    ...delegate,
    expired: add(new Date(delegate.blockTimestamp), { years: 1 }) > new Date() ? false : true
  }));

  const contractsPerRecognizedDelegate = githubDelegates
    .map(delegate => {
      let count = 0;
      const foundDelegate = allDelegatesWithExpiration.find(
        del => del.voteDelegate === delegate.voteDelegateAddress.toLowerCase()
      );
      if (foundDelegate) {
        if (!foundDelegate.expired) {
          count++;
        }
        const nextDelegateContract = allDelegatesWithExpiration.find(
          del => del.delegate === getNewOwnerFromPrevious(foundDelegate.delegate, network)
        );
        if (nextDelegateContract && !nextDelegateContract.expired) {
          count++;
        }
      }
      return count;
    })
    .filter(delegate => delegate);

  const recognizedDelegatesCount = contractsPerRecognizedDelegate.length;
  const shadowDelegatesCount =
    allDelegatesWithExpiration.filter(delegate => !delegate.expired).length -
    contractsPerRecognizedDelegate.reduce((prev, next) => prev + next, 0);
  const totalDelegatesCount = recognizedDelegatesCount + shadowDelegatesCount;

  return { recognizedDelegatesCount, shadowDelegatesCount, totalDelegatesCount };
}
