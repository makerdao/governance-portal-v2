export type DelegateStatus = 'active' | 'expired' | 'unrecognized';

export type Delegate = {
  id: string;
  name: string;
  address: string;
  owner: string;
  description: string;
  picture: string;
  status: DelegateStatus;
  lastVote: Date;
  contractExpireDate: Date;
};
