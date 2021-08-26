import { PollCategory, Poll } from 'modules/polls/types';

export const getCategories = (polls: Poll[]): PollCategory[] => {
  const categoryMap = polls.reduce((acc, cur) => {
    if (!cur.categories) return acc;
    cur.categories.forEach(c => {
      if (acc[c]) {
        acc[c] += 1;
      } else {
        acc[c] = 1;
      }
    });
    return acc;
  }, {});

  const allCategories = Object.keys(categoryMap)
    .sort((a, b) => (a > b ? 1 : -1))
    .map(c => ({ name: c, count: categoryMap[c] }));

  return allCategories || [];
};
