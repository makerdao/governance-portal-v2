import { NextApiRequest, NextApiResponse } from 'next';
import withApiHandler from 'modules/app/api/withApiHandler';
import { getTypedBallotData } from 'modules/web3/helpers/signTypedBallotData';
import { signTypedData, SignTypedDataVersion } from '@metamask/eth-sig-util';
import { ApiError } from 'modules/app/api/ApiError';
import { isSupportedNetwork } from 'modules/web3/helpers/networks';
import { ethers } from 'ethers';

const genRanHex = size => [...Array(size)].map(() => Math.floor(Math.random() * 16).toString(16)).join('');

export default withApiHandler(async (req: NextApiRequest, res: NextApiResponse) => {
  const privateKey = Buffer.from(genRanHex(64), 'hex');
  const wallet = new ethers.Wallet(privateKey);
  const voter = wallet.address;
  const { network } = req.query;
  if (typeof network !== 'string' || !network || !isSupportedNetwork(network)) {
    const error = 'Invalid or missing network query param';
    throw new ApiError(error, 400, error);
  }
  const pollIds = ['1'];
  const optionIds = ['0'];
  const nonce = 0;
  const expiry = Math.trunc((Date.now() + 8 * 60 * 60 * 1000) / 1000); //8 hour expiry
  const signatureValues = { 
    voter: voter.toLowerCase(),
    pollIds,
    optionIds,
    nonce,
    expiry
  };
  const data = getTypedBallotData(signatureValues, network);
  const version = SignTypedDataVersion.V4;
  const signature = await signTypedData({privateKey, data, version});
  res.setHeader('Cache-Control', 's-maxage=30, stale-while-revalidate');
  res.status(200).json({signature, voter, nonce, expiry, pollIds, optionIds, network });
});