/*

SPDX-FileCopyrightText: © 2023 Dai Foundation <www.daifoundation.org>

SPDX-License-Identifier: AGPL-3.0-or-later

*/

import { getMessageFromCode, errorCodes } from 'eth-rpc-errors';
import { WaitForTransactionReceiptErrorType } from 'viem';

export const TX_NOT_ENOUGH_FUNDS = "Sender doesn't have enough funds to send the transaction";
export const USER_REJECTED = 'User rejected the transaction';

export function parseTxError(error: Error): string {
  const defaultError = 'Something went wrong with your transaction.';

  const message = error.message ? error.message : defaultError;
  if (message.includes("sender doesn't have enough funds to send tx")) {
    return TX_NOT_ENOUGH_FUNDS;
  }

  if (message.includes('user rejected transaction')) {
    return USER_REJECTED;
  }

  // First check if it's a Metamask error
  if (
    error['code'] &&
    [...Object.values(errorCodes.provider), ...Object.values(errorCodes.rpc)].includes(error['code'])
  ) {
    const extracted = getMessageFromCode(error['code']);
    if (extracted) {
      return extracted;
    }
  }

  return message;
}

export function isRevertedError(failureReason: WaitForTransactionReceiptErrorType | null): boolean {
  if (
    failureReason?.toString().toLowerCase().includes('revert') ||
    failureReason?.toString().toLowerCase().includes('execution')
  ) {
    return true;
  }
  return false;
}
