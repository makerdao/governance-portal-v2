export enum DelegateStatus {
    expired = 'expired',
    unrecognized = 'unrecognized',
    active = 'active'
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