/** @jsx jsx */
import { useMemo } from 'react';
import { Box, NavLink, Badge, jsx } from 'theme-ui';
import Link from 'next/link';
import { Icon } from '@makerdao/dai-ui-icons';
import useSWR from 'swr';
import Skeleton from 'react-loading-skeleton';
import invariant from 'tiny-invariant';

import getMaker, { getNetwork } from '../../lib/maker';
import { isActivePoll } from '../../lib/utils';
import useAccountsStore from '../../stores/accounts';
import Poll from '../../types/poll';
import PollVote from '../../types/poll';
import Account from '../../types/account';

type Props = {
  account?: Account;
  activePolls: Poll[];
  unvotedPolls?: Poll[];
  href?: string;
};

const PollingIndicator = ({ account, activePolls, unvotedPolls, href }: Props) => {
  let message: string | undefined;
  let pollsToBeAwareOf = 0;

  if (account) {
    invariant(unvotedPolls, 'unvotedPolls is unexpectedly falsey');
    pollsToBeAwareOf = unvotedPolls.length;
    message =
      unvotedPolls.length > 0
        ? 'Live Governance polls available for voting'
        : 'Congratulations, you have voted on all current Governance Polls';
  } else {
    pollsToBeAwareOf = activePolls.length;
    message =
      activePolls.length > 0
        ? 'Live polls in the Maker Governance system'
        : 'There are no live Governance Polls at the moment';
  }

  return (
    <NavLink
      href={href}
      variant="buttons.outline"
      sx={{
        borderRadius: 'round',
        bg: 'background',
        border: '1px solid',
        borderColor: 'secondary',
        color: 'white',
        alignItems: 'center',
        backgroundColor: 'primary'
      }}
    >
      {pollsToBeAwareOf > 0 ? (
        <Badge mr="3" variant="circle">
          {pollsToBeAwareOf}
        </Badge>
      ) : null}
      {message}
      <Icon name="chevron_right" color="white" size="3" ml="3" pt='2' />
    </NavLink>
  );
};

export default ({ polls }: { polls: Poll[] }) => {
  const activePolls = useMemo(() => polls.filter(poll => isActivePoll(poll)), [polls]);
  const account = useAccountsStore(state => state.currentAccount);

  const { data: votingFor } = useSWR<PollVote[]>(
    account?.address ? [`/user/voting-for`, account.address] : null,
    (_, address) => getMaker().then(maker => maker.service('govPolling').getAllOptionsVotingFor(address))
  );

  const unvotedPolls = votingFor
    ? activePolls.filter(poll => !votingFor.map(poll => poll.pollId).includes(poll.pollId))
    : undefined;

  const query: { network: string; pollFilter?: string } = { network: getNetwork() };
  if (account && unvotedPolls !== undefined && unvotedPolls.length > 0) {
    query.pollFilter = 'unvoted';
  } else if (!account && activePolls.length > 0) {
    query.pollFilter = 'active';
  }

  return (
    <Box py="5" mx="auto" sx={{ maxWidth: 8, textAlign: 'center' }}>
      {account && !unvotedPolls ? (
        <Skeleton />
      ) : (
        <Link
          href={{
            pathname: '/polling',
            query
          }}
          passHref
        >
          <PollingIndicator account={account} unvotedPolls={unvotedPolls} activePolls={activePolls} />
        </Link>
      )}
    </Box>
  );
};
