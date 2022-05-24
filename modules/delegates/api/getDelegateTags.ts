import { Tag } from 'modules/app/types/tag.dt';

import delegateTags from 'modules/tags/constants/delegates-tags-definitions.json';

export function getDelegateTags(): Tag[] {
  return delegateTags;
}
