import { MakerClass } from '@makerdao/dai/dist/Maker';
import oldVoteProxyFactoryAbi from 'lib/abis/oldVoteProxyFactoryAbi.json';
import { oldVoteProxyFactoryAddress } from 'lib/constants';
import { SupportedNetworks } from 'modules/web3/web3.constants';
import { ZERO_ADDRESS } from 'modules/app/constants';

export const getOldProxyStatus = async (
  address: string,
  maker: MakerClass,
  network: SupportedNetworks
): Promise<{
  role: string;
  address: string;
}> => {
  if (network === SupportedNetworks.GOERLI) {
    return { role: '', address: '' };
  }
  try {
    const oldFactory = maker
      .service('smartContract')
      .getContractByAddressAndAbi(oldVoteProxyFactoryAddress[network], oldVoteProxyFactoryAbi);
    const [proxyAddressCold, proxyAddressHot] = await Promise.all([
      oldFactory.coldMap(address),
      oldFactory.hotMap(address)
    ]);
    if (proxyAddressCold !== ZERO_ADDRESS) return { role: 'cold', address: proxyAddressCold };
    if (proxyAddressHot !== ZERO_ADDRESS) return { role: 'hot', address: proxyAddressHot };
  } catch (err) {
    console.log(err);
  }
  return { role: '', address: '' };
};
