import { parsePollMetadata } from '../../../lib/polling/parser';
import pollJson327 from './poll-327.json';
import pollJson431 from './poll-431.json';
import fs from 'fs';
import { PartialPoll } from '../../../types/poll';
import matter from 'gray-matter';

const pollMetadata327 = fs.readFileSync(__dirname + '/poll-327.md').toString();
const pollMetadata431 = fs.readFileSync(__dirname + '/poll-431.md').toString();

test('return the expected values', () => {
  const actual = parsePollMetadata(pollJson431 as PartialPoll, pollMetadata431);
  expect(actual).toEqual(
    expect.objectContaining({
      pollId: 431,
      multiHash: 'QmWPAu5zvDkBeVKqq9MGy4sYBgQfm5H1BtrYENMmq9J7xA',
      startDate: '1610985600',
      endDate: '1611244800',
      url:
        'https://raw.githubusercontent.com/makerdao/community/master/governance/polls/Adjust%20the%20Dust%20Parameter%20-%20January%2018%2C%202021.md',
      slug: 'QmWPAu5z',
      title: 'Increase the Dust Parameter - January 18, 2021',
      options: { '0': 'Abstain', '1': 'Yes', '2': 'No' },
      discussionLink: 'https://forum.makerdao.com/t/signal-request-increasing-dust-parameter/5963',
      voteType: 'Plurality Voting',
      categories: ['Risk Variable', 'Technical']
    })
  );

  expect(actual.content).toEqual(matter(pollMetadata431).content);
});

test('return the expected values for an old uncategorized poll', () => {
  const actual = parsePollMetadata(pollJson327 as PartialPoll, pollMetadata327, { '327': ['Technical'] });
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

  expect(actual.content).toEqual(matter(pollMetadata327).content);
});