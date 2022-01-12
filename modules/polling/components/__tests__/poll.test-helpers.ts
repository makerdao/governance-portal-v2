export async function createTestPolls(maker) {
  // first poll is ranked choice, second is single select
  await maker
    .service('govPolling')
    .createPoll(
      1577880000,
      33134788800,
      'test',
      'https://raw.githubusercontent.com/makerdao/community/master/governance/polls/MIP14%3A%20Inclusion%20Poll%20for%20Protocol%20DAI%20Transfer%20-%20June%208%2C%202020.md'
    );
  return maker
    .service('govPolling')
    .createPoll(
      1577880000,
      33134788800,
      'test',
      'https://raw.githubusercontent.com/makerdao/community/master/governance/polls/MIP4c2-SP2%3A%20Inclusion%20Poll%20for%20MIP8%20Amendments%20-%20June%208%2C%202020.md'
    );
}
