import { limitString } from 'lib/string';
import { formatAddress } from 'lib/utils';
import { getENS } from 'modules/web3/helpers/ens';
import { useActiveWeb3React } from 'modules/web3/hooks/useActiveWeb3React';
import React, { useEffect, useState } from 'react';

export const Address = React.memo(function Address({
  address,
  maxLength
}: {
  address: string;
  maxLength?: number;
}): React.ReactElement {
  const { library } = useActiveWeb3React();
  const [addressFormated, setAddressFormatted] = useState(formatAddress(address || '').toLowerCase());

  async function fetchENSName() {
    if (!address || !library) {
      return;
    }

    const ens = await getENS({ address, library });

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
