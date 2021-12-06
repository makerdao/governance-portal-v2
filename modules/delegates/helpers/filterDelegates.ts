import { DelegateStatusEnum } from '../delegates.constants';
import { Delegate } from '../types';

export function filterDelegates(
  delegates: Delegate[],
  showShadow: boolean,
  showRecognized: boolean
): Delegate[] {
  return delegates.filter(delegate => {
    // Return all if unchecked
    if (!showShadow && !showRecognized) {
      return true;
    }

    if (!showShadow && delegate.status === DelegateStatusEnum.shadow) {
      return false;
    }

    if (!showRecognized && delegate.status === DelegateStatusEnum.recognized) {
      return false;
    }
    // Apply all filters from the store
    return true;
  });
}
