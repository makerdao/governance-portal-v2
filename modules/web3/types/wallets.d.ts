/*

SPDX-FileCopyrightText: © 2023 Dai Foundation <www.daifoundation.org>

SPDX-License-Identifier: AGPL-3.0-or-later

*/

import { WalletName, ConnectionType } from 'modules/web3/constants/wallets';

export interface WalletInfo {
  connectionType: ConnectionType;
  name: WalletName;
  deeplinkUri?: string;
}
