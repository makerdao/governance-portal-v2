import React from 'react';
import { Text, Box, Label, Textarea, Flex } from 'theme-ui';
import { Icon } from '@makerdao/dai-ui-icons';
import { useWeb3React } from '@web3-react/core';
import { getConnection } from 'modules/web3/connections';
import { ConnectionType } from 'modules/web3/constants/wallets';

export default function CommentTextBox({
  value,
  onChange,
  disabled
}: {
  value: string;
  onChange: (val: string) => void;
  disabled?: boolean;
}): React.ReactElement {
  const { connector } = useWeb3React();
  const isGnosis = getConnection(connector).type === ConnectionType.GNOSIS_SAFE;

  return (
    <Box
      sx={{
        borderRadius: 'medium',
        my: 2,
        width: '100%',
        borderColor: 'secondaryMuted'
      }}
    >
      {!isGnosis && (
        <Box>
          <Flex sx={{ justifyContent: 'flex-start' }}>
            <Label variant="microHeading" sx={{ fontSize: 3, mb: 1 }}>
              Why are you voting for this proposal?&nbsp;<Text variant="secondary">(Optional)</Text>
            </Label>
          </Flex>
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
            variant="textSecondary"
            sx={{ fontSize: 1, color: value.length > 1500 ? 'error' : 'textMuted', mt: 1 }}
          >
            {1500 - value.length} characters remaining
          </Text>
        </Box>
      )}
      <Flex sx={{ alignItems: 'center', mt: 2 }}>
        <Icon name="info" color="textSecondary" />
        <Text as="p" variant="secondary" sx={{ ml: 1 }}>
          Commenting is not yet supported for multisig users
        </Text>
      </Flex>
    </Box>
  );
}
