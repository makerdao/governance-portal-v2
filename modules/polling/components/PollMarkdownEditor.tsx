import { useEffect, useState } from 'react';
import { Box, Text } from 'theme-ui';
import {
  findVictoryCondition,
  hasVictoryConditionApproval,
  hasVictoryConditionComparison,
  hasVictoryConditionDefault,
  hasVictoryConditionInstantRunOff,
  hasVictoryConditionMajority,
  hasVictoryConditionPlurality
} from '../helpers/utils';
import { validatePollMarkdown } from '../helpers/validator';
import { PollVictoryConditions } from '../polling.constants';

export function PollMarkdownEditor(): React.ReactElement {
  const [markdown, setMarkdown] = useState('');
  const [errors, setErrors] = useState<string[]>([]);
  const [winningConditions, setWinningConditions] = useState('');

  useEffect(() => {
    const result = validatePollMarkdown(markdown);
    if (result.parsedData) {
      let victoryCondition = '';
      if (hasVictoryConditionApproval(result.parsedData.parameters.victoryConditions)) {
        victoryCondition += '\nApproval.';
      }
      if (hasVictoryConditionMajority(result.parsedData.parameters.victoryConditions)) {
        victoryCondition += `\nMajority (${findVictoryCondition(
          result.parsedData.parameters.victoryConditions,
          PollVictoryConditions.majority
        ).map(a => (a as any).percent)})`;
      }

      if (hasVictoryConditionPlurality(result.parsedData.parameters.victoryConditions)) {
        victoryCondition += '\nPlurality';
      }

      if (hasVictoryConditionInstantRunOff(result.parsedData.parameters.victoryConditions)) {
        victoryCondition += '\nInstant Runoff';
      }

      if (hasVictoryConditionComparison(result.parsedData.parameters.victoryConditions)) {
        victoryCondition += `\nComparison (${findVictoryCondition(
          result.parsedData.parameters.victoryConditions,
          PollVictoryConditions.comparison
        ).map(a => (a as any).comparator + ' ' + (a as any).value)})`;
      }

      if (hasVictoryConditionDefault(result.parsedData.parameters.victoryConditions)) {
        victoryCondition += `\nDefault (${findVictoryCondition(
          result.parsedData.parameters.victoryConditions,
          PollVictoryConditions.default
        ).map(a => (a as any).value)})`;
      }
      const text = `
      Winning condition: -${victoryCondition}
      `;
      setWinningConditions(text);
    }
    setErrors(result.errors || []);
  }, [markdown]);

  return (
    <Box>
      <textarea
        sx={{ p: 3, width: '100%' }}
        value={markdown}
        placeholder="Poll Markdown"
        onChange={e => {
          setMarkdown(e.target.value);
        }}
        rows={20}
      />

      {errors.length > 0 && <h2>Errors</h2>}
      {winningConditions && <p>{winningConditions}</p>}
      {errors.length === 0 && <h2>No errors</h2>}
      {errors.map((error, index) => {
        return (
          <Box key={`error-${index}`}>
            <Text sx={{ color: 'red' }}>{error}</Text>
          </Box>
        );
      })}
    </Box>
  );
}
