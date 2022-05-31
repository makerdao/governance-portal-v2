import { fsCacheGet, fsCacheSet } from 'lib/fscache';
import { Tag } from 'modules/app/types/tag.dt';

import pollTags from 'modules/tags/constants/poll-tags-definitions.json';
import pollTagsMapping from 'modules/tags/constants/poll-tags-mapping.json';
export function getPollTags(): Tag[] {
  return pollTags;
}

export async function getPollTagsMapping(): Promise<{ [key: number]: string[] }> {
  try {
    const existingTags = fsCacheGet('poll-tags-mapping');

    if (existingTags) {
      return JSON.parse(existingTags);
    }

    const urlPollTags =
      'https://raw.githubusercontent.com/makerdao/community/master/governance/polls/meta/poll-tags.json';
    const pollTags = await fetch(urlPollTags);
    const dataPollTags = await pollTags.json();

    fsCacheSet('poll-tags-mapping', JSON.stringify(dataPollTags));

    return dataPollTags;
  } catch (e) {
    return pollTagsMapping;
  }
}
