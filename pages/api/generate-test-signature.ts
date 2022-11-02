import { NextApiRequest, NextApiResponse } from 'next';
import withApiHandler from 'modules/app/api/withApiHandler';
import { getTypedBallotData } from 'modules/web3/helpers/signTypedBallotData';
import { signTypedData, SignTypedDataVersion } from '@metamask/eth-sig-util';
import { getArbitrumPollingContractReadOnly } from 'modules/polling/helpers/getArbitrumPollingContractReadOnly';
import { ApiError } from 'modules/app/api/ApiError';
import { isSupportedNetwork } from 'modules/web3/helpers/networks';

export default withApiHandler(async (req: NextApiRequest, res: NextApiResponse) => {
  const voter = '0x43F0A171658791C562FCE5eC6624ca6bb7487c76';
  const privateKey = Buffer.from('1caf1b303b81525e8c7780376bb335bd7750543206ecb86cec654a085ba3832c', 'hex');
  const { network } = req.query;
  if (typeof network !== 'string' || !network || !isSupportedNetwork(network)) {
    throw new ApiError('Invalid network');
  }
//   const contract = getArbitrumPollingContractReadOnly(network);
//   const nonce = await contract.nonces(address);
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
  res.status(200).json({signature, voter, nonce, expiry, pollIds, optionIds });
});