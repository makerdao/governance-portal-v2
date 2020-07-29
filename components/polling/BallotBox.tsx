import { useRouter } from 'next/router';
import { Card, Heading, Box, Flex, Button, Text } from 'theme-ui';
import { Icon } from '@makerdao/dai-ui-icons';
import { SupportedNetworks } from '../../lib/constants';
import Poll from '../../types/poll';
import Ballot from '../../types/ballot';

type Props = { ballot: Ballot; activePolls: Poll[]; network: SupportedNetworks };
export default function ({ ballot, activePolls, network }: Props): JSX.Element {
  const ballotLength = Object.keys(ballot).length;
  const votingWeightTotal = 0; // TODO
  const router = useRouter();

  return (
    <Box>
      <Heading mb={3} as="h4">
        Your Ballot
      </Heading>
      <Card variant="compact" p={[0, 0]}>
        <Box p={3} sx={{ borderBottom: '1px solid #D4D9E1' }}>
          <Text sx={{ color: 'onSurface', fontSize: 16, fontWeight: '500' }}>
            {`${ballotLength} of ${activePolls.length} available polls added to ballot`}
          </Text>
          <Flex
            sx={{
              width: '100%',
              height: 2,
              backgroundColor: 'muted',
              mt: 2,
              flexDirection: 'row',
              borderRadius: 'small'
            }}
          >
            {activePolls.map((pollId, index) => (
              <Box
                key={index}
                backgroundColor="muted"
                sx={{
                  flex: 1,
                  borderLeft: index === 0 ? null : '1px solid white',
                  borderTopLeftRadius: index === 0 ? 'small' : null,
                  borderBottomLeftRadius: index === 0 ? 'small' : null,
                  borderTopRightRadius: index === activePolls.length - 1 ? 'small' : null,
                  borderBottomRightRadius: index === activePolls.length - 1 ? 'small' : null,
                  backgroundColor: index < ballotLength ? 'primary' : null
                }}
              />
            ))}
          </Flex>
        </Box>
        <Flex
          p={3}
          sx={{
            borderBottom: '1px solid #D4D9E1',
            justifyContent: 'space-between',
            flexDirection: 'row'
          }}
        >
          <Flex sx={{ flexDirection: 'row' }}>
            <Text color="onSurface">Voting weight for all polls</Text>
            <Icon name="question" ml={1} mt={1} sx={{ paddingTop: '3px' }} />
          </Flex>
          <Text>{`${votingWeightTotal.toFixed(2)} MKR`}</Text>
        </Flex>
        <Flex p={3} sx={{ flexDirection: 'column' }}>
          <Button
            onClick={() => router.push({ pathname: '/polling/review', query: network })}
            variant="primary"
            disabled={!ballotLength}
            sx={{ width: '100%' }}
          >
            Review & Submit Your Ballot
          </Button>
        </Flex>
      </Card>
    </Box>
  );
}
