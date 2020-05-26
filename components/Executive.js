import { Heading, NavLink, Container, Text, Box, Flex, Badge } from 'theme-ui';
import Link from 'next/link';

export default function ExecutiveProposals({ proposals, network }) {
  return (
    <Container
      as="section"
      sx={{
        textAlign: 'center'
      }}
    >
      <Box mx="auto" sx={{ maxWidth: 9 }}>
        <Heading as="h2">Executive Votes</Heading>
        <Text
          mx="auto"
          mt="3"
          as="p"
          sx={{ fontSize: [3, 5], color: '#434358', lineHeight: 'body' }}
        >
          Executive Votes are conducted to make changes to the system. The
          governing proposal represents the current state of the system.
        </Text>
      </Box>
      <Box mx="auto" sx={{ textAlign: 'left', maxWidth: 10 }}>
        <Container py="4">
          {proposals.map((proposal, index) => (
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
                    fontSize: [5, 5],
                    color: 'text',
                    fontWeight: '500'
                  }}
                >
                  {proposal.title}
                </Text>
                {/*<Link
                key={proposal.key}
                href={{
                  pathname: '/executive/[proposal-id]',
                  query: { network }
                }}
                as={{
                  pathname: `/executive/${proposal.key}`,
                  query: { network }
                }}
              >
                <NavLink>{proposal.title}</NavLink>
              </Link>*/}
                <Text
                  sx={{
                    fontSize: [3, 4],
                    color: '#434358'
                  }}
                >
                  {proposal.proposal_blurb}
                </Text>
                <Flex>
                  <Link
                    key={index}
                    href={{
                      pathname: '/executive/[proposal-id]',
                      query: { network }
                    }}
                    as={{
                      pathname: `/executive/${proposal.key}`,
                      query: { network }
                    }}
                  >
                    <NavLink variant="buttons.primary">
                      Vote on proposal
                    </NavLink>
                  </Link>
                  <Badge
                    variant="primary"
                    sx={{ textTransform: 'uppercase', alignSelf: 'center' }}
                  >
                    Governing Proposal
                  </Badge>
                </Flex>
              </Flex>
            </Flex>
          ))}
        </Container>
      </Box>
    </Container>
  );
}
