export type DelegateStatus = 'active' | 'expired' | 'unrecognized';

export type DelegateRepoInformation = {
    address: string;
    picture: string;
    name: string;
    externalUrl: string;
    description: string;
}

export type Delegate = {
    id: string;
    name: string;
    address: string;
    description: string;
    picture: string;
    status: DelegateStatus,
    lastVote: Date,
    contractExpireDate: Date
}