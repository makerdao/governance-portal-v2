import { DelegateStatusEnum } from '../delegates.constants';
import { Delegate } from '../types';

export function filterDelegates(
  delegates: Delegate[],
  showShadow: boolean,
  showRecognized: boolean,
  name: string | null,
  tags?: string[]
): Delegate[] {
  return (
    delegates
      // name filter
      .filter(delegate => {
        if (!name || name === '') return true;

        return delegate.name.toLowerCase().includes(name.toLowerCase());
      })
      .filter(delegate => {
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

        return true;
      })
      // Filter by tags
      .filter(delegate => {
        if (tags && tags.length > 0) {
          return delegate.tags.filter(tag => tags.indexOf(tag.id) !== -1).length > 0;
        }

        return true;
      })
  );
}
