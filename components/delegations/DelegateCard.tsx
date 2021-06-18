import { Box, Button, Flex, Text } from '@theme-ui/components';
import React from 'react';
import getMaker, { MKR } from '../../lib/maker';
import { Delegate } from 'types/delegate';

type PropTypes = {
  delegate: Delegate;
};

export default function DelegateCard({ delegate }: PropTypes): React.ReactElement {
  const approveMkr = async () => {
    const maker = await getMaker();
    const tx = maker.getToken(MKR).approveUnlimited(delegate.address);
  };

  const lockMkr = async () => {
    const maker = await getMaker();
    const tx = await maker.service('voteDelegate').lock(delegate.address, 0.1);
    console.log(tx);
  };

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
        <Button onClick={approveMkr}>Approve MKR</Button>
        <Button onClick={lockMkr}>Lock 0.1 MKR</Button>
      </Box>
    </Box>
  );
}
