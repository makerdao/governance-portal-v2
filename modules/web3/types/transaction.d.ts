/*

SPDX-FileCopyrightText: © 2023 Dai Foundation <www.daifoundation.org>

SPDX-License-Identifier: AGPL-3.0-or-later

*/

import { Dispatch, SetStateAction } from 'react';
import { SupportedNetworks } from '../constants/networks';

export type TxStatus = 'initialized' | 'pending' | 'mined' | 'error';

export type TXInitialized = {
  from: string;
  status: 'initialized';
  id: string;
  submittedAt: Date;
  message: null | string;
  hash: null;
  error: null;
  errorType: null;
  gaslessNetwork?: SupportedNetworks;
};

export type TXPending = {
  from: string;
  status: 'pending';
  id: string;
  submittedAt: Date;
  message: null | string;
  hash: string;
  error: null;
  errorType: null;
  gaslessNetwork?: SupportedNetworks;
};

export type TXMined = Omit<TXPending, 'status'> & {
  status: 'mined';
};

export type TXError = {
  from: string;
  status: 'error';
  id: string;
  submittedAt: Date;
  message: null | string;
  hash: null | string;
  error: null | string;
  errorType: string;
  gaslessNetwork?: SupportedNetworks;
};

export type Transaction = TXInitialized | TXPending | TXMined | TXError;

export type BaseTransactionResponse = {
  txId: string | null;
  setTxId: Dispatch<SetStateAction<null>>;
  tx: Transaction | null;
};
