import { parsePollMetadata } from '../../../lib/polling/parser';
import pollJson from './poll-327.json';
import fs from 'fs';
import { PartialPoll } from '../../../types/poll';
import matter from 'gray-matter';

const pollMetadata = fs.readFileSync(__dirname + '/poll-327.md').toString();

test('return the expected values', () => {
  const actual = parsePollMetadata(pollJson as PartialPoll, pollMetadata, { '327': ['Technical'] });
  expect(actual).toEqual(
    expect.objectContaining({
      pollId: 327,
      multiHash: 'QmXhKW6B1QuuMoTkvnx2V4JESkiVWWhgmHXK6JQkkgERGH',
      startDate: '1601913600',
      endDate: '1602172800',
      url:
        'https://raw.githubusercontent.com/makerdao/community/master/governance/polls/Add%20an%20ETH-B%20Vault%20Type%20-%20October%205%2C%202020.md',
      slug: 'QmXhKW6B',
      title: 'Add an ETH-B Vault Type - October 5, 2020',
      options: { '0': 'Abstain', '1': 'Yes', '2': 'No' },
      discussionLink: 'https://forum.makerdao.com/t/4435',
      voteType: 'Plurality Voting',
      categories: ['Technical']
    })
  );

  expect(actual.content).toEqual(matter(pollMetadata).content);
});
