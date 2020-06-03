import { useEffect, useState, useMemo } from 'react';
import { NavLink, Heading, Checkbox, Label, Box } from 'theme-ui';
import Link from 'next/link';

import { getNetwork, isDefaultNetwork } from '../lib/maker';
import { getPolls } from '../lib/api';
import PrimaryLayout from '../components/layouts/Primary';
import Poll from '../types/poll';

function isActivePoll(poll) {
  const hasStarted = new Date(poll.startDate).getTime() <= Date.now();
  const hasntEnded = new Date(poll.endDate).getTime() >= Date.now();
  return hasStarted && hasntEnded;
}

interface Props {
  polls: Poll[];
}

const PollingOverview = ({ polls }: Props) => {
  const [filterInactive, setFilterInactive] = useState(true);
  const network = getNetwork();

  const pollsToShow = useMemo(
    () =>
      polls.filter(poll => {
        let _show = true;
        if (filterInactive) {
          _show = _show && isActivePoll(poll);
        }
        return _show;
      }),
    [polls, filterInactive]
  );

  return (
    <PrimaryLayout>
      <Heading as="h1">Polling Votes</Heading>
      <Label>
        <Checkbox checked={filterInactive} onChange={() => setFilterInactive(b => !b)} />
        Show only active polls
      </Label>

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
