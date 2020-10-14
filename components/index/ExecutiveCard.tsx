/** @jsx jsx */
import Link from 'next/link';
import useSWR from 'swr';
import { Button, Text, Flex, Badge, Box, jsx } from 'theme-ui';
import Skeleton from 'react-loading-skeleton';

import Stack from '../layouts/Stack';
import getMaker, { getNetwork } from '../../lib/maker';
import CurrencyObject from '../../types/currency';
import { CMSProposal } from '../../types/proposal';

type Props = {
  proposal: CMSProposal;
  isHat: boolean;
};

export default function ExecutiveCard({ proposal, isHat, ...props }: Props): JSX.Element {
  const network = getNetwork();

  const { data: mkrSupport } = useSWR<CurrencyObject>(
    ['/executive/mkr-support', proposal.address],
    (_, spellAddress) => getMaker().then(maker => maker.service('chief').getApprovalCount(spellAddress))
  );

  return (
    <Stack gap={1} sx={{ variant: 'cards.primary' }} {...props}>
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
            variant="microHeading"
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
          fontSize: 3,
          opacity: 0.8,
          mb: [1, 3]
        }}
      >
        {proposal.proposalBlurb}
      </Text>
      <Flex sx={{ alignItems: 'center', flexWrap: 'wrap' }}>
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
          <Button
            variant="primaryOutline"
            sx={{ borderRadius: 'small', px: 4, mr: 3, display: ['none', 'block'] }}
          >
            View proposal
          </Button>
        </Link>
        {isHat ? (
          <Badge
            variant="primary"
            sx={{
              my: [1, 2],
              mr: 3,
              borderColor: 'primaryAlt',
              color: 'primaryAlt',
              textTransform: 'uppercase'
            }}
          >
            Governing proposal
          </Badge>
        ) : null}
        {mkrSupport ? (
          <Badge
            variant="primary"
            sx={{
              my: [1, 2],
              mr: 3,
              textTransform: 'uppercase'
            }}
          >
            {mkrSupport.toBigNumber().toFormat(2)} MKR Supporting
          </Badge>
        ) : (
          <Box m="auto" sx={{ m: 2, width: '200px' }}>
            <Skeleton />
          </Box>
        )}
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
          <Button
            variant="primaryOutline"
            sx={{ borderRadius: 'small', px: 4, mt: 2, width: '100%', display: ['block', 'none'] }}
          >
            View proposal
          </Button>
        </Link>
      </Flex>
    </Stack>
  );
}
