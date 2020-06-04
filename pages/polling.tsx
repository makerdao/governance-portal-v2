import { useEffect, useState, useMemo } from 'react';
import { NavLink, Heading, Checkbox, Label, Box, Flex, Input } from 'theme-ui';
import Link from 'next/link';

import { getNetwork, isDefaultNetwork } from '../lib/maker';
import { getPolls } from '../lib/api';
import PrimaryLayout from '../components/layouts/Primary';
import Poll from '../types/poll';

function isActivePoll(poll) {
  const hasStarted = new Date(poll.startDate).getTime() <= Date.now();
  const hasNotEnded = new Date(poll.endDate).getTime() >= Date.now();
  return hasStarted && hasNotEnded;
}

interface Props {
  polls: Poll[];
}

const PollingOverview = ({ polls }: Props) => {
  const [dateFilter, setDateFilter] = useState<(Date | null)[]>([null, null]);
  const [filterInactive, setFilterInactive] = useState(false);
  const network = getNetwork();

  const pollsToShow = useMemo(
    () =>
      polls.filter(poll => {
        let _show = true;
        if (filterInactive) {
          _show = _show && isActivePoll(poll);
        }

        const [filterPollsBeforeTime, filterPollsAfterTime] = dateFilter;
        if (filterPollsBeforeTime) {
          _show = _show && new Date(poll.startDate).getTime() >= filterPollsBeforeTime.getTime();
        }
        if (filterPollsAfterTime) {
          _show = _show && new Date(poll.startDate).getTime() <= filterPollsAfterTime.getTime();
        }

        return _show;
      }),
    [polls, filterInactive, dateFilter]
  );

  return (
    <PrimaryLayout>
      <Heading as="h1">Polling Votes</Heading>
      <Flex sx={{ flexDirection: 'column', alignItems: 'flex-start' }}>
        <Box>
          <Label>
            <Checkbox checked={filterInactive} onChange={() => setFilterInactive(b => !b)} />
            Show only active polls
          </Label>
        </Box>

        <Flex>
          <Label sx={{ whiteSpace: 'nowrap', alignItems: 'center' }}>
            Show only polls after
            <Input
              ml="3"
              type="date"
              onChange={e => setDateFilter([new Date(e.target.value), dateFilter[1]])}
            />
          </Label>
          <Label ml="3" sx={{ whiteSpace: 'nowrap', alignItems: 'center' }}>
            Show only polls before
            <Input
              ml="3"
              type="date"
              onChange={e => setDateFilter([dateFilter[0], new Date(e.target.value)])}
            />
          </Label>
        </Flex>
      </Flex>

      {pollsToShow.map(poll => (
        <Box key={poll.multiHash}>
          <Link
            href={{
              pathname: '/polling/[poll-hash]',
              query: { network }
            }}
            as={{
              pathname: `/polling/${poll.multiHash}`,
              query: { network }
            }}
          >
            <NavLink>{poll.title}</NavLink>
          </Link>
        </Box>
      ))}
    </PrimaryLayout>
  );
};

export default ({ polls }) => {
  const [_polls, _setPolls] = useState<Poll[]>();

  // fetch polls at run-time if on any network other than the default
  useEffect(() => {
    if (!isDefaultNetwork()) {
      getPolls().then(polls => _setPolls(polls));
    }
  }, []);

  return <PollingOverview polls={isDefaultNetwork() ? polls : _polls} />;
};

export async function getStaticProps() {
  // fetch polls at build-time if on the default network
  const polls = await getPolls();

  return {
    unstable_revalidate: 30, // allow revalidation every 30 seconds
    props: {
      polls
    }
  };
}
