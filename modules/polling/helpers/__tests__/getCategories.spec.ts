import { Poll } from '../../types';
import { getCategories } from '../getCategories';
describe('Get categories', () => {
  it('Returns all the categories', () => {
    const polls = [
      {
        categories: ['a', 'b', 'c']
      },
      {
        categories: ['b', 'c']
      },
      {
        categories: ['x', 'y', 'c']
      }
    ] as Poll[];
    const categories = getCategories(polls);

    // Returns all the categories
    expect(categories.length).toEqual(5);
  });

  it('Sorts them by occurence', () => {
    const polls = [
      {
        categories: ['a', 'b', 'c']
      },
      {
        categories: ['b', 'c']
      },
      {
        categories: ['x', 'y', 'c']
      }
    ] as Poll[];

    const categories = getCategories(polls);

    // First categories are the ones with more ocfurences
    expect(categories[0]).toEqual('c');
    expect(categories[1]).toEqual('b');
  });
});
