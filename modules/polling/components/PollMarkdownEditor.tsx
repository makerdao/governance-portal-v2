import { useEffect, useState } from 'react';
import { Box, Text } from 'theme-ui';
import { validatePollMarkdown } from '../helpers/validator';

export function PollMarkdownEditor(): React.ReactElement {
  const [markdown, setMarkdown] = useState('');
  const [errors, setErrors] = useState<string[]>([]);

  useEffect(() => {
    // Verify
    const result = validatePollMarkdown(markdown);
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

      <h2>Errors</h2>
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
