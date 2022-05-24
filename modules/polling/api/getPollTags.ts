import { Tag } from 'modules/app/types/tag.dt';

import pollTags from 'modules/tags/constants/poll-tags-definitions.json';
import pollTagsMapping from 'modules/tags/constants/poll-tags-mapping.json';
export function getPollTags(): Tag[] {
  return pollTags;
}

export function getPollTagsMapping(): { [key: number]: string[] } {
  return pollTagsMapping;
}
