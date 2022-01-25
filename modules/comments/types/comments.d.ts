import BigNumber from 'bignumber.js';
import { AddressApiResponse } from 'modules/address/types/addressApiResponse';
import { ExecutiveComment } from './executiveComment';
import { PollComment, PollCommentWithWeight } from './pollComments';

export type PollCommentsAPIResponseItem = {
  comment: PollComment;
  address: AddressApiResponse;
};

export type PollCommentsAPIResponseItemWithWeight = {
  comment: PollCommentWithWeight;
  address: AddressApiResponse;
};

export type ExecutiveCommentsAPIResponseItem = {
  comment: ExecutiveComment;
  address: AddressApiResponse;
};

export type ParsedExecutiveComments = {
  comment: Omit<ExecutiveComment, 'voterWeight'> & { voterWeight: BigNumber };
  address: AddressApiResponse;
};
