import { limitString } from 'lib/string';
import { formatAddress } from 'lib/utils';
import { useActiveWeb3React } from 'modules/web3/hooks/useActiveWeb3React';
import React, { useEffect, useState } from 'react';

export const Address = React.memo(function Address({
  address,
  maxLength
}: {
  address: string;
  maxLength?: number;
}): React.ReactElement {
  const { ENSName } = useActiveWeb3React();
  const [addressFormated, setAddressFormatted] = useState(formatAddress(address || '').toLowerCase());

  useEffect(() => {
    if (address) {
      ENSName ? setAddressFormatted(ENSName) : setAddressFormatted(formatAddress(address).toLowerCase());
    }
  }, [address, ENSName]);

  return (
    <React.Fragment>
      {maxLength ? limitString(addressFormated, maxLength, '...') : addressFormated}
    </React.Fragment>
  );
});
