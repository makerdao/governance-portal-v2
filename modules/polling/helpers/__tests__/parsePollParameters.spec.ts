import matter from 'gray-matter';
import { ERRORS_VALIDATE_POLL_PARAMETERS, validatePollParameters } from '../validatePollParameters';

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

    expect(errors[0]).toEqual(ERRORS_VALIDATE_POLL_PARAMETERS.victoryConditionsNotArray);
  });

  it('should return valid for a correct structure', () => {
    const parameters = `
parameters:
  input_format: single-choice
  victory_conditions:
    - { type : majority: options: [1,2,3,4] }
    - { type : comparison, options: [0, 1, 4], comparator : '>=10000' }
    - { type : default, options : [2] }
  result_display: single-vote-breakdown
`;
    const parametersMarkdown = matter(parameters);
    // Returns correct if is correct
    const [parsed, errors] = validatePollParameters(parametersMarkdown.data);
  });

  it('Returns errors if comparator is missing in a comparison', () => {});
});
