import React from 'react';
import Link from 'next/link';
import { NavLink } from 'theme-ui';
import useSWR from 'swr';
import HeaderLayout from '../components/HeaderLayout';

const Executive = () => {
  const { data: proposals, error } = useSWR('proposals', () =>
    fetch(
      'https://cms-gov.makerfoundation.com/content/governance-dashboard'
    ).then((resp) => resp.json())
  );

  if (error) return <div>failed to load</div>;
  if (!proposals) return <div>loading...</div>;
  return (
    <HeaderLayout>
      <div>
        <h1>Executive Proposals</h1>
        <ul>
          {proposals.map((proposal) => (
            <li key={proposal.key}>
              <Link
                href="/executive/[proposal-id]"
                as={`/executive/${proposal.key}`}
              >
                <NavLink>{proposal.key}</NavLink>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </HeaderLayout>
  );
};

export default Executive;
