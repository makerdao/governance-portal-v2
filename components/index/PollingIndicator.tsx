/** @jsx jsx */
import { forwardRef, useMemo } from 'react';
import { Box, NavLink, Badge, jsx, Container } from 'theme-ui';
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

const PollingIndicator = forwardRef<HTMLAnchorElement, Props>(
  ({ account, activePolls, unvotedPolls, href }, ref): JSX.Element => {
    let message: string | undefined;
    let pollsToBeAwareOf = 0;

    if (account) {
      invariant(unvotedPolls, 'unvotedPolls is unexpectedly falsey');
      pollsToBeAwareOf = unvotedPolls.length;
      message =
        unvotedPolls.length > 0
          ? 'Live Governance polls available for voting'
          : activePolls.length > 0
          ? 'Congratulations, you have voted on all current Governance Polls'
          : 'There are no live Governance Polls at the moment';
    } else {
      pollsToBeAwareOf = activePolls.length;
      message =
        activePolls.length > 0 ? 'New polling votes' : 'There are no live Governance Polls at the moment';
    }

    return (
      <NavLink
        ref={ref}
        href={href}
        variant="buttons.outline"
        sx={{
          fontSize: [1, 2],
          borderRadius: 'round',
          border: '1px solid',
          borderColor: 'primary',
          color: 'surface',
          alignItems: 'center',
          backgroundColor: 'primary',
          display: 'inline-flex',
          '&:hover': {
            '> svg': { color: 'primary' }
          }
        }}
      >
        {pollsToBeAwareOf > 0 && (
          <Badge mr="3" variant="circle" p="3px">
            {pollsToBeAwareOf}
          </Badge>
        )}
        <Box pb="2px">{message}</Box>
        <Icon name="chevron_right" color="surface" size="3" ml="3" pb="1px" />
      </NavLink>
    );
  }
);

export default ({ polls, ...props }: { polls: Poll[] }): JSX.Element => {
  const activePolls = useMemo(() => polls.filter(poll => isActivePoll(poll)), [polls]);
  const account = useAccountsStore(state => state.currentAccount);

  const { data: allUserVotes } = useSWR<PollVote[]>(
    account?.address ? ['/user/voting-for', account.address] : null,
    (_, address) => getMaker().then(maker => maker.service('govPolling').getAllOptionsVotingFor(address)),
    { refreshInterval: 0 }
  );

  const unvotedPolls = allUserVotes
    ? activePolls.filter(poll => !allUserVotes.map(poll => poll.pollId).includes(poll.pollId))
    : undefined;

  const query: { network: string; pollFilter?: string } = { network: getNetwork() };
  if (account && unvotedPolls !== undefined && unvotedPolls.length > 0) {
    query.pollFilter = 'unvoted';
  } else if (!account && activePolls.length > 0) {
    query.pollFilter = 'active';
  }

  return (
    <Container sx={{ textAlign: 'center' }} {...props}>
      {account && !unvotedPolls ? (
        <Skeleton height="39px" width="400px" />
      ) : (
        <Link
          passHref
          href={{
            pathname: '/polling',
            query
          }}
        >
          <PollingIndicator account={account} unvotedPolls={unvotedPolls} activePolls={activePolls} />
        </Link>
      )}
    </Container>
  );
};
