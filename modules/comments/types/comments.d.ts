import { BigNumber } from 'ethers';
import { AddressApiResponse } from 'modules/address/types/addressApiResponse';
import { ExecutiveComment } from './executiveComment';

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

export type CommentsAPIResponseItem = {
  comment: ExecutiveComment | PollComment;
  address: AddressApiResponse;
};

export type ParsedExecutiveComments = {
  comment: Omit<ExecutiveComment, 'voterWeight'> & { voterWeight: BigNumber };
  address: AddressApiResponse;
};

export type ExecutiveComment = {
  voterAddress: string;
  hotAddress: string;
  accountType: 'delegate' | 'proxy' | 'normal';
  voterWeight: string;
  comment: string;
  date: Date;
  commentType: 'executive';
  spellAddress: string;
  network: SupportedNetworks;
  txHash?: string;
};

export type ExecutiveCommentFromDB = ExecutiveComment & {
  _id: string;
  commentType: 'executive';
};

export type ExecutiveCommentsRequestBody = {
  voterAddress: string;
  comment: string;
  hotAddress: string;
  signedMessage: string;
  txHash: string;
  addressLockedMKR: string;
};

export type PollComment = {
  voterAddress: string;
  hotAddress: string;
  accountType: 'delegate' | 'proxy' | 'normal';
  comment: string;
  date: Date;
  commentType: 'poll';
  pollId: number;
  network: SupportedNetworks;
  txHash?: string;
};

export type PollCommentFromDB = PollComment & {
  _id: string;
  commentType: 'poll';
};

export type PollsCommentsRequestBody = {
  voterAddress: string;
  hotAddress: string;
  comments: Partial<PollComment>[];
  signedMessage: string;
  txHash: string;
};

export type PollCommentWithWeight = PollComment & {
  voterWeight: BigNumber;
};

export type CommentFromDB = PollCommentFromDB | ExecutiveCommentFromDB;
