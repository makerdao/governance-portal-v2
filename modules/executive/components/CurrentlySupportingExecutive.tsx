/*

SPDX-FileCopyrightText: © 2023 Dai Foundation <www.daifoundation.org>

SPDX-License-Identifier: AGPL-3.0-or-later

*/

import { chiefAbi, chiefAddress } from 'modules/contracts/generated';
import { ZERO_ADDRESS } from 'modules/web3/constants/addresses';
import { Divider, Box, Text, Flex } from 'theme-ui';
import { useChainId, useReadContract } from 'wagmi';

export function CurrentlySupportingExecutive({
  proposalsSupported,
  execSupported,
  delegateAddress
}: {
  proposalsSupported: number;
  execSupported: { title: string; address: string } | undefined;
  delegateAddress: string;
}): React.ReactElement | null {
  const chainId = useChainId();
  const chiefParameters = {
    address: chiefAddress[chainId],
    abi: chiefAbi
  };

  // If no executive support is detected from the subgraph, check if delegate is supporting address(0)
  const { data: vote } = useReadContract({
    ...chiefParameters,
    functionName: 'votes',
    args: [delegateAddress as `0x${string}`],
    query: {
      enabled: proposalsSupported === 0
    }
  });

  const { data: slate } = useReadContract({
    ...chiefParameters,
    functionName: 'slates',
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    args: [vote!, 0n],
    query: {
      enabled: proposalsSupported === 0 && !!vote
    }
  });

  const getSupportText = (): string | null => {
    if (proposalsSupported === 0 && slate === ZERO_ADDRESS) {
      return 'Currently supporting address(0)';
    }

    if (proposalsSupported === 0) {
      return 'Currently no executive supported';
    }

    if (execSupported) {
      return `Currently supporting ${execSupported.title}${
        proposalsSupported > 1
          ? ` & ${proposalsSupported - 1} more proposal${proposalsSupported === 2 ? '' : 's'}`
          : ''
      }`;
    }

    return null;
  };

  const supportText = getSupportText();
  return supportText ? (
    <Box>
      <Divider my={1} />
      <Flex sx={{ py: 2, justifyContent: 'center', fontSize: [1, 2], color: 'onSecondary' }}>
        <Text as="p" variant="caps" sx={{ textAlign: 'center', px: [3, 4], mb: 1, wordBreak: 'break-word' }}>
          {supportText}
        </Text>
      </Flex>
    </Box>
  ) : null;
}
