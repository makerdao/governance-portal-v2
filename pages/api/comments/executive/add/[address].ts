/*

SPDX-FileCopyrightText: © 2023 Dai Foundation <www.daifoundation.org>

SPDX-License-Identifier: AGPL-3.0-or-later

*/

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
import { ApiError } from 'modules/app/api/ApiError';
import validateQueryParam from 'modules/app/api/validateQueryParam';
import { validateAddress } from 'modules/web3/api/validateAddress';

export default withApiHandler(
  async (req: NextApiRequest, res: NextApiResponse) => {
    // validate network
    const network = validateQueryParam(
      (req.query.network as SupportedNetworks) || DEFAULT_NETWORK.network,
      'string',
      {
        defaultValue: null,
        validValues: [SupportedNetworks.TENDERLY, SupportedNetworks.MAINNET]
      },
      n => !!n,
      new ApiError('Invalid network', 400, 'Invalid network')
    ) as SupportedNetworks;

    const spellAddress = await validateAddress(
      req.query.address as string,
      new ApiError('Invalid address', 400, 'Invalid address')
    );

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
    const chief = getContracts(networkNameToChainId(network), undefined, undefined, true).chief;
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
