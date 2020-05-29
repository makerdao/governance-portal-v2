import { useEffect, useState } from 'react';
import { NavLink, Heading } from 'theme-ui';
import Link from 'next/link';

import { getNetwork, isDefaultNetwork } from '../lib/maker';
import { getPolls } from '../lib/api';
import PrimaryLayout from '../components/layouts/Primary';
import Poll from '../types/poll';

type Props = {
  polls: Poll[];
};

const PollingOverview: React.FC<Props> = ({ polls }) => {
  const network = getNetwork();
  const validPolls = polls.filter(poll => new Date(poll.startDate) <= new Date());

  return (
    <PrimaryLayout>
      <Heading as="h1">Polling Votes</Heading>

      {validPolls.map(poll => (
        <Link
          key={poll.multiHash}
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
