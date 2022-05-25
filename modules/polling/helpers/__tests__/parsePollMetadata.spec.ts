import { parsePollMetadata, spockPollToPartialPoll } from '../parsePollMetadata';
import pollJson327 from './__helpers__/poll-327.js';
import pollJson431 from './__helpers__/poll-431.js';
import fs from 'fs';
import matter from 'gray-matter';
import { PollSpock } from '../../types/pollSpock';
import { getPollTags, getPollTagsMapping } from 'modules/polling/api/getPollTags';

jest.mock('modules/polling/api/getPollTags');

const pollMetadata327 = fs.readFileSync(__dirname + '/__helpers__/poll-327.md').toString();
const pollMetadata431 = fs.readFileSync(__dirname + '/__helpers__/poll-431.md').toString();
describe('Parse poll metadata', () => {
  beforeAll(() => {
    (getPollTags as jest.Mock).mockReturnValue([
      {
        id: 'risk',
        shortname: 'risk',
        longname: 'risk',
        description: 'risk'
      }
    ]);

    (getPollTagsMapping as jest.Mock).mockReturnValue({
      431: ['risk']
    });
  });

  test('return the expected values', () => {
    const actual = parsePollMetadata(spockPollToPartialPoll(pollJson431 as PollSpock), pollMetadata431);
    expect(actual).toEqual(
      expect.objectContaining({
        pollId: 431,
        multiHash: 'QmWPAu5zvDkBeVKqq9MGy4sYBgQfm5H1BtrYENMmq9J7xA',
        startDate: new Date(1610985600 * 1000),
        endDate: new Date(1611244800 * 1000),
        url: 'https://raw.githubusercontent.com/makerdao/community/master/governance/polls/Adjust%20the%20Dust%20Parameter%20-%20January%2018%2C%202021.md',
        slug: 'QmWPAu5z',
        title: 'Increase the Dust Parameter - January 18, 2021',
        options: { '0': 'Abstain', '1': 'Yes', '2': 'No' },
        discussionLink: 'https://forum.makerdao.com/t/signal-request-increasing-dust-parameter/5963',
        voteType: 'Plurality Voting',
        content: expect.any(String),
        tags: [
          {
            id: 'risk',
            shortname: 'risk',
            description: 'risk',
            longname: 'risk'
          }
        ]
      })
    );

    expect(actual.content).toEqual(matter(pollMetadata431).content);
  });

  test('return the expected values for an old uncategorized poll', () => {
    const actual = parsePollMetadata(spockPollToPartialPoll(pollJson327 as PollSpock), pollMetadata327);
    expect(actual).toEqual(
      expect.objectContaining({
        pollId: 327,
        multiHash: 'QmXhKW6B1QuuMoTkvnx2V4JESkiVWWhgmHXK6JQkkgERGH',
        startDate: new Date(1601913600 * 1000),
        endDate: new Date(1602172800 * 1000),
        url: 'https://raw.githubusercontent.com/makerdao/community/master/governance/polls/Add%20an%20ETH-B%20Vault%20Type%20-%20October%205%2C%202020.md',
        slug: 'QmXhKW6B',
        title: 'Add an ETH-B Vault Type - October 5, 2020',
        options: { '0': 'Abstain', '1': 'Yes', '2': 'No' },
        content: expect.any(String),
        discussionLink: 'https://forum.makerdao.com/t/4435',
        voteType: 'Plurality Voting',
        tags: []
      })
    );

    expect(actual.content).toEqual(matter(pollMetadata327).content);
  });
});
