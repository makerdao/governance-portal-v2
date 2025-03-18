import { SimulateContractErrorType, WriteContractReturnType } from 'viem';

export type WriteHookParams = {
  onStart?: (hash: string) => void;
  onSuccess?: (hash: string) => void;
  onError?: (error: Error, hash: string) => void;
  enabled?: boolean;
  gas?: bigint;
};

export type WriteHook = {
  data: WriteContractReturnType | undefined;
  error: Error | null;
  isLoading: boolean;
  execute: () => void;
  retryPrepare: () => void;
  prepareError: Error | SimulateContractErrorType | null;
  prepared: boolean;
};
