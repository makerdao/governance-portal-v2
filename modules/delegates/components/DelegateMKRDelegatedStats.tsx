/*

SPDX-FileCopyrightText: © 2023 Dai Foundation <www.daifoundation.org>

SPDX-License-Identifier: AGPL-3.0-or-later

*/

import { Box, Flex } from 'theme-ui';
import Icon from 'modules/app/components/Icon';
import { useMkrDelegatedByUser } from 'modules/mkr/hooks/useMkrDelegatedByUser';
import { Delegate } from 'modules/delegates/types';
import { StatBox } from 'modules/app/components/StatBox';
import { useAccount } from 'modules/app/hooks/useAccount';
import { formatValue } from 'lib/string';
import Tooltip from 'modules/app/components/Tooltip';
import { useSkyVotingWeight } from 'modules/mkr/hooks/useSkyVotingWeight';
import Skeleton from 'react-loading-skeleton';

export function DelegateMKRDelegatedStats({
  delegate,
  delegatorCount
}: {
  delegate: Delegate;
  delegatorCount?: number;
}): React.ReactElement {
  const { account } = useAccount();
  // TODO: Fetch addresses suporting through API fetching

  const { data: mkrDelegatedData } = useMkrDelegatedByUser(account, delegate.voteDelegateAddress);
  const totalMkrDelegated = mkrDelegatedData?.totalDelegationAmount;
  const { data: votingWeight } = useSkyVotingWeight({ address: delegate.voteDelegateAddress });

  return (
    <Flex
      sx={{
        display: 'flex',
        justifyContent: 'space-between',
        flexDirection: ['column', 'row'],
        marginTop: 1,
        marginBottom: 1
      }}
    >
      <StatBox
        value={
          !votingWeight ? (
            <Skeleton width="100%" height="15px" />
          ) : votingWeight ? (
            formatValue(votingWeight)
          ) : (
            'Untracked'
          )
        }
        label={'Total SKY Delegated'}
      />
      <StatBox
        value={
          typeof delegatorCount !== 'undefined'
            ? delegatorCount.toLocaleString(undefined, { maximumFractionDigits: 0 })
            : '--'
        }
        label={'Total Active Delegators'}
      />
      {account && (
        <StatBox
          value={typeof totalMkrDelegated !== 'undefined' ? formatValue(totalMkrDelegated) : '0'}
          label={'SKY delegated by you'}
        />
      )}
    </Flex>
  );
}
