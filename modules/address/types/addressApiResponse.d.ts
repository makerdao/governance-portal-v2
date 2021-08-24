import { Delegate } from 'types/delegate';

export type AddressApiResponse = {
  isDelegate: boolean,
  delegateInfo?: Delegate,
  address: string
}