import { DelegateStatusEnum } from '../delegates.constants';
import { Delegate } from '../types';

export function filterDelegates(
  delegates: Delegate[],
  showShadow: boolean,
  showRecognized: boolean,
  tags?: string[]
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

    // Filter by tags
    if (tags && tags.length > 0) {
      return delegate.tags.filter(tag => tags.indexOf(tag.id) !== -1).length > 0;
    }
    // Apply all filters from the store
    return true;
  });
}
