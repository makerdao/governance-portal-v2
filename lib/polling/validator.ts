import matter from 'gray-matter';
import isEmpty from 'lodash/isEmpty';
import { VoteTypesArray } from '../../types/voteTypes';

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

    // vote options
    // start time
    // end time
    // duration is large enough
    // vote type
    if (!VoteTypesArray.includes(data.vote_type)) errors.push(`Invalid vote type: "${data.vote_type}"`);
    // category

    return { valid: errors.length === 0, errors };
  } catch (err) {
    return { valid: false, errors: [err.message] };
  }
}
