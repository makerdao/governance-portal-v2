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

    expect(errors[0]).toEqual(
      ERRORS_VALIDATE_POLL_PARAMETERS.victoryConditionsInstantRunOffAndPluralityCanNotBeCombined
    );
  });

  it('should error if victory_conditions combine instant-runoff and majority', () => {
    const parameters = `---
parameters:
    input_format: single-choice
    victory_conditions:
      - { type : 'majority' }
      - { type: 'instant-runoff'}

---
# hello

    `;
    const parametersMarkdown = matter(parameters);
    // Returns correct if is correct
    const [parsed, errors] = validatePollParameters(parametersMarkdown.data.parameters);
    expect(parsed).toBe(null);
    expect(errors.length).toBeGreaterThan(0);

    expect(errors[0]).toEqual(
      ERRORS_VALIDATE_POLL_PARAMETERS.victoryConditionsInstantRunOffAndMajoritynNotBeCombined
    );
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
      inputFormat: {
        type: 'single-choice',
        abstain: [0],
        options: []
      },
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
      inputFormat: {
        type: 'rank-free',
        abstain: [0],
        options: []
      },
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

  it('should enforce "choose-free" input-format if victory condition is approval', () => {
    const parameters = `---
parameters:
    input_format: rank-free
    victory_conditions:
      - { type : 'approval' }
    result_display: 'approval-breakdown'
---
# hello

    `;
    const parametersMarkdown = matter(parameters);

    const [parsed, errors] = validatePollParameters(parametersMarkdown.data.parameters);
    expect(parsed).toBe(null);
    expect(errors.length).toBeGreaterThan(0);

    expect(errors[0]).toEqual(ERRORS_VALIDATE_POLL_PARAMETERS.approvalRequiresChooseFree);
  });

  it('should error if victory_condition approval does not have result_display approval-breakdown', () => {
    const parameters = `---
parameters:
    input_format: choose-free
    victory_conditions:
      - { type : 'approval' }
    result_display: 'other'
---
# hello

    `;
    const parametersMarkdown = matter(parameters);
    // Returns correct if is correct
    const [parsed, errors] = validatePollParameters(parametersMarkdown.data.parameters);
    expect(parsed).toBe(null);
    expect(errors.length).toBeGreaterThan(0);

    expect(errors[0]).toEqual(ERRORS_VALIDATE_POLL_PARAMETERS.approvalRequiresApprovalBreakdownDisplay);
  });

  it('extracts correctly the options for a choose-free', () => {
    const parameters = `---
parameters:
    input_format:
      type: choose-free
      options: [1,2]
    victory_conditions:
      - { type : 'approval' }
    result_display: 'approval-breakdown'
---
# hello
    
        `;
    const parametersMarkdown = matter(parameters);
    // Returns correct if is correct
    const [parsed, errors] = validatePollParameters(parametersMarkdown.data.parameters);
    expect(parsed).toEqual({
      inputFormat: {
        type: 'choose-free',
        abstain: [0],
        options: [1, 2]
      },
      victoryConditions: [{ type: 'approval' }],
      resultDisplay: 'approval-breakdown'
    });
    expect(errors.length).toBe(0);
  });

  it('extracts correctly the abstain option', () => {
    const parameters = `---
parameters:
    input_format:
      type: choose-free
      options: [1,2]
      abstain: [0,4]
    victory_conditions:
      - { type : 'approval' }
    result_display: 'approval-breakdown'
---
# hello
    
        `;
    const parametersMarkdown = matter(parameters);
    // Returns correct if is correct
    const [parsed, errors] = validatePollParameters(parametersMarkdown.data.parameters);
    expect(parsed).toEqual({
      inputFormat: {
        type: 'choose-free',
        abstain: [0, 4],
        options: [1, 2]
      },
      victoryConditions: [{ type: 'approval' }],
      resultDisplay: 'approval-breakdown'
    });
    expect(errors.length).toBe(0);
  });

  it('notifies that the default victory condition misses the option', () => {
    const parameters = `---
parameters:
    input_format:
      type: choose-free
      options: [1,2]
      abstain: [0,4]
    victory_conditions:
      - { type : 'default' }
    result_display: 'approval-breakdown'
---
# hello
        
            `;
    const parametersMarkdown = matter(parameters);
    // Returns correct if is correct
    const [parsed, errors] = validatePollParameters(parametersMarkdown.data.parameters);
    expect(parsed).toEqual(null);
    expect(errors[0]).toEqual(ERRORS_VALIDATE_POLL_PARAMETERS.victoryConditionDefaultRequiresDefaultValue);
  });

  it('notifies that the majority victory condition requires a percent', () => {
    const parameters = `---
parameters:
    input_format:
      type: choose-free
      options: [1,2]
      abstain: [0,4]
    victory_conditions:
      - { type : 'majority' }
    result_display: 'approval-breakdown'
---
# hello
        
            `;
    const parametersMarkdown = matter(parameters);
    // Returns correct if is correct
    const [parsed, errors] = validatePollParameters(parametersMarkdown.data.parameters);
    expect(parsed).toEqual(null);
    expect(errors[0]).toEqual(ERRORS_VALIDATE_POLL_PARAMETERS.victoryConditionMajorityRequiresAPercentValue);
  });

  it('notifies that the comparison victory condition requires a valid comparator', () => {
    const parameters = `---
parameters:
    input_format:
      type: choose-free
      options: [1,2]
      abstain: [0,4]
    victory_conditions:
      - { type : 'comparison', comparator: '?', value: 23 }
    result_display: 'approval-breakdown'
---
# hello
        
            `;
    const parametersMarkdown = matter(parameters);
    // Returns correct if is correct
    const [parsed, errors] = validatePollParameters(parametersMarkdown.data.parameters);
    expect(parsed).toEqual(null);
    expect(errors[0]).toEqual(
      ERRORS_VALIDATE_POLL_PARAMETERS.victoryConditionComparisonRequiresValidComparator
    );
  });

  it('notifies that the comparison victory condition requires a valid value', () => {
    const parameters = `---
parameters:
    input_format:
      type: choose-free
      options: [1,2]
      abstain: [0,4]
    victory_conditions:
      - { type : 'comparison', comparator: '>', value: 'abc' }
    result_display: 'approval-breakdown'
---
# hello
        
            `;
    const parametersMarkdown = matter(parameters);
    // Returns correct if is correct
    const [parsed, errors] = validatePollParameters(parametersMarkdown.data.parameters);
    expect(parsed).toEqual(null);
    expect(errors[0]).toEqual(ERRORS_VALIDATE_POLL_PARAMETERS.victoryConditionComparisonRequiresValidValue);
  });

  it('notifies that victory conditions are not objects', () => {
    const parameters = `---
parameters:
    input_format:
      type: choose-free
      options: [1,2]
      abstain: [0,4]
    victory_conditions:
      - [
          { type : approval, options: [1,2,3,4] },
          { type : majority, options: [1,2,3,4], percent : 50 }
        ]
      - { type : default, value : 3 }
    result_display: 'approval-breakdown'
---
# hello
        
            `;
    const parametersMarkdown = matter(parameters);
    // Returns correct if is correct
    const [parsed, errors] = validatePollParameters(parametersMarkdown.data.parameters);
    expect(parsed).toEqual(null);
    expect(errors[0]).toEqual(ERRORS_VALIDATE_POLL_PARAMETERS.invalidVictoryConditions);
  });

  it('requires adding AND conditions', () => {
    const parameters = `---
parameters:
    input_format:
      type: choose-free
      options: [1,2]
      abstain: [0,4]
    victory_conditions:
      - { type : 'and' }
      - { type : 'approval' }
    result_display: 'approval-breakdown'
---
# hello
        
            `;
    const parametersMarkdown = matter(parameters);
    // Returns correct if is correct
    const [parsed, errors] = validatePollParameters(parametersMarkdown.data.parameters);
    expect(parsed).toEqual(null);
    expect(errors[0]).toEqual(ERRORS_VALIDATE_POLL_PARAMETERS.victoryConditionANDRequiresConditions);
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
      inputFormat: {
        type: 'single-choice',
        abstain: [0],
        options: []
      },
      victoryConditions: [{ type: 'plurality' }],
      resultDisplay: 'single-vote-breakdown'
    });
  });

  it('transforms IRV to new structure', () => {
    const result = oldVoteTypeToNewParameters(POLL_VOTE_TYPE.RANKED_VOTE);
    expect(result).toEqual({
      inputFormat: {
        type: 'rank-free',
        abstain: [0],
        options: []
      },
      victoryConditions: [{ type: 'instant-runoff' }],
      resultDisplay: 'instant-runoff-breakdown'
    });
  });
});
