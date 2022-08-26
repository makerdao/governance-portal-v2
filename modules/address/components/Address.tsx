import { limitString } from 'lib/string';
import { formatAddress } from 'lib/utils';
import { useWeb3 } from 'modules/web3/hooks/useWeb3';
import { getENS } from 'modules/web3/helpers/ens';
import React, { useEffect, useState } from 'react';

export const Address = React.memo(function Address({
  address,
  maxLength
}: {
  address: string;
  maxLength?: number;
}): React.ReactElement {
  const { provider } = useWeb3();
  const [addressFormated, setAddressFormatted] = useState(formatAddress(address || '').toLowerCase());

  async function fetchENSName() {
    if (!address || !provider) {
      return;
    }

    const ens = await getENS({ address, provider });

    ens ? setAddressFormatted(ens) : setAddressFormatted(formatAddress(address).toLowerCase());
  }
  useEffect(() => {
    if (address) {
      fetchENSName();
    }
  }, [address]);

  return (
    <React.Fragment>
      {maxLength ? limitString(addressFormated, maxLength, '...') : addressFormated}
    </React.Fragment>
  );
});
