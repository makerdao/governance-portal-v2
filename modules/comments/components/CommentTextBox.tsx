import React from 'react';
import { Text, Box, Label, Textarea } from 'theme-ui';

export default function CommentTextBox({
  value,
  onChange
}: {
  value: string;
  onChange: (val: string) => void;
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
        sx={{
          color: 'text',
          height: '96px',
          justifyContent: 'flex-start',
          alignItems: 'flex-start',
          display: 'flex',
          resize: 'none'
        }}
        maxLength={250}
        onChange={event => {
          onChange(event.target.value.substring(0, 250));
        }}
        value={value}
      />

      <Text
        as="p"
        variant="text"
        sx={{ fontSize: 1, color: value.length > 250 ? 'error' : 'textMuted', mt: 1 }}
      >
        Optional. You&apos;ll be prompted to sign a message with your wallet. {250 - value.length} characters
        remaining.
      </Text>
    </Box>
  );
}
