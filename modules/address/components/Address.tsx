import { formatAddress } from 'lib/utils';
import { getENS } from 'modules/web3/ens';
import React, { useEffect, useState } from 'react';

export function Address({ address } : { address : string }): React.ReactElement {
  const [addressFormated, setAddressFormatted] = useState(formatAddress(address || ''));

  async function fetchENSName(address: string) {
    try {
      if (!address) {
        return;
      }

      const ens = await getENS(address);
      setAddressFormatted(ens);
    } catch (e) {
      setAddressFormatted(formatAddress(address));
    }
  }

  useEffect(() => {
    if (address) {
      fetchENSName(address);
    }
  }, [address]);

    return (
        <React.Fragment>
          {addressFormated}
        </React.Fragment>
    );
}