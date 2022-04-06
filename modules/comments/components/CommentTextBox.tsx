import React from 'react';
import { Text, Box, Label, Textarea } from 'theme-ui';

export default function CommentTextBox({
  value,
  onChange,
  disabled
}: {
  value: string;
  onChange: (val: string) => void;
  disabled?: boolean;
}): React.ReactElement {
  return (
    <Box
      sx={{
        borderRadius: 'medium',
        my: 2,
        width: '100%',
        borderColor: 'secondaryMuted'
      }}
    >
      <Label variant="microHeading" sx={{ fontSize: 3, mb: 1 }}>
        Why are you voting for this proposal?
      </Label>
      <Textarea
        data-testid="poll-comment-box"
        sx={{
          color: 'text',
          height: '96px',
          justifyContent: 'flex-start',
          alignItems: 'flex-start',
          display: 'flex',
          resize: 'none'
        }}
        maxLength={1500}
        onChange={event => {
          onChange(event.target.value.substring(0, 1500));
        }}
        value={value}
        disabled={disabled}
      />

      <Text
        as="p"
        variant="text"
        sx={{ fontSize: 1, color: value.length > 1500 ? 'error' : 'textMuted', mt: 1 }}
      >
        Optional. You&apos;ll be prompted to sign a message with your wallet. {1500 - value.length} characters
        remaining.
      </Text>
    </Box>
  );
}
