// example format of valid id is '8db50a7a-2b07-413d-bad3-cc72e815c8fc'
export const isValidRelayerTxIdParam = (txId: string): boolean => {
  return !!txId && txId.length === 36 && txId.split('-').length === 5;
};
