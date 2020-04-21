import React from 'react';
import { useRouter } from 'next/router';

const ExecutiveProposal = () => {
  const router = useRouter();

  return <div>{router.query['poll-id']}</div>;
};

export default ExecutiveProposal;
