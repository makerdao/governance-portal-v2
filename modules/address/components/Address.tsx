/*

SPDX-FileCopyrightText: © 2023 Dai Foundation <www.daifoundation.org>

SPDX-License-Identifier: AGPL-3.0-or-later

*/

import { limitString } from 'lib/string';
import { formatAddress } from 'lib/utils';
import { getENS } from 'modules/web3/helpers/ens';
import React, { useEffect, useState } from 'react';
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

    const ens = await getENS({ address, network: SupportedNetworks.MAINNET });

    ens ? setAddressFormatted(ens) : setAddressFormatted(formatAddress(address).toLowerCase());
  }
  useEffect(() => {
    if (address) {
      fetchENSName();
    }
  }, [address]);

  return <>{maxLength ? limitString(addressFormated, maxLength, '...') : addressFormated}</>;
});
