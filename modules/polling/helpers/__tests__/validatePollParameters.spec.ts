import matter from 'gray-matter';
import { POLL_VOTE_TYPE } from 'modules/polling/polling.constants';
import {
  ERRORS_VALIDATE_POLL_PARAMETERS,
  oldVoteTypeToNewParameters,
  validatePollParameters
} from '../validatePollParameters';

describe('parse poll parameters', () => {
  it('should error if it misses input_format', () => {
    const parameters = `---
parameters:
        test: test
---
        `;

    const parametersMarkdown = matter(parameters);
    // Returns correct if is correct
    const [parsed, errors] = validatePollParameters(parametersMarkdown.data.parameters);
    expect(parsed).toBe(null);
    expect(errors.length).toBeGreaterThan(0);

    expect(errors[0]).toEqual(ERRORS_VALIDATE_POLL_PARAMETERS.missingInputFormat);
  });

  it('should error if it invalid input_format', () => {
    const parameters = `---
parameters:
    input_format: test
---
# hello

    `;
    const parametersMarkdown = matter(parameters);
    // Returns correct if is correct
    const [parsed, errors] = validatePollParameters(parametersMarkdown.data.parameters);
    expect(parsed).toBe(null);
    expect(errors.length).toBeGreaterThan(0);

    expect(errors[0]).toEqual(ERRORS_VALIDATE_POLL_PARAMETERS.invalidInputFormat);
  });

  it('should error if it missing victory_conditions ', () => {
    const parameters = `---
parameters:
    input_format: single-choice

---
# hello

    `;
    const parametersMarkdown = matter(parameters);
    // Returns correct if is correct
    const [parsed, errors] = validatePollParameters(parametersMarkdown.data.parameters);
    expect(parsed).toBe(null);
    expect(errors.length).toBeGreaterThan(0);

    expect(errors[0]).toEqual(ERRORS_VALIDATE_POLL_PARAMETERS.missingVictoryConditions);
  });

  it('should error if victory_conditions is not an array ', () => {
    const parameters = `---
parameters:
    input_format: single-choice
    victory_conditions: test

---
# hello

    `;
    const parametersMarkdown = matter(parameters);
    // Returns correct if is correct
    const [parsed, errors] = validatePollParameters(parametersMarkdown.data.parameters);
    expect(parsed).toBe(null);
    expect(errors.length).toBeGreaterThan(0);

    expect(errors[0]).toEqual(ERRORS_VALIDATE_POLL_PARAMETERS.victoryConditionsNotArray);
  });

  it('should error if victory_conditions combine instant-runoff and plurality', () => {
    const parameters = `---
parameters:
    input_format: single-choice
    victory_conditions:
      - { type : 'plurality' }
      - { type: 'instant-runoff'}

---
# hello

    `;
    const parametersMarkdown = matter(parameters);
    // Returns correct if is correct
    const [parsed, errors] = validatePollParameters(parametersMarkdown.data.parameters);
    expect(parsed).toBe(null);
    expect(errors.length).toBeGreaterThan(0);

    expect(errors[0]).toEqual(ERRORS_VALIDATE_POLL_PARAMETERS.victoryConditionsInvalidCombination);
  });

  it('should error if victory_condition plurality does not have input_format single-choice conditions', () => {
    const parameters = `---
parameters:
    input_format: rank-free
    victory_conditions:
      - { type : 'plurality' }

---
# hello

    `;
    const parametersMarkdown = matter(parameters);
    // Returns correct if is correct
    const [parsed, errors] = validatePollParameters(parametersMarkdown.data.parameters);
    expect(parsed).toBe(null);
    expect(errors.length).toBeGreaterThan(0);

    expect(errors[0]).toEqual(ERRORS_VALIDATE_POLL_PARAMETERS.pluralityRequiresSingleChoice);
  });

  it('should error if victory_conditions instant-runoff does not have a rank-free input format', () => {
    const parameters = `---
parameters:
    input_format: single-choice
    victory_conditions:
      - { type : 'instant-runoff' }

---
# hello

    `;
    const parametersMarkdown = matter(parameters);
    // Returns correct if is correct
    const [parsed, errors] = validatePollParameters(parametersMarkdown.data.parameters);
    expect(parsed).toBe(null);
    expect(errors.length).toBeGreaterThan(0);

    expect(errors[0]).toEqual(ERRORS_VALIDATE_POLL_PARAMETERS.instantRunoffRequiresRankFree);
  });

  it('should error if result_display is missing', () => {
    const parameters = `---
parameters:
    input_format: single-choice
    victory_conditions:
      - { type : 'plurality' }
    result_display: 
---
# hello

    `;
    const parametersMarkdown = matter(parameters);
    // Returns correct if is correct
    const [parsed, errors] = validatePollParameters(parametersMarkdown.data.parameters);
    expect(parsed).toBe(null);
    expect(errors.length).toBeGreaterThan(0);

    expect(errors[0]).toEqual(ERRORS_VALIDATE_POLL_PARAMETERS.requiredResultDisplay);
  });

  it('should error if input_format single-choice does not have result_display single-vote-breakdown', () => {
    const parameters = `---
parameters:
    input_format: single-choice
    victory_conditions:
      - { type : 'plurality' }
    result_display: 'other'
---
# hello

    `;
    const parametersMarkdown = matter(parameters);
    // Returns correct if is correct
    const [parsed, errors] = validatePollParameters(parametersMarkdown.data.parameters);
    expect(parsed).toBe(null);
    expect(errors.length).toBeGreaterThan(0);

    expect(errors[0]).toEqual(ERRORS_VALIDATE_POLL_PARAMETERS.singleChoiceRequiresSingleVoteBreakdownDisplay);
  });

  it('should be ok for plurality', () => {
    const parameters = `---
parameters:
    input_format: single-choice
    victory_conditions:
      - { type : 'plurality' }
    result_display: 'single-vote-breakdown'
---
# hello

    `;
    const parametersMarkdown = matter(parameters);
    // Returns correct if is correct
    const [parsed, errors] = validatePollParameters(parametersMarkdown.data.parameters);
    expect(parsed).toEqual({
      inputFormat: 'single-choice',
      victoryConditions: [{ type: 'plurality' }],
      resultDisplay: 'single-vote-breakdown'
    });
    expect(errors.length).toBe(0);
  });

  it('should error if input_format rank-free does not have result_display instant-runoff-breakdown', () => {
    const parameters = `---
parameters:
    input_format: rank-free
    victory_conditions:
      - { type : 'instant-runoff' }
    result_display: 'other'
---
# hello

    `;
    const parametersMarkdown = matter(parameters);
    // Returns correct if is correct
    const [parsed, errors] = validatePollParameters(parametersMarkdown.data.parameters);
    expect(parsed).toBe(null);
    expect(errors.length).toBeGreaterThan(0);

    expect(errors[0]).toEqual(ERRORS_VALIDATE_POLL_PARAMETERS.rankFreeRequiresInstantRunoffBreakdownDisplay);
  });

  it('should be ok for rank-free', () => {
    const parameters = `---
parameters:
    input_format: rank-free
    victory_conditions:
      - { type : 'instant-runoff' }
    result_display: 'instant-runoff-breakdown'
---
# hello

    `;
    const parametersMarkdown = matter(parameters);
    // Returns correct if is correct
    const [parsed, errors] = validatePollParameters(parametersMarkdown.data.parameters);
    expect(parsed).toEqual({
      inputFormat: 'rank-free',
      victoryConditions: [{ type: 'instant-runoff' }],
      resultDisplay: 'instant-runoff-breakdown'
    });
    expect(errors.length).toBe(0);
  });

  it('should error if victory_conditions does not include any valid condition', () => {
    const parameters = `---
parameters:
    input_format: single-choice
    victory_conditions:

---
# hello

    `;
    const parametersMarkdown = matter(parameters);
    // Returns correct if is correct
    const [parsed, errors] = validatePollParameters(parametersMarkdown.data.parameters);
    expect(parsed).toBe(null);
    expect(errors.length).toBeGreaterThan(0);

    expect(errors[0]).toEqual(ERRORS_VALIDATE_POLL_PARAMETERS.missingVictoryConditions);
  });

  // TODO: Majority support
  //   it('should return valid for a correct structure', () => {
  //     const parameters = `
  // parameters:
  //   input_format: single-choice
  //   victory_conditions:
  //     - { type : majority: options: [1,2,3,4] }
  //     - { type : comparison, options: [0, 1, 4], comparator : '>=10000' }
  //     - { type : default, options : [2] }
  //   result_display: single-vote-breakdown
  // `;
  //     const parametersMarkdown = matter(parameters);
  //     // Returns correct if is correct
  //     const [parsed, errors] = validatePollParameters(parametersMarkdown.data);
  //   });
});

describe('Transform old vote type to new parameters', () => {
  it('transforms plurality to new structure', () => {
    const result = oldVoteTypeToNewParameters(POLL_VOTE_TYPE.PLURALITY_VOTE);
    expect(result).toEqual({
      inputFormat: 'single-choice',
      victoryConditions: [{ type: 'plurality' }],
      resultDisplay: 'single-vote-breakdown'
    });
  });

  it('transforms IRV to new structure', () => {
    const result = oldVoteTypeToNewParameters(POLL_VOTE_TYPE.RANKED_VOTE);
    expect(result).toEqual({
      inputFormat: 'rank-free',
      victoryConditions: [{ type: 'instant-runoff' }],
      resultDisplay: 'instant-runoff-breakdown'
    });
  });
});
