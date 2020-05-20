import {
  Heading,
  NavLink,
  Container,
  Text,
  Box,
  Flex,
  Badge,
} from 'theme-ui';
import Link from 'next/link';

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
          {activePolls.map((poll, index) => (
            <Flex
              key={index}
              p="4"
              mx="auto"
              variant="cards.primary"
              sx={{ boxShadow: 'faint', height: '210px' }}
              mb="3"
            >
              <Flex
                sx={{
                  flexDirection: 'column',
                  justifyContent: 'space-between'
                }}
              >
                <Text
                  sx={{
                    fontSize: [2, 3],
                    color: '#708390',
                    textTransform: 'uppercase'
                  }}
                >
                  Posted{' '}
                  {new Date(poll.startDate).toLocaleString('default', {
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric'
                  })}
                </Text>
                <Link
                  key={poll.multiHash}
                  href={{
                    pathname: '/polling/[poll-hash]',
                    query: { network }
                  }}
                  as={{
                    pathname: `/polling/${poll.multiHash}`,
                    query: { network }
                  }}
                >
                  <Text
                    sx={{
                      fontSize: [3, 4],
                      color: '#231536'
                    }}
                  >
                    {poll.title}
                  </Text>
                </Link>
                <Text
                  sx={{
                    fontSize: [3, 4],
                    color: '#434358'
                  }}
                >
                  {poll.summary}
                </Text>
                <Flex sx={{ justifyContent: 'space-around' }}>
                  <Link
                    key={poll.multiHash}
                    href={{
                      pathname: '/polling/[poll-hash]',
                      query: { network }
                    }}
                    as={{
                      pathname: `/polling/${poll.multiHash}`,
                      query: { network }
                    }}
                  >
                    <NavLink variant="buttons.outline">
                      View Proposal
                    </NavLink>
                  </Link>
                  <Badge
                    variant="primary"
                    sx={{ textTransform: 'uppercase', alignSelf: 'center' }}
                  >
                    Leading Option:{' '}
                    {'Increase Stability fee by 1.50% to 7.50%'}
                  </Badge>
                </Flex>
              </Flex>
            </Flex>
          ))}
        </Container>
      </Box>
    </Container>
  )
}
