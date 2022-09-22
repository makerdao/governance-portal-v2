import { getMessageFromCode, ERROR_CODES } from 'eth-rpc-errors';
import { MIN_MKR_REQUIRED_FOR_GASLESS_VOTING } from '../polling.constants';

export const API_VOTE_ERRORS = {
  VOTER_MUST_BE_STRING: 'Voter must be a string.',
  POLLIDS_MUST_BE_ARRAY_NUMBERS: 'PollIds must be an array of numbers.',
  OPTIONIDS_MUST_BE_ARRAY_NUMBERS: 'OptionIds must be an array of numbers.',
  NONCE_MUST_BE_NUMBER: 'Nonce must be a number.',
  EXPIRY_MUST_BE_NUMBER: 'Expiry must be a number.',
  SIGNATURE_MUST_BE_STRING: 'Signature must be a string.',
  INVALID_NETWORK: 'Invalid network.',
  WRONG_SECRET: 'Wrong secret.',
  INVALID_NONCE_FOR_ADDRESS: 'Invalid nonce for address.',
  EXPIRED_VOTES: 'Expiration date already passed.',
  EXPIRED_POLLS: 'Can only vote in active polls.',
  RATE_LIMITED: 'Address cannot use gasless service more than once per 10 minutes.',
  VOTER_AND_SIGNER_DIFFER: 'Voter address could not be recovered from signature.',
  LESS_THAN_MINIMUM_MKR_REQUIRED: `Address must have a poll voting weight of at least ${MIN_MKR_REQUIRED_FOR_GASLESS_VOTING.toString()}.`,
  ALREADY_VOTED_IN_POLL: 'Address has already voted in this poll.'
};

export const parseError = (error: Error): string | undefined => {
  // First check if it's a Metamask error
  if (
    'code' in error &&
    [...Object.values(ERROR_CODES.provider), ...Object.values(ERROR_CODES.rpc)].includes(error['code'])
  ) {
    return getMessageFromCode(error['code']);
  }
  // If not, return one of our errors
  return Object.values(API_VOTE_ERRORS).find(message => error.message?.indexOf(message) !== -1);
};
