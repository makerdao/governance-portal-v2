/*

SPDX-FileCopyrightText: © 2023 Dai Foundation <www.daifoundation.org>

SPDX-License-Identifier: AGPL-3.0-or-later

*/

import { useReadContract } from 'wagmi';
import { Box } from 'theme-ui';
import Banner from './Banner';
import bannerContent from 'modules/home/data/bannerContent.json';
import { useNetwork } from 'modules/app/hooks/useNetwork';
import { networkNameToChainId } from 'modules/web3/helpers/chain';
import { chiefAddress, newChiefAbi } from 'modules/contracts/generated';

export const AppBanner = () => {
  const network = useNetwork();
  const chainId = networkNameToChainId(network);

  // TODO this check for live chief can be removed once the migration is complete
  const { data: live } = useReadContract({
    address: chiefAddress[chainId],
    abi: newChiefAbi,
    chainId,
    functionName: 'live',
    scopeKey: `chief-live-${chainId}`
  });
  const isChiefLive = live === 1n;

  const activeBannerContent = bannerContent.find(
    ({ active, id }) => active === true && (id === 'delegate-migration' ? !isChiefLive : true)
  );

  if (!activeBannerContent) {
    return null;
  }

  return (
    <Box sx={{ pb: 3 }}>
      <Banner
        content={activeBannerContent.content}
        href={activeBannerContent.href}
        variant={activeBannerContent.variant}
      />
    </Box>
  );
};
