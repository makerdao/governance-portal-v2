import Link from 'next/link';
import useSWR from 'swr';
import { NavLink, Text, Flex, Badge, Box } from 'theme-ui';
import Skeleton from 'react-loading-skeleton';

import getMaker, { getNetwork } from '../../lib/maker';
import CurrencyObject from '../../types/currency';
import Proposal from '../../types/proposal';

type Props = {
  proposal: Proposal;
  isHat: boolean;
};

export default function ExecutiveCard({ proposal, isHat }: Props) {
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
              fontSize: [3, 4]
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
            opacity: 0.8
          }}
        >
          {proposal.proposal_blurb}
        </Text>
        <Flex sx={{ alignItems: 'center', flexWrap: 'wrap', justifyContent: 'space-between' }}>
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
          {mkrSupport ? (
            <>
              <Badge
                variant="primary"
                sx={{
                  borderColor: 'text',
                  textTransform: 'uppercase',
                  alignSelf: 'center'
                }}
              >
                {mkrSupport.toString()} Supporting
              </Badge>
              {isHat ? (
                <Badge
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
  );
}
