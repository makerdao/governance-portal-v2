/*

SPDX-FileCopyrightText: © 2023 Dai Foundation <www.daifoundation.org>

SPDX-License-Identifier: AGPL-3.0-or-later

*/
import { createMocks, RequestMethod } from 'node-mocks-http';
import type { NextApiRequest, NextApiResponse } from 'next';
import voteAPIHandler, { API_VOTE_ERRORS } from '../vote';
import { SupportedNetworks } from 'modules/web3/constants/networks';
import { getArbitrumPollingContractRelayProvider } from 'modules/polling/api/getArbitrumPollingContractRelayProvider';
import { getMKRVotingWeight } from 'modules/mkr/helpers/getMKRVotingWeight';
import { cacheGet, cacheSet } from 'modules/cache/cache';
import { getActivePollIds } from 'modules/polling/api/fetchPolls';
import { parseEther } from 'viem';
import { recentlyUsedGaslessVotingCheck } from 'modules/polling/helpers/recentlyUsedGaslessVotingCheck';
import { fetchAddressPollVoteHistory } from 'modules/polling/api/fetchAddressPollVoteHistory';
import { postRequestToDiscord } from 'modules/app/api/postRequestToDiscord';
import { getDelegateContractAddress } from 'modules/delegates/helpers/getDelegateContractAddress';
import { verifyTypedSignature } from 'modules/web3/helpers/verifyTypedSignature';
import { Mock, vi } from 'vitest';
import { getGaslessPublicClient } from 'modules/web3/helpers/getPublicClient';

vi.mock('modules/web3/helpers/getPublicClient');
vi.mock('modules/polling/api/getArbitrumPollingContractRelayProvider');
vi.mock('modules/mkr/helpers/getMKRVotingWeight');
vi.mock('modules/cache/cache');
vi.mock('modules/polling/api/fetchPolls');
vi.mock('modules/web3/helpers/verifyTypedSignature');
vi.mock('modules/polling/helpers/recentlyUsedGaslessVotingCheck');
vi.mock('modules/polling/api/fetchAddressPollVoteHistory');
vi.mock('modules/app/api/postRequestToDiscord');
vi.mock('modules/delegates/helpers/getDelegateContractAddress');

