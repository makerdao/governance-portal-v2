import invariant from 'tiny-invariant';
import { ethers } from 'ethers';
import { NextApiRequest, NextApiResponse } from 'next';

import { DEFAULT_NETWORK, SupportedNetworks } from 'modules/web3/constants/networks';
import { ExecutiveComment, ExecutiveCommentsRequestBody } from 'modules/comments/types/comments';
import withApiHandler from 'modules/app/api/withApiHandler';
import { getChiefDeposits } from 'modules/web3/api/getChiefDeposits';
import { networkNameToChainId } from 'modules/web3/helpers/chain';
import { getContracts } from 'modules/web3/helpers/getContracts';
import { formatValue } from 'lib/string';
import { insertExecutiveComment } from 'modules/comments/api/insertExecutiveComment';
import { verifyCommentParameters } from 'modules/comments/api/verifyCommentParameters';

export default withApiHandler(
  async (req: NextApiRequest, res: NextApiResponse) => {
    const spellAddress: string = req.query.address as string;
    invariant(spellAddress && ethers.utils.isAddress(spellAddress), 'valid spell address required');

    const network = (req.query.network as SupportedNetworks) || DEFAULT_NETWORK.network;
    const {
      voterAddress,
      hotAddress,
      comment,
      signedMessage,
      txHash,
      addressLockedMKR
    }: ExecutiveCommentsRequestBody = req.body;
    // Verifies the data
    const resultVerify = await verifyCommentParameters(
      hotAddress,
      voterAddress,
      signedMessage,
      txHash,
      network
    );

    // Get votter weight
    const chief = getContracts(networkNameToChainId(network)).chief;
    const voterWeigth = await getChiefDeposits(addressLockedMKR, chief);

    const newComment: ExecutiveComment = {
      spellAddress,
      voterAddress: voterAddress.toLowerCase(),
      hotAddress: hotAddress.toLowerCase(),
      accountType: resultVerify,
      commentType: 'executive',
      comment,
      voterWeight: formatValue(voterWeigth),
      date: new Date(),
      network,
      txHash
    };

    await insertExecutiveComment(newComment);

    res.status(200).json({ success: 'Added Successfully' });
  },
  { allowPost: true }
);
