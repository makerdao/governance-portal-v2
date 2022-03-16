import BigNumber from 'bignumber.js';
import { parseUnits } from 'ethers/lib/utils';
import { formatValue } from 'lib/string';
import { Box, Text, Flex, Button, Heading, Container } from 'theme-ui';
import { Delegate } from '../types';
import Stack from 'modules/app/components/layout/layouts/Stack';

export default function TopDelegates({
  delegates,
  totalMKRDelegated
}: {
  delegates: Delegate[];
  totalMKRDelegated: BigNumber;
}): React.ReactElement {
  return (
    <Box>
      <Container sx={{ textAlign: 'center', maxWidth: 'title' }}>
        <Stack gap={2}>
          <Heading as="h2">Top Delegates</Heading>
          <Text as="p" sx={{ color: 'textSecondary', px: 'inherit', fontSize: [2, 4] }}>
            Delegates ranking by their voting power
          </Text>
        </Stack>
      </Container>
      <Box>
        <Flex>
          <Box>
            <Text>Address</Text>
          </Box>
          <Box>
            <Text>Delegators</Text>
          </Box>
          <Box>
            <Text>Voting Power</Text>
          </Box>
          <Box>
            <Text>MKR</Text>
          </Box>
        </Flex>
        {delegates.map((delegate, index) => {
          return (
            <Box key={`top-delegate-${index}`}>
              <Flex>
                <Box p={2}>
                  <Text>{delegate.name}</Text>
                </Box>
                <Box p={2}>
                  <Text>
                    {delegate.delegationHistory.filter(i => new BigNumber(i.lockAmount).gt(0)).length}
                  </Text>
                </Box>
                <Box p={2}>
                  <Text>
                    {new BigNumber(delegate.mkrDelegated).div(totalMKRDelegated).multipliedBy(100).toFixed(2)}
                    %
                  </Text>
                </Box>
                <Flex p={2}>
                  <Text>{formatValue(parseUnits(delegate.mkrDelegated))} MKR </Text>
                  <Button>Delegate</Button>
                </Flex>
              </Flex>
            </Box>
          );
        })}
      </Box>
    </Box>
  );
}
