import { Poll } from '../../types';
import { sortPolls } from '../parsePollMetadata';

describe('Parse poll metadata', () => {
  const polls: Poll[] = [
    {
      categories: ['a'],
      content: '',
      discussionLink: '',
      endDate: new Date(2011, 10, 30),
      multiHash: '',
      options: {},
      pollId: 1,
      startDate: new Date(2011, 10, 30),
      slug: '',
      summary: '',
      title: '2011,10,30',
      voteType: 'Plurality Voting',
      ctx: {} as any
    },
    {
      categories: ['a'],
      content: '',
      discussionLink: '',
      endDate: new Date(2011, 10, 30),
      multiHash: '',
      options: {},
      pollId: 2,
      startDate: new Date(2011, 10, 31),
      slug: '',
      summary: '',
      title: '2011,10,31',
      voteType: 'Plurality Voting',
      ctx: {} as any
    },
    {
      categories: ['a'],
      content: '',
      discussionLink: '',
      endDate: new Date(2021, 11, 31),
      multiHash: '',
      options: {},
      pollId: 3,
      startDate: new Date(2021, 10, 31),
      slug: '',
      summary: '',
      title: '2021,10,31',
      voteType: 'Plurality Voting',
      ctx: {} as any
    },
    {
      categories: ['a'],
      content: '',
      discussionLink: '',
      endDate: new Date(2021, 11, 31),
      multiHash: '',
      options: {},
      pollId: 4,
      startDate: new Date(2021, 11, 31),
      slug: '',
      summary: '',
      title: '2021,11,31',
      voteType: 'Plurality Voting',
      ctx: {} as any
    }
  ];

  test('The first poll is the one created sooner', () => {
    const results = sortPolls(polls);

    expect(results[0].pollId).toEqual(4);
  });

  test('The second poll is the one with the same date as 1 but different start date', () => {
    const results = sortPolls(polls);

    expect(results[1].pollId).toEqual(3);
  });

  test('The 4 poll is the one that ended first', () => {
    const results = sortPolls(polls);

    expect(results[3].pollId).toEqual(1);
  });
});
