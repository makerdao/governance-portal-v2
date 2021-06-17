import { Box, Flex, Text } from '@theme-ui/components';
import React from 'react';
import { Delegate } from 'types/delegate';

type PropTypes = {
  delegate: Delegate;
};

export default function DelegateCard({ delegate }: PropTypes): React.ReactElement {
  return (
    <Box sx={{ flexDirection: 'row', justifyContent: 'space-between', variant: 'cards.primary' }}>
      <Box>
        <Text variant="microHeading" sx={{ fontSize: [3, 5] }}>
          {delegate.name}
        </Text>
        <Text
          sx={{
            fontSize: [2, 3],
            color: 'textSecondary',
            mt: 1
          }}
        >
          {delegate.description}
        </Text>
      </Box>
    </Box>
  );
}
