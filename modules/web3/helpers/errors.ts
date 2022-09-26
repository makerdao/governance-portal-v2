import { getMessageFromCode, ERROR_CODES } from 'eth-rpc-errors';

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
    [...Object.values(ERROR_CODES.provider), ...Object.values(ERROR_CODES.rpc)].includes(error['code'])
  ) {
    const extracted = getMessageFromCode(error['code']);
    if (extracted) {
      return extracted;
    }
  }

  return message;
}
