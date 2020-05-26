import { Heading, NavLink, Container, Text, Box, Flex, Badge } from 'theme-ui';
import Link from 'next/link';
import PollCard from './PollCard';

export default function Polling({ activePolls, network }) {
  return (
    <Container
      as="section"
      sx={{
        textAlign: 'center'
      }}
    >
      <Box mx="auto" sx={{ maxWidth: 9 }}>
        <Heading as="h2">Polling Votes</Heading>
        <Text
          mx="auto"
          mt="3"
          as="p"
          sx={{ fontSize: [3, 5], color: '#434358', lineHeight: 'body' }}
        >
          Polls are conducted to establish a rough consensus of community
          sentiment before Executive Votes are conducted.
        </Text>
      </Box>
      <Box mx="auto" sx={{ textAlign: 'left', maxWidth: 10 }}>
        <Container py="4">
          {activePolls.map(poll => (
            <PollCard key={poll.id} poll={poll} />
          ))}
        </Container>
      </Box>
    </Container>
  );
}
