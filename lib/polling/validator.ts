import matter from 'gray-matter';
import isEmpty from 'lodash/isEmpty';
import difference from 'lodash/difference';
import { VoteTypesArray } from '../../types/voteTypes';

// find the most up-to-date list here:
// https://github.com/makerdao/community/blob/master/governance/polls/meta/categories.json
const validCategories = [
  'Auctions',
  'Collateral',
  'Governance',
  'Greenlight',
  'MIPs',
  'Oracles',
  'Other',
  'Rates',
  'Risk Variable',
  'Technical'
];

type ValidationResult = {
  valid: boolean;
  errors: string[];
};

export async function validateUrl(url: string): Promise<ValidationResult> {
  const resp = await fetch(url);
  const text = await resp.json();
  return validateText(text);
}

export function validateText(text: string): ValidationResult {
  try {
    const { data, content } = matter(text);
    if (!content) return { valid: false, errors: ['Document is blank'] };
    if (isEmpty(data)) return { valid: false, errors: ['Front matter is blank'] };
    const errors: string[] = [];

    // vote type
    if (!VoteTypesArray.includes(data.vote_type)) errors.push(`Invalid vote type: "${data.vote_type}"`);

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
      const invalidCategories = difference(data.categories, validCategories);
      if (invalidCategories.length > 0) errors.push(`Invalid categories: ${invalidCategories.join(', ')}`);
    }

    return { valid: errors.length === 0, errors };
  } catch (err) {
    return { valid: false, errors: [err.message] };
  }
}
