import { PollInputFormat, PollParameters } from '../types/poll.d.ts';

export const ERRORS_VALIDATE_POLL_PARAMETERS = {
    missingInputFormat: 'Missing input_format on poll parameters',
    invalidInputFormat: 'Invalid input_format. Supported values are rank-free and single-choice',
    missingVictoryConditions: 'Missing victory_conditions',
    victoryConditionsNotArray: 'victory_conditions should be an array'
}

export function validatePollParameters(params: Record<string, unknown>): [PollParameters|null, string[]] {
  // cons parameters
  const parameters: Partial<PollParameters> = {};
console.log(params)
  const errors: string[] = [];
  if (!params.input_format) {
    errors.push(ERRORS_VALIDATE_POLL_PARAMETERS.missingInputFormat);
  } else if (
    params.input_format !== PollInputFormat.rankFree &&
    params.input_format !== PollInputFormat.singleChoice
  ) {
    errors.push(ERRORS_VALIDATE_POLL_PARAMETERS.invalidInputFormat);
  } else {
    parameters.inputFormat = params.input_format;
  }

  if (!params.victory_conditions) {
      errors.push(ERRORS_VALIDATE_POLL_PARAMETERS.missingVictoryConditions)
  } else if (!Array.isArray(params.victory_conditions)) {
      errors.push(ERRORS_VALIDATE_POLL_PARAMETERS.victoryConditionsNotArray)
  }

  // There are errors, return a empty object and the list of errors
  if (errors.length > 0) {
    return [null, errors];
  } else {
      // Correct object
    return [parameters as PollParameters, []];
  }
}
