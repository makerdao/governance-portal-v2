/** @jsx jsx */
import Link from 'next/link';
import useSWR from 'swr';
import { Button, Text, Flex, Badge, Box, jsx } from 'theme-ui';
import Skeleton from 'react-loading-skeleton';

import Stack from '../layouts/Stack';
import getMaker, { getNetwork } from '../../lib/maker';
import CurrencyObject from '../../types/currency';
import Proposal from '../../types/proposal';

type Props = {
  proposal: Proposal;
  isHat: boolean;
};

export default function ExecutiveCard({ proposal, isHat, ...props }: Props): JSX.Element {
  const network = getNetwork();

  const { data: mkrSupport } = useSWR<CurrencyObject>(
    ['/executive/mkr-support', proposal.address],
    (_, spellAddress) => getMaker().then(maker => maker.service('chief').getApprovalCount(spellAddress))
  );

  return (
    <Stack gap={2} sx={{ variant: 'cards.primary' }} {...props}>
      <div>
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
      </div>
      <Text
        sx={{
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          fontSize: [3, 4],
          opacity: 0.8
        }}
      >
        {proposal.proposalBlurb}
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
          <Button>Vote on proposal</Button>
        </Link>
        {mkrSupport ? (
          <Flex sx={{ flex: 1, ml: 3, flexWrap: 'wrap', alignItems: 'flex-start' }}>
            <Badge
              variant="primary"
              sx={{
                textTransform: 'uppercase'
              }}
            >
              {mkrSupport.toBigNumber().toFormat(2)} MKR Supporting
            </Badge>
            {isHat ? (
              <Badge
                variant="primary"
                sx={{
                  mt: [3, 3, 0],
                  ml: [0, 0, 3],
                  borderColor: 'primaryAlt',
                  color: 'primaryAlt',
                  textTransform: 'uppercase'
                }}
              >
                Governing proposal
              </Badge>
            ) : null}
          </Flex>
        ) : (
          <Box m="auto" ml="3" sx={{ width: '200px' }}>
            <Skeleton />
          </Box>
        )}
      </Flex>
    </Stack>
  );
}
