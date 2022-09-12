import matter from 'gray-matter';
import isEmpty from 'lodash/isEmpty';
import { Poll, PartialPoll } from 'modules/polling/types';
import { parsePollMetadata } from './parsePollMetadata';
import { POLL_VOTE_TYPES_ARRAY } from '../polling.constants';
import { validatePollParameters } from './validatePollParameters';
import { getPollTagsMapping } from '../api/getPollTags';

type ValidationResult = {
  valid: boolean;
  errors: string[];
  parsedData?: Poll;
  wholeDoc?: string;
};

export async function validatePollFromRawURL(url: string, poll?: PartialPoll): Promise<ValidationResult> {
  const resp = await fetch(url);
  const text = await resp.text();
  const result = validatePollMarkdown(text);
  const tagsMapping = await getPollTagsMapping();
  if (result.valid && poll) {
    result.wholeDoc = text;
    result.parsedData = await parsePollMetadata(poll, text, tagsMapping);
  }
  return result;
}

export function validatePollMarkdown(text: string): ValidationResult {
  try {
    const { data, content } = matter(text);
    if (!content) return { valid: false, errors: ['Document is blank'] };
    if (isEmpty(data)) return { valid: false, errors: ['Front matter is blank'] };
    const errors: string[] = [];

    // poll parameters | vote type. Vote type is for old polls, parameters for new polls
    if (data.vote_type && !POLL_VOTE_TYPES_ARRAY.includes(data.vote_type)) {
      errors.push(`Invalid vote type: "${data.vote_type}"`);
    }
    let parameters, errorParameters;
    if (!data.vote_type) {
      [parameters, errorParameters] = validatePollParameters(data.parameters);
      if (!parameters) {
        errorParameters.forEach(e => errors.push(e));
      }
    }

    // vote options
    if (!data.options) {
      errors.push('Vote options are missing');
    } else if (typeof data.options !== 'object') {
      errors.push('Vote options must be a numbered list');
    } else {
      try {
        if (Object.keys(data.options).some(x => x !== parseInt(x).toString())) {
          errors.push('Vote option IDs must be numbers');
        }
      } catch (_) {
        errors.push('Vote options are invalid');
      }
    }

    let startDate, endDate;

    // start date
    if (!data.start_date) {
      errors.push('Start date is missing');
    } else {
      if (!(data.start_date instanceof Date) || isNaN(data.start_date.getTime()))
        errors.push('Invalid start date (should be like "2020-08-16T08:00:00")');
      else startDate = data.start_date;
    }

    // end date
    if (!data.end_date) {
      errors.push('End date is missing');
    } else {
      if (!(data.end_date instanceof Date) || isNaN(data.end_date.getTime()))
        errors.push('Invalid end date (should be like "2020-08-16T08:00:00")');
      else endDate = data.end_date;
    }

    if (startDate && endDate && endDate.getTime() - startDate.getTime() < 3600000)
      errors.push('Poll duration is too short');

    return {
      valid: errors.length === 0,
      errors,
      parsedData:
        errors.length === 0
          ? ({
              ...data,
              parameters
            } as any)
          : null
    };
  } catch (err) {
    return { valid: false, errors: [err.message] };
  }
}
