import Link from 'next/link';
import useSWR from 'swr';
import { Button, Text, Flex, Badge, Box, Link as InternalLink } from 'theme-ui';
import Skeleton from 'modules/app/components/SkeletonThemed';
import Stack from 'modules/app/components/layout/layouts/Stack';
import getMaker from 'lib/maker';
import { CurrencyObject } from 'modules/app/types/currency';
import { CMSProposal } from 'modules/executive/types';
import { ZERO_ADDRESS } from 'modules/web3/constants/addresses';

type Props = {
  proposal: CMSProposal;
  isHat: boolean;
};

export default function ExecutiveCard({ proposal, isHat, ...props }: Props): JSX.Element {
  const { data: mkrSupport } = useSWR<CurrencyObject>(
    ['/executive/mkr-support', proposal.address],
    (_, spellAddress) => getMaker().then(maker => maker.service('chief').getApprovalCount(spellAddress))
  );

  return (
    <Stack gap={1} sx={{ variant: 'cards.primary' }} {...props}>
      <div>
        <Link
          href={{
            pathname: '/executive/[proposal-id]'
          }}
          as={{
            pathname: `/executive/${proposal.key}`
          }}
        >
          <InternalLink href={`/executive/${proposal.key}`} variant="nostyle">
            <Text
              variant="microHeading"
              sx={{
                fontSize: [3, 4],
                cursor: 'pointer'
              }}
            >
              {proposal.title}
            </Text>
          </InternalLink>
        </Link>
      </div>
      <Box>
        <Text
          sx={
            {
              textOverflow: 'ellipsis',
              fontSize: [2, 3],
              opacity: 0.8,
              mb: [1, 3],
              display: '-webkit-box',
              overflow: 'hidden',
              WebkitBoxOrient: 'vertical',
              WebkitLineClamp: 2
            } as any
          }
        >
          {proposal.proposalBlurb}
        </Text>
      </Box>
      <Flex sx={{ alignItems: 'center', flexWrap: 'wrap' }}>
        <Link
          href={{
            pathname: '/executive/[proposal-id]'
          }}
          as={{
            pathname: `/executive/${proposal.key}`
          }}
        >
          <Button
            variant="primaryOutline"
            sx={{ borderRadius: 'small', px: 4, mr: 3, display: ['none', 'block'] }}
          >
            View proposal
          </Button>
        </Link>
        {isHat && proposal.address !== ZERO_ADDRESS ? (
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
            pathname: '/executive/[proposal-id]'
          }}
          as={{
            pathname: `/executive/${proposal.key}`
          }}
        >
          <InternalLink href={`/executive/${proposal.key}`} variant="nostyle">
            <Button
              variant="primaryOutline"
              sx={{ borderRadius: 'small', px: 4, mt: 2, width: '100%', display: ['block', 'none'] }}
            >
              View proposal
            </Button>
          </InternalLink>
        </Link>
      </Flex>
    </Stack>
  );
}
