import React from 'react';
import { Text, Box, Label, Textarea } from 'theme-ui';

export default function CommentTextBox({
  value,
  onChange,
  disabled
}: {
  value: string;
  onChange: (e: any) => void;
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
        onChange={onChange}
        value={value}
        disabled={disabled}
      />

      <Text
        as="p"
        variant="text"
        sx={{ fontSize: 1, color: value.length > 1500 ? 'error' : 'textMuted', mt: 1 }}
      >
        Optional. You&apos;ll be prompted to sign a message with your wallet. {1500 - value.length} characters
        remaining. Commenting is not yet supported for multisig users.
      </Text>
    </Box>
  );
}
