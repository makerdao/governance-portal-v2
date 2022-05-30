import { limitString } from 'lib/string';
import { formatAddress } from 'lib/utils';
import { getENS } from 'modules/web3/helpers/ens';
import React, { useEffect, useState } from 'react';

export function Address({ address, maxLength }: { address: string; maxLength?: number }): React.ReactElement {
  const [addressFormated, setAddressFormatted] = useState(formatAddress(address || '').toLowerCase());

  async function fetchENSName(address: string) {
    if (!address) {
      return;
    }

    const ens = await getENS(address);

    ens ? setAddressFormatted(ens) : setAddressFormatted(formatAddress(address).toLowerCase());
  }
  useEffect(() => {
    if (address) {
      fetchENSName(address);
    }
  }, [address]);

  return (
    <React.Fragment>
      {maxLength ? limitString(addressFormated, maxLength, '...') : addressFormated}
    </React.Fragment>
  );
}
