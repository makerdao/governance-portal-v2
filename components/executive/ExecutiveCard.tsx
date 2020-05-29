import Link from 'next/link';
import useSWR from 'swr';
import { NavLink, Text, Flex, Badge, Box } from 'theme-ui';
import Skeleton from 'react-loading-skeleton';

import getMaker, { getNetwork } from '../../lib/maker';
import CurrencyObject from '../../types/currency';

export default function ExecutiveCard({ proposal, isHat }) {
  const network = getNetwork();

  const { data: mkrSupport } = useSWR<CurrencyObject>(
    [`/executive/mkr-support`, proposal.source],
    (_, spellAddress) => getMaker().then(maker => maker.service('chief').getApprovalCount(spellAddress))
  );

  return (
    <Flex p="4" mx="auto" my="3" variant="cards.primary" sx={{ boxShadow: 'faint', height: '210px' }}>
      <Flex
        sx={{
          width: '100%',
          flexDirection: 'column',
          justifyContent: 'space-between'
        }}
      >
        <Link
          href={{
            pathname: '/executive/[proposal-id]',
            query: { network }
          }}
          as={{
            pathname: `/executive/${proposal.key}`,
            query: { network }
          }}
        >
          <Text
            sx={{
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              fontSize: [3, 4],
              color: '#231536'
            }}
          >
            {proposal.title}
          </Text>
        </Link>
        <Text
          sx={{
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            fontSize: [3, 4],
            color: '#434358',
            opacity: 0.8
          }}
        >
          {proposal.proposal_blurb}
        </Text>
        <Flex>
          <Link
            href={{
              pathname: '/executive/[proposal-id]',
              query: { network }
            }}
            as={{
              pathname: `/executive/${proposal.key}`,
              query: { network }
            }}
          >
            <NavLink variant="buttons.primary">Vote on proposal</NavLink>
          </Link>
          <Flex sx={{ alignItems: 'cetner' }}>
            {mkrSupport ? (
              <>
                <Badge
                  mx="3"
                  variant="primary"
                  sx={{
                    borderColor: '#231536',
                    color: '#231536',
                    textTransform: 'uppercase',
                    alignSelf: 'center'
                  }}
                >
                  {mkrSupport.toString()} Supporting
                </Badge>
                {isHat ? (
                  <Badge
                    mx="2"
                    variant="primary"
                    sx={{
                      borderColor: '#098C7D',
                      color: '#098C7D',
                      textTransform: 'uppercase',
                      alignSelf: 'center'
                    }}
                  >
                    Governing proposal
                  </Badge>
                ) : null}
              </>
            ) : (
              <Box m="auto" ml="3" sx={{ width: '200px' }}>
                <Skeleton />
              </Box>
            )}
          </Flex>
        </Flex>
      </Flex>
    </Flex>
  );
}
