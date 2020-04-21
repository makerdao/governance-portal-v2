import React from 'react';
import Link from 'next/link';
import { NavLink } from 'theme-ui';
import { useQuery } from 'react-query';
import HeaderLayout from '../components/HeaderLayout';

const getProposals = async (_, network) => {
  return (
    await fetch(
      'https://cms-gov.makerfoundation.com/content/governance-dashboard'
    )
  ).json();
};

const Executive = () => {
  const { status, data: proposals, error, isFetching } = useQuery(
    'proposals',
    getProposals
  );

  if (isFetching) return null;
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
