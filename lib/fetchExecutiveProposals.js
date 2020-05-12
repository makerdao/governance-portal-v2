export default async function() {
  const topics = await (
    await fetch(
      'https://cms-gov.makerfoundation.com/content/governance-dashboard'
    )
  ).json();
  return topics
    .filter(proposal => proposal.active)
    .filter(proposal => !proposal.govVote)
    .map(topic => topic.proposals)
    .flat();
}
