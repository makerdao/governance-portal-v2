import getDelegatesCounts from './getDelegatesCounts';
import { AllDelegatesEntryWithName } from '../types';
import { DelegateTypeEnum } from '../delegates.constants';

describe('getDelegatesCounts', () => {
  it('should return the correct counts for constitutional, shadow, and total delegates', () => {
    const currentDate = new Date();
    const expiredDate = new Date(currentDate.getTime() - 24 * 60 * 60 * 1000);

    const allDelegatesWithNames: AllDelegatesEntryWithName[] = [
      {
        blockTimestamp: currentDate,
        delegate: '0x123',
        voteDelegate: '0x234',
        name: 'Alice',
        delegateType: DelegateTypeEnum.CONSTITUTIONAL,
        expirationDate: currentDate,
        expired: false,
        isAboutToExpire: false
      },
      {
        blockTimestamp: currentDate,
        delegate: '0x124',
        voteDelegate: '0x235',
        name: 'Bob',
        delegateType: DelegateTypeEnum.CONSTITUTIONAL,
        expirationDate: currentDate,
        expired: false,
        isAboutToExpire: false
      },
      {
        blockTimestamp: currentDate,
        delegate: '0x126',
        voteDelegate: '0x237',
        name: 'Cathy',
        delegateType: DelegateTypeEnum.CONSTITUTIONAL,
        expirationDate: expiredDate,
        expired: true,
        isAboutToExpire: false
      },
      {
        blockTimestamp: currentDate,
        delegate: '0x127',
        voteDelegate: '0x238',
        delegateType: DelegateTypeEnum.SHADOW,
        expirationDate: currentDate,
        expired: false,
        isAboutToExpire: false
      },
      {
        blockTimestamp: currentDate,
        delegate: '0x128',
        voteDelegate: '0x239',
        delegateType: DelegateTypeEnum.SHADOW,
        expirationDate: currentDate,
        expired: false,
        isAboutToExpire: false
      }
    ];

    const expectedCounts = {
      constitutionalDelegatesCount: 2,
      shadowDelegatesCount: 2,
      totalDelegatesCount: 4
    };

    expect(getDelegatesCounts(allDelegatesWithNames)).toEqual(expectedCounts);
  });
});
