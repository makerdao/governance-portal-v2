import fetch from './fetch';

export default async function() {
  const topics = await fetch(
    'https://cms-gov.makerfoundation.com/content/governance-dashboard'
  );
  return topics
    .filter((proposal) => proposal.active)
    .filter((proposal) => !proposal.govVote)
    .map((topic) => topic.proposals)
    .flat();
}
