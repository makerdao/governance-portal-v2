export const TX_NOT_ENOUGH_FUNDS = `sender doesn't have enough funds to send tx`;

export function parseTxError(_error) {
  const error = _error.message ? _error.message : _error;
  if (error.includes(`sender doesn't have enough funds to send tx`)) {
    return `sender doesn't have enough funds to send tx`;
  }
}
