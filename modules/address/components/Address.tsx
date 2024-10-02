/*

SPDX-FileCopyrightText: © 2023 Dai Foundation <www.daifoundation.org>

SPDX-License-Identifier: AGPL-3.0-or-later

*/

import { limitString } from 'lib/string';
import { formatAddress } from 'lib/utils';
import { getENS } from 'modules/web3/helpers/ens';
import React, { useEffect, useState } from 'react';
import { getDefaultProvider } from 'modules/web3/helpers/getDefaultProvider';
import { SupportedNetworks } from 'modules/web3/constants/networks';

export const Address = React.memo(function Address({
  address,
  maxLength
}: {
  address: string;
  maxLength?: number;
}): React.ReactElement {
  const [addressFormated, setAddressFormatted] = useState(formatAddress(address || '').toLowerCase());

  async function fetchENSName() {
    if (!address) {
      return;
    }

    const provider = getDefaultProvider(SupportedNetworks.MAINNET);
    const ens = await getENS({ address, provider: provider });

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