describe('/api/polling/vote API Endpoint', () => {
  const publicClientMockResponses = vi.fn().mockImplementation(({ functionName }) => {
    if (functionName === 'nonces') return Promise.resolve(3n);
  });

  beforeAll(() => {
    (getGaslessPublicClient as Mock).mockReturnValue({
      readContract: publicClientMockResponses
    });
    (getArbitrumPollingContractRelayProvider as Mock).mockReturnValue({
      vote: () => Promise.resolve(null),
      'vote(address,uint256,uint256,uint256[],uint256[],uint8,bytes32,bytes32)': () => Promise.resolve(null)
    });
    (cacheSet as Mock).mockImplementation(() => null);
    (fetchAddressPollVoteHistory as Mock).mockImplementation(() => Promise.resolve([]));
    (postRequestToDiscord as Mock).mockImplementation(() => Promise.resolve());
    (getDelegateContractAddress as Mock).mockImplementation(() => Promise.resolve(undefined));
  });
  function mockRequestResponse(method: RequestMethod = 'POST', body) {
    const { req, res }: { req: NextApiRequest; res: NextApiResponse } = createMocks({ method });
    req.headers = {
      'Content-Type': 'application/json'
    };
    req.body = body;
    return { req, res };
  }

  it('return 400 if voter is missing', async () => {
    const { req, res } = mockRequestResponse('POST', {
      voter: ''
    });
    await voteAPIHandler(req, res);

    expect(res.statusCode).toBe(400);
    expect(res._getJSONData()).toEqual({
      error: { code: 'invalid_request', message: API_VOTE_ERRORS.VOTER_MUST_BE_STRING }
    });
    // expect(res.getHeaders()).toEqual({ 'content-type': 'application/json' });
    expect(res.statusMessage).toEqual('OK');
  });

  it('return 400 if pollIds is not an array of integers', async () => {
    const { req, res } = mockRequestResponse('POST', {
      voter: '0xf6c28eC4f4f8E6C712d9242a1Ff7F9e82BeC964F',
      pollIds: '123'
    });
    await voteAPIHandler(req, res);

    expect(res.statusCode).toBe(400);
    expect(res._getJSONData()).toEqual({
      error: { code: 'invalid_request', message: API_VOTE_ERRORS.POLLIDS_MUST_BE_ARRAY_NUMBERS }
    });
  });

  it('return 400 if optionIds is not an array of integers', async () => {
    const { req, res } = mockRequestResponse('POST', {
      voter: '0xf6c28eC4f4f8E6C712d9242a1Ff7F9e82BeC964F',
      pollIds: [1, 2],
      optionIds: '123'
    });
    await voteAPIHandler(req, res);

    expect(res.statusCode).toBe(400);
    expect(res._getJSONData()).toEqual({
      error: { code: 'invalid_request', message: API_VOTE_ERRORS.OPTIONIDS_MUST_BE_ARRAY_NUMBERS }
    });
  });

  it('return 400 if nonce is not a number', async () => {
    const { req, res } = mockRequestResponse('POST', {
      voter: '0xf6c28eC4f4f8E6C712d9242a1Ff7F9e82BeC964F',
      pollIds: [1, 2],
      optionIds: [1, 2, 3],
      nonce: 'ab'
    });
    await voteAPIHandler(req, res);

    expect(res.statusCode).toBe(400);
    expect(res._getJSONData()).toEqual({
      error: { code: 'invalid_request', message: API_VOTE_ERRORS.NONCE_MUST_BE_NUMBER }
    });
  });

  it('return 400 if expiry is not a number', async () => {
    const { req, res } = mockRequestResponse('POST', {
      voter: '0xf6c28eC4f4f8E6C712d9242a1Ff7F9e82BeC964F',
      pollIds: [1, 2],
      optionIds: [1, 2, 3],
      nonce: 1,
      expiry: 'asd'
    });
    await voteAPIHandler(req, res);

    expect(res.statusCode).toBe(400);
    expect(res._getJSONData()).toEqual({
      error: { code: 'invalid_request', message: API_VOTE_ERRORS.EXPIRY_MUST_BE_NUMBER }
    });
  });

  it('return 400 if expired', async () => {
    const { req, res } = mockRequestResponse('POST', {
      voter: '0xf6c28eC4f4f8E6C712d9242a1Ff7F9e82BeC964F',
      pollIds: [1, 2],
      optionIds: [1, 2, 3],
      nonce: 1,
      expiry: (Date.now() - 200) / 1000
    });
    await voteAPIHandler(req, res);

    expect(res.statusCode).toBe(400);
    expect(res._getJSONData()).toEqual({
      error: { code: 'invalid_request', message: API_VOTE_ERRORS.EXPIRED_VOTES }
    });
  });

  it('return 400 if signature is not a string', async () => {
    const { req, res } = mockRequestResponse('POST', {
      voter: '0xf6c28eC4f4f8E6C712d9242a1Ff7F9e82BeC964F',
      pollIds: [1, 2],
      optionIds: [1, 2, 3],
      nonce: 1,
      expiry: (Date.now() + 200) / 1000,
      signature: 2
    });
    await voteAPIHandler(req, res);

    expect(res.statusCode).toBe(400);
    expect(res._getJSONData()).toEqual({
      error: { code: 'invalid_request', message: API_VOTE_ERRORS.SIGNATURE_MUST_BE_STRING }
    });
  });

  it('return 400 if network is not valid', async () => {
    const { req, res } = mockRequestResponse('POST', {
      voter: '0xf6c28eC4f4f8E6C712d9242a1Ff7F9e82BeC964F',
      pollIds: [1, 2],
      optionIds: [1, 2, 3],
      nonce: 1,
      expiry: (Date.now() + 200) / 1000,
      signature: '2'
    });
    await voteAPIHandler(req, res);

    expect(res.statusCode).toBe(400);
    expect(res._getJSONData()).toEqual({
      error: { code: 'invalid_request', message: API_VOTE_ERRORS.INVALID_NETWORK }
    });
  });

  it('return 400 if nonce is not valid', async () => {
    const { req, res } = mockRequestResponse('POST', {
      voter: '0xf6c28eC4f4f8E6C712d9242a1Ff7F9e82BeC964F',
      pollIds: [1, 2],
      optionIds: [1, 2, 3],
      nonce: 1,
      expiry: (Date.now() + 200) / 1000,
      signature: '2',
      network: SupportedNetworks.MAINNET
    });

    await voteAPIHandler(req, res);

    expect(res.statusCode).toBe(400);
    expect(res._getJSONData()).toEqual({
      error: { code: 'invalid_request', message: API_VOTE_ERRORS.INVALID_NONCE_FOR_ADDRESS }
    });
  });

  it('return 400 if MKR amount is not valid', async () => {
    (cacheGet as Mock).mockReturnValue(Promise.resolve(null));
    (getMKRVotingWeight as Mock).mockReturnValue(
      Promise.resolve({
        total: 0n
      })
    );
    const { req, res } = mockRequestResponse('POST', {
      voter: '0x999999cf1046e68e36E1aA2E0E07105eDDD1f08E',
      pollIds: [1, 2],
      optionIds: [1, 2, 3],
      nonce: 3,
      expiry: (Date.now() + 200) / 1000,
      signature: '2',
      network: SupportedNetworks.MAINNET
    });

    (verifyTypedSignature as Mock).mockReturnValue(true);
    await voteAPIHandler(req, res);

    expect(res.statusCode).toBe(400);
    expect(res._getJSONData()).toEqual({
      error: { code: 'invalid_request', message: API_VOTE_ERRORS.LESS_THAN_MINIMUM_MKR_REQUIRED }
    });
  });

  it('return 400 if any poll is expired', async () => {
    (cacheGet as Mock).mockReturnValue(Promise.resolve(null));
    (getMKRVotingWeight as Mock).mockReturnValue(
      Promise.resolve({
        total: parseEther('0.2')
      })
    );
    (getActivePollIds as Mock).mockReturnValue(Promise.resolve([]));
    const { req, res } = mockRequestResponse('POST', {
      voter: '0x999999cf1046e68e36E1aA2E0E07105eDDD1f08E',
      pollIds: [1],
      optionIds: [1],
      nonce: 3,
      expiry: (Date.now() + 200) / 1000,
      signature: '2',
      network: SupportedNetworks.MAINNET
    });

    (verifyTypedSignature as Mock).mockReturnValue(true);
    await voteAPIHandler(req, res);

    expect(res.statusCode).toBe(400);
    expect(res._getJSONData()).toEqual({
      error: { code: 'invalid_request', message: API_VOTE_ERRORS.EXPIRED_POLLS }
    });
  });

  it('return 400 if it used gasless voting recently', async () => {
    (cacheGet as Mock).mockReturnValue(Promise.resolve(null));
    (getMKRVotingWeight as Mock).mockReturnValue(
      Promise.resolve({
        total: parseEther('0.2')
      })
    );
    (getActivePollIds as Mock).mockReturnValue(Promise.resolve([1]));
    (recentlyUsedGaslessVotingCheck as Mock).mockReturnValue(Promise.resolve(true));

    const { req, res } = mockRequestResponse('POST', {
      voter: '0x999999cf1046e68e36E1aA2E0E07105eDDD1f08E',
      pollIds: [1],
      optionIds: [1],
      nonce: 3,
      expiry: (Date.now() + 200) / 1000,
      signature: '2',
      network: SupportedNetworks.MAINNET
    });

    (verifyTypedSignature as Mock).mockReturnValue(true);

    await voteAPIHandler(req, res);

    expect(res.statusCode).toBe(400);
    expect(res._getJSONData()).toEqual({
      error: { code: 'invalid_request', message: API_VOTE_ERRORS.RATE_LIMITED }
    });
  });

  it('return 400 if voter and signer do not match', async () => {
    (cacheGet as Mock).mockReturnValue(Promise.resolve(null));
    (recentlyUsedGaslessVotingCheck as Mock).mockReturnValue(Promise.resolve(false));

    (getMKRVotingWeight as Mock).mockReturnValue(
      Promise.resolve({
        total: parseEther('0.2')
      })
    );
    (getActivePollIds as Mock).mockReturnValue(Promise.resolve([1]));

    (cacheGet as Mock).mockReturnValue(Promise.resolve(null));

    (verifyTypedSignature as Mock).mockReturnValue(false);

    const { req, res } = mockRequestResponse('POST', {
      voter: '0xc0ffee254729296a45a3885639AC7E10F9d54979',
      pollIds: [1],
      optionIds: [1],
      nonce: 3,
      expiry: (Date.now() + 200) / 1000,
      signature: '2',
      network: SupportedNetworks.MAINNET
    });

    await voteAPIHandler(req, res);

    expect(res.statusCode).toBe(400);
    expect(res._getJSONData()).toEqual({
      error: { code: 'invalid_request', message: API_VOTE_ERRORS.VOTER_AND_SIGNER_DIFFER }
    });
  });
});
