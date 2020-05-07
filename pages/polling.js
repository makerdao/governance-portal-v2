import { NavLink, Heading } from 'theme-ui';
import Link from 'next/link';

import fetchPolls from '../lib/fetchPolls';
import PrimaryLayout from '../components/PrimaryLayout';

export default function Polling({ polls }) {
  const validPolls = polls.filter(
    (poll) => new Date(poll.startDate) <= new Date()
  );

  return (
    <PrimaryLayout>
      <Heading as="h1">Polling Votes</Heading>

      {validPolls.map((poll) => (
        <Link
          key={poll.multiHash}
          href="/polling/[poll-id]"
          as={`/polling/${poll.multiHash}`}
        >
          <NavLink>{poll.title}</NavLink>
        </Link>
      ))}
    </PrimaryLayout>
  );
}

export async function getStaticProps() {
  const polls = (await fetchPolls()).map((p) => ({
    title: p.title,
    summary: p.summary,
    multiHash: p.multiHash,
    startDate: p.startDate,
  }));

  // Don't process polls where startDate is in the future
  // const polls = uniqPolls.filter(poll => poll.startDate <= new Date());

  return {
    unstable_revalidate: 30, // allow revalidation every 30 seconds
    props: {
      polls,
    },
  };
}
