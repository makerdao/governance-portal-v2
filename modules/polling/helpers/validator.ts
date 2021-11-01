import matter from 'gray-matter';
import isEmpty from 'lodash/isEmpty';
import difference from 'lodash/difference';
import { Poll, PartialPoll } from 'modules/polling/types';
import { parsePollMetadata } from './parser';
import { POLL_VOTE_TYPES_ARRAY } from '../polling.constants';

// find the most up-to-date list here:
// https://github.com/makerdao/community/blob/master/governance/polls/meta/categories.json
const hardcodedCategories = [
  'Collateral',
  'Oracles',
  'Governance',
  'Risk Variable',
  'Technical',
  'Other',
  'MIPs',
  'Rates',
  'Auctions',
  'Greenlight',
  'Transfer',
  'Budget',
  'Core Unit',
  'Test',
  'Offboard'
];

type ValidationResult = {
  valid: boolean;
  errors: string[];
  parsedData?: Poll;
  wholeDoc?: string;
};

export async function fetchCategories(): Promise<string[] | null> {
  try {
    const url =
      'https://raw.githubusercontent.com/makerdao/community/master/governance/polls/meta/categories.json';
    const resp = await fetch(url);
    return resp.json();
  } catch (err) {
    return null;
  }
}

export async function validateUrl(url: string, poll?: PartialPoll): Promise<ValidationResult> {
  const resp = await fetch(url);
  const text = await resp.text();

  const liveCategories = await fetchCategories();
  // fallback to hardcoded categories if live category fetch fails
  const result = validateText(text, liveCategories ?? hardcodedCategories);
  if (result.valid && poll) {
    result.wholeDoc = text;
    result.parsedData = parsePollMetadata(poll, text);
  }
  return result;
}

export function validateText(text: string, categories: string[]): ValidationResult {
  try {
    const { data, content } = matter(text);
    if (!content) return { valid: false, errors: ['Document is blank'] };
    if (isEmpty(data)) return { valid: false, errors: ['Front matter is blank'] };
    const errors: string[] = [];

    // vote type
    if (!POLL_VOTE_TYPES_ARRAY.includes(data.vote_type)) {
      errors.push(`Invalid vote type: "${data.vote_type}"`);
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

    // category
    if (!data.categories || isEmpty(data.categories)) {
      errors.push('Categories are missing');
    } else {
      const invalidCategories = difference(data.categories, categories);
      if (invalidCategories.length > 0) errors.push(`Invalid categories: ${invalidCategories.join(', ')}`);
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

    return { valid: errors.length === 0, errors };
  } catch (err) {
    return { valid: false, errors: [err.message] };
  }
}
