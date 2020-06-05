import { useEffect, useState, useMemo } from 'react';
import { NavLink, Heading, Checkbox, Label, Box, Flex, Input } from 'theme-ui';
import Link from 'next/link';
import { useRouter } from 'next/router';

import { getNetwork, isDefaultNetwork } from '../lib/maker';
import { getPolls } from '../lib/api';
import { isActivePoll } from '../lib/utils';
import PrimaryLayout from '../components/layouts/Primary';
import Poll from '../types/poll';

type Props = {
  polls: Poll[];
};

const PollingOverview = ({ polls }: Props) => {
  const { query } = useRouter();
  const [dateFilter, setDateFilter] = useState<(Date | null)[]>([null, null]);
  const [filterInactivePolls, setFilterInactivePolls] = useState(false);

  useEffect(() => {
    if (query?.['pollFilter']?.includes('active')) {
      setFilterInactivePolls(true);
    }
  }, [query?.['pollFilter']]);

  const pollsToShow = useMemo(
    () =>
      polls.filter(poll => {
        let _show = true;
        if (filterInactivePolls) {
          _show = _show && isActivePoll(poll);
        }

        const [filterPollsBeforeDate, filterPollsAfterDate] = dateFilter;
        if (filterPollsBeforeDate) {
          _show = _show && new Date(poll.startDate).getTime() >= filterPollsBeforeDate.getTime();
        }
        if (filterPollsAfterDate) {
          _show = _show && new Date(poll.startDate).getTime() <= filterPollsAfterDate.getTime();
        }

        return _show;
      }),
    [polls, filterInactivePolls, dateFilter]
  );

  return (
    <PrimaryLayout>
      <Heading as="h1">Polling Votes</Heading>
      <Flex sx={{ flexDirection: 'column', alignItems: 'flex-start' }}>
        <Box>
          <Label>
            <Checkbox checked={filterInactivePolls} onChange={() => setFilterInactivePolls(b => !b)} />
            Show only active polls
          </Label>
        </Box>

        <Flex sx={{ flexWrap: 'wrap' }}>
          <Label sx={{ whiteSpace: 'nowrap', alignItems: 'center' }}>
            Show only polls after
            <Input
              mx="3"
              type="date"
              onChange={e => setDateFilter([new Date(e.target.value), dateFilter[1]])}
            />
          </Label>
          <Label sx={{ whiteSpace: 'nowrap', alignItems: 'center' }}>
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
              query: { network: getNetwork() }
            }}
            as={{
              pathname: `/polling/${poll.multiHash}`,
              query: { network: getNetwork() }
            }}
          >
            <NavLink>{poll.title}</NavLink>
          </Link>
        </Box>
      ))}
    </PrimaryLayout>
  );
};

export default function PollingOverviewPage({ polls }) {
  const [_polls, _setPolls] = useState<Poll[]>();

  // fetch polls at run-time if on any network other than the default
  useEffect(() => {
    if (!isDefaultNetwork()) {
      getPolls().then(polls => _setPolls(polls));
    }
  }, []);

  return <PollingOverview polls={isDefaultNetwork() ? polls : _polls} />;
}

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
