/** @jsx jsx */
import { forwardRef, useMemo } from 'react';
import { Box, NavLink, Badge, jsx, Container } from 'theme-ui';
import Link from 'next/link';
import { Icon } from '@makerdao/dai-ui-icons';
import useSWR from 'swr';
import invariant from 'tiny-invariant';

import getMaker, { getNetwork } from 'lib/maker';
import { isActivePoll } from 'lib/utils';
import useAccountsStore from 'stores/accounts';
import { Poll } from 'types/poll';
import { PollVote } from 'types/pollVote';
import { Account } from 'types/account';

type Props = {
  account?: Account;
  activePolls: Poll[];
  unvotedPolls?: Poll[];
  href?: string;
};

const PollingIndicator = forwardRef<HTMLAnchorElement, Props>(
  ({ account, activePolls, unvotedPolls, ...props }, ref): JSX.Element => {
    let message: string | undefined;
    let pollsToBeAwareOf = 0;

    if (account) {
      invariant(unvotedPolls, 'unvotedPolls is unexpectedly falsey');
      pollsToBeAwareOf = unvotedPolls.length;
      message = `New polling vote${pollsToBeAwareOf > 1 ? 's' : ''}`;
    } else {
      pollsToBeAwareOf = activePolls.length;
      message = `New polling vote${pollsToBeAwareOf > 1 ? 's' : ''}`;
    }

    return pollsToBeAwareOf > 0 ? (
      <NavLink
        ref={ref}
        href={`/polling?network=${getNetwork()}`}
        sx={{
          fontSize: 2,
          px: '3',
          borderRadius: 'round',
          border: '1px solid',
          borderColor: 'primary',
          color: 'surface',
          alignItems: 'center',
          backgroundColor: 'primary',
          display: 'inline-flex',
          '&:hover': {
            backgroundColor: 'primaryEmphasis',
            color: 'surface'
            // '> svg': { color: 'primary' }
          }
        }}
        {...props}
      >
        <Badge mr="3" variant="circle" p="3px">
          {pollsToBeAwareOf}
        </Badge>
        <Box pb="2px">{message}</Box>
        <Icon name="chevron_right" color="surface" size="3" ml="3" pb="1px" />
      </NavLink>
    ) : (
      <div />
    );
  }
);

const PollingIndicatorComponent = ({ polls, ...props }: { polls: Poll[] }): JSX.Element => {
  const activePolls = useMemo(() => polls.filter(poll => isActivePoll(poll)), [polls]);
  const account = useAccountsStore(state => state.currentAccount);

  const { data: allUserVotes } = useSWR<PollVote[]>(
    account?.address ? ['/user/voting-for', account.address] : null,
    (_, address) => getMaker().then(maker => maker.service('govPolling').getAllOptionsVotingFor(address)),
    { refreshInterval: 0 }
  );

  const unvotedPolls = allUserVotes
    ? activePolls.filter(poll => !allUserVotes.map(poll => poll.pollId).includes(poll.pollId))
    : activePolls;

  const shouldDisplay = unvotedPolls.length === 0 ? 'none' : undefined;
  return (
    <Container sx={{ textAlign: 'center', display: shouldDisplay }} {...props}>
      <Link passHref href={{ pathname: '/polling', query: { network: getNetwork() } }}>
        <PollingIndicator account={account} unvotedPolls={unvotedPolls} activePolls={activePolls} />
      </Link>
    </Container>
  );
};

export default PollingIndicatorComponent;
