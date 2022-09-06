/**
 * @jest-environment node
 */
import { createMocks, RequestMethod } from 'node-mocks-http';
import type { NextApiRequest, NextApiResponse } from 'next';
import voteAPIHandler, { API_VOTE_ERRORS } from '../vote';
import { SupportedNetworks } from 'modules/web3/constants/networks';
import { getArbitrumPollingContract } from 'modules/polling/helpers/getArbitrumPollingContract';
import { getMKRVotingWeight } from 'modules/mkr/helpers/getMKRVotingWeight';
import { cacheGet } from 'modules/cache/cache';
import { BigNumber } from 'ethers';
import { getPolls } from 'modules/polling/api/fetchPolls';
import { parseUnits } from 'ethers/lib/utils';
import { getRecentlyUsedGaslessVoting } from 'modules/cache/constants/cache-keys';
import { recoverTypedSignature } from '@metamask/eth-sig-util';

jest.mock('modules/polling/helpers/getArbitrumPollingContract');
jest.mock('modules/mkr/helpers/getMKRVotingWeight');
jest.mock('modules/cache/cache');
jest.mock('modules/polling/api/fetchPolls');
jest.mock('@metamask/eth-sig-util');

describe('/api/polling/vote API Endpoint', () => {
  beforeAll(() => {
    (getArbitrumPollingContract as jest.Mock).mockReturnValue({
      nonces: () => Promise.resolve(BigNumber.from('3'))
    });
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
    expect(res._getJSONData()).toEqual({ error: API_VOTE_ERRORS.VOTER_MUST_BE_STRING });
    // expect(res.getHeaders()).toEqual({ 'content-type': 'application/json' });
    expect(res.statusMessage).toEqual('OK');
  });

  it('return 400 if pollIds is not an array of integers', async () => {
    const { req, res } = mockRequestResponse('POST', {
      voter: '0x2',
      pollIds: '123'
    });
    await voteAPIHandler(req, res);

    expect(res.statusCode).toBe(400);
    expect(res._getJSONData()).toEqual({ error: API_VOTE_ERRORS.POLLIDS_MUST_BE_ARRAY_NUMBERS });
  });

  it('return 400 if optionIds is not an array of integers', async () => {
    const { req, res } = mockRequestResponse('POST', {
      voter: '0x2',
      pollIds: [1, 2],
      optionIds: '123'
    });
    await voteAPIHandler(req, res);

    expect(res.statusCode).toBe(400);
    expect(res._getJSONData()).toEqual({ error: API_VOTE_ERRORS.OPTIONIDS_MUST_BE_ARRAY_NUMBERS });
  });

  it('return 400 if nonce is not a number', async () => {
    const { req, res } = mockRequestResponse('POST', {
      voter: '0x2',
      pollIds: [1, 2],
      optionIds: [1, 2, 3],
      nonce: 'ab'
    });
    await voteAPIHandler(req, res);

    expect(res.statusCode).toBe(400);
    expect(res._getJSONData()).toEqual({ error: API_VOTE_ERRORS.NONCE_MUST_BE_NUMBER });
  });

  it('return 400 if expiry is not a number', async () => {
    const { req, res } = mockRequestResponse('POST', {
      voter: '0x2',
      pollIds: [1, 2],
      optionIds: [1, 2, 3],
      nonce: 1,
      expiry: 'asd'
    });
    await voteAPIHandler(req, res);

    expect(res.statusCode).toBe(400);
    expect(res._getJSONData()).toEqual({ error: API_VOTE_ERRORS.EXPIRY_MUST_BE_NUMBER });
  });

  it('return 400 if expired', async () => {
    const { req, res } = mockRequestResponse('POST', {
      voter: '0x2',
      pollIds: [1, 2],
      optionIds: [1, 2, 3],
      nonce: 1,
      expiry: (Date.now() - 200) / 1000
    });
    await voteAPIHandler(req, res);

    expect(res.statusCode).toBe(400);
    expect(res._getJSONData()).toEqual({ error: API_VOTE_ERRORS.EXPIRED_VOTES });
  });

  it('return 400 if signature is not a string', async () => {
    const { req, res } = mockRequestResponse('POST', {
      voter: '0x2',
      pollIds: [1, 2],
      optionIds: [1, 2, 3],
      nonce: 1,
      expiry: (Date.now() + 200) / 1000,
      signature: 2
    });
    await voteAPIHandler(req, res);

    expect(res.statusCode).toBe(400);
    expect(res._getJSONData()).toEqual({ error: API_VOTE_ERRORS.SIGNATURE_MUST_BE_STRING });
  });

  it('return 400 if network is not valid', async () => {
    const { req, res } = mockRequestResponse('POST', {
      voter: '0x2',
      pollIds: [1, 2],
      optionIds: [1, 2, 3],
      nonce: 1,
      expiry: (Date.now() + 200) / 1000,
      signature: '2'
    });
    await voteAPIHandler(req, res);

    expect(res.statusCode).toBe(400);
    expect(res._getJSONData()).toEqual({ error: API_VOTE_ERRORS.INVALID_NETWORK });
  });

  it('return 400 if nonce is not valid', async () => {
    const { req, res } = mockRequestResponse('POST', {
      voter: '0x2',
      pollIds: [1, 2],
      optionIds: [1, 2, 3],
      nonce: 1,
      expiry: (Date.now() + 200) / 1000,
      signature: '2',
      network: SupportedNetworks.MAINNET
    });

    await voteAPIHandler(req, res);

    expect(res.statusCode).toBe(400);
    expect(res._getJSONData()).toEqual({ error: API_VOTE_ERRORS.INVALID_NONCE_FOR_ADDRESS });
  });

  it('return 400 if MKR amount is not valid', async () => {
    (cacheGet as jest.Mock).mockReturnValue(Promise.resolve(null));
    (getMKRVotingWeight as jest.Mock).mockReturnValue(
      Promise.resolve({
        total: BigNumber.from(0)
      })
    );
    const { req, res } = mockRequestResponse('POST', {
      voter: '0x2',
      pollIds: [1, 2],
      optionIds: [1, 2, 3],
      nonce: 3,
      expiry: (Date.now() + 200) / 1000,
      signature: '2',
      network: SupportedNetworks.MAINNET
    });

    await voteAPIHandler(req, res);

    expect(res.statusCode).toBe(400);
    expect(res._getJSONData()).toEqual({ error: API_VOTE_ERRORS.LESS_THAN_MINIMUM_MKR_REQUIRED });
  });

  it('return 400 if any poll is expired', async () => {
    (cacheGet as jest.Mock).mockReturnValue(Promise.resolve(null));
    (getMKRVotingWeight as jest.Mock).mockReturnValue(
      Promise.resolve({
        total: parseUnits('0.2')
      })
    );
    (getPolls as jest.Mock).mockReturnValue(
      Promise.resolve({
        polls: [
          {
            pollId: 1,
            endDate: Date.now() - 500,
            startDate: Date.now() - 10000
          }
        ]
      })
    );
    const { req, res } = mockRequestResponse('POST', {
      voter: '0x2',
      pollIds: [1],
      optionIds: [1],
      nonce: 3,
      expiry: (Date.now() + 200) / 1000,
      signature: '2',
      network: SupportedNetworks.MAINNET
    });

    await voteAPIHandler(req, res);

    expect(res.statusCode).toBe(400);
    expect(res._getJSONData()).toEqual({ error: API_VOTE_ERRORS.EXPIRED_POLLS });
  });

  it('return 400 if it used gasless voting recently', async () => {
    (cacheGet as jest.Mock).mockReturnValue(Promise.resolve(null));
    (getMKRVotingWeight as jest.Mock).mockReturnValue(
      Promise.resolve({
        total: parseUnits('0.2')
      })
    );
    (getPolls as jest.Mock).mockReturnValue(
      Promise.resolve({
        polls: [
          {
            pollId: 1,
            endDate: Date.now() + 5000,
            startDate: Date.now() - 10000
          }
        ]
      })
    );

    (cacheGet as jest.Mock).mockImplementation(key => {
      if (key === getRecentlyUsedGaslessVoting('0x2')) {
        return Promise.resolve(true);
      }
      Promise.resolve(null);
    });
    const { req, res } = mockRequestResponse('POST', {
      voter: '0x2',
      pollIds: [1],
      optionIds: [1],
      nonce: 3,
      expiry: (Date.now() + 200) / 1000,
      signature: '2',
      network: SupportedNetworks.MAINNET
    });

    await voteAPIHandler(req, res);

    expect(res.statusCode).toBe(400);
    expect(res._getJSONData()).toEqual({ error: API_VOTE_ERRORS.RATE_LIMITED });
  });

  it('return 400 if voter and signer do not match', async () => {
    (cacheGet as jest.Mock).mockReturnValue(Promise.resolve(null));
    (getMKRVotingWeight as jest.Mock).mockReturnValue(
      Promise.resolve({
        total: parseUnits('0.2')
      })
    );
    (getPolls as jest.Mock).mockReturnValue(
      Promise.resolve({
        polls: [
          {
            pollId: 1,
            endDate: Date.now() + 5000,
            startDate: Date.now() - 10000
          }
        ]
      })
    );

    (cacheGet as jest.Mock).mockReturnValue(Promise.resolve(null));

    (recoverTypedSignature as jest.Mock).mockReturnValue('0x999999cf1046e68e36E1aA2E0E07105eDDD1f08E');

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
    expect(res._getJSONData()).toEqual({ error: API_VOTE_ERRORS.VOTER_AND_SIGNER_DIFFER });
  });
});
