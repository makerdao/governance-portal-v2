import { AllDelegatesEntryWithName } from '../types';

export default function getDelegatesCounts(allDelegatesWithNames: AllDelegatesEntryWithName[]): {
  constitutionalDelegatesCount: number;
  shadowDelegatesCount: number;
  totalDelegatesCount: number;
} {
  const rawConstitutionalDelegates = allDelegatesWithNames.filter(
    delegate => !delegate.expired && delegate.name
  );

  const constitutionalDelegatesCount = new Set(rawConstitutionalDelegates.map(delegate => delegate.name))
    .size;
  const shadowDelegatesCount =
    allDelegatesWithNames.filter(delegate => !delegate.expired).length - rawConstitutionalDelegates.length;
  const totalDelegatesCount = constitutionalDelegatesCount + shadowDelegatesCount;

  return { constitutionalDelegatesCount, shadowDelegatesCount, totalDelegatesCount };
}
