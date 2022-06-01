import { Tag } from 'modules/app/types/tag';

import delegateTags from 'modules/tags/constants/delegates-tags-definitions.json';

export function getDelegateTags(): Tag[] {
  return delegateTags;
}
