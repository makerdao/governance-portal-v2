/*

SPDX-FileCopyrightText: © 2023 Dai Foundation <www.daifoundation.org>

SPDX-License-Identifier: AGPL-3.0-or-later

*/

import { NextApiRequest, NextApiResponse } from 'next';
import { fetchDelegatesPaginated } from 'modules/delegates/api/fetchDelegates';
import { DelegatesPaginatedAPIResponse } from 'modules/delegates/types';
import { DEFAULT_NETWORK, SupportedNetworks } from 'modules/web3/constants/networks';
import { DelegateTypeEnum } from 'modules/delegates/delegates.constants';
import withApiHandler from 'modules/app/api/withApiHandler';
import validateQueryParam from 'modules/app/api/validateQueryParam';

export default withApiHandler(
  async (req: NextApiRequest, res: NextApiResponse<DelegatesPaginatedAPIResponse>) => {
    const network = validateQueryParam(req.query.network, 'string', {
      defaultValue: DEFAULT_NETWORK.network,
      validValues: [SupportedNetworks.GOERLI, SupportedNetworks.GOERLIFORK, SupportedNetworks.MAINNET]
    }) as SupportedNetworks;

    const pageSize = validateQueryParam(req.query.pageSize, 'number', {
      defaultValue: 20,
      minValue: 1,
      maxValue: 30
    }) as number;

    const page = validateQueryParam(req.query.page, 'number', {
      defaultValue: 1,
      minValue: 1
    }) as number;

    const includeExpired = validateQueryParam(req.query.includeExpired, 'boolean', {
      defaultValue: false
    }) as boolean;

    const orderBy = validateQueryParam(req.query.orderBy, 'string', {
      defaultValue: 'DATE',
      validValues: ['MKR', 'DELEGATORS', 'DATE']
    }) as string;

    const orderDirection = validateQueryParam(req.query.orderDirection, 'string', {
      defaultValue: 'DESC',
      validValues: ['ASC', 'DESC']
    }) as string;

    const delegateType = validateQueryParam(req.query.delegateType, 'string', {
      defaultValue: DelegateTypeEnum.ALL,
      validValues: [DelegateTypeEnum.RECOGNIZED, DelegateTypeEnum.SHADOW, DelegateTypeEnum.ALL]
    }) as DelegateTypeEnum;

    const name =
      delegateType !== DelegateTypeEnum.RECOGNIZED
        ? null
        : (validateQueryParam(req.query.name, 'string', {
            defaultValue: null
          }) as string | null);

    const tags =
      delegateType !== DelegateTypeEnum.RECOGNIZED
        ? null
        : (validateQueryParam(req.query.tags, 'array', {
            defaultValue: null
          }) as string[] | null);

    const delegates = await fetchDelegatesPaginated({
      network,
      pageSize,
      page,
      includeExpired,
      orderBy,
      orderDirection,
      delegateType,
      name,
      tags
    });

    res.setHeader('Cache-Control', 's-maxage=15, stale-while-revalidate');
    res.status(200).json(delegates);
  }
);
