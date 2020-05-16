import { NavLink, Heading } from 'theme-ui';
import Link from 'next/link';

import { getNetwork } from '../lib/maker';
import { getPolls } from '../lib/api';
import PrimaryLayout from '../components/PrimaryLayout';

export default function Polling({ polls = [] } = {}) {
  const network = getNetwork();
  const validPolls = polls.filter(
    poll => new Date(poll.startDate) <= new Date()
  );

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
}

export async function getStaticProps() {
  const polls = (await getPolls()).map(p => ({
    title: p.title,
    summary: p.summary,
    multiHash: p.multiHash,
    startDate: p.startDate
  }));

  return {
    unstable_revalidate: 30, // allow revalidation every 30 seconds
    props: {
      polls
    }
  };
}
