/** @jsx jsx */
import Link from 'next/link';
import { useBreakpointIndex } from '@theme-ui/match-media';
import { Text, Flex, Box, Button, Badge, Divider, Card, jsx } from 'theme-ui';
import { Icon } from '@makerdao/dai-ui-icons';
import useSWR from 'swr';
import Skeleton from 'react-loading-skeleton';
import Bignumber from 'bignumber.js';

import Proposal from '../../types/proposal';
import SpellData from '../../types/spellData';
import getMaker, { getNetwork } from '../../lib/maker';
import { formatDateWithTime } from '../../lib/utils';
import Stack from '../layouts/Stack';
import useAccountsStore from '../../stores/accounts';

export default function ExecutiveOverviewCard({ proposal, ...props }: { proposal: Proposal }): JSX.Element {
  const account = useAccountsStore(state => state.currentAccount);

  const { data: spellData } = useSWR<SpellData>(
    `/api/executive/analyze-spell/${proposal.address}?network=${getNetwork()}`
  );

  const { data: votedProposals } = useSWR<string[]>(
    ['/executive/voted-proposals', account?.address],
    (_, address) =>
      getMaker().then(maker =>
        maker
          .service('chief')
          .getVotedSlate(address)
          .then(slate => maker.service('chief').getSlateAddresses(slate))
      )
  );

  const network = getNetwork();
  const bpi = useBreakpointIndex();
  const hasVotedFor =
    votedProposals &&
    !!votedProposals.find(
      proposalAddress => proposalAddress.toLowerCase() === proposal.address.toLowerCase()
    );
  const canVote = !!account;

  if ('content' in proposal) {
    return (
      <Card sx={{ p: [0, 0] }} {...props}>
        <Flex px={4} py={spellData?.hasBeenCast ? 3 : 4} sx={{ justifyContent: 'space-between' }}>
          <Stack gap={2}>
            <Flex sx={{ justifyContent: 'space-between', flexDirection: 'row', flexWrap: 'nowrap' }}>
              <Text sx={{ textTransform: 'uppercase', color: 'mutedAlt', fontSize: 2 }}>
                posted {formatDateWithTime(proposal.date)}
              </Text>
            </Flex>
            <Box>
              <Link
                href={{ pathname: '/executive/[proposal-id]', query: { network } }}
                as={{ pathname: `/polling/${proposal.key}`, query: { network } }}
              >
                <Text variant="microHeading" sx={{ fontSize: [3, 5] }}>
                  {proposal.title}
                </Text>
              </Link>
            </Box>
            <Text
              sx={{
                fontSize: [2, 3],
                color: 'onSecondary'
              }}
            >
              {proposal.proposalBlurb}
            </Text>
            <Flex sx={{ alignItems: 'center' }}>
              <Flex>
                {hasVotedFor && (
                  <Badge
                    variant="primary"
                    sx={{
                      color: 'primary',
                      borderColor: 'primary',
                      textTransform: 'uppercase',
                      display: 'inline-flex',
                      alignItems: 'center',
                      mr: 2
                    }}
                  >
                    <Flex sx={{ display: 'inline-flex', pr: 2 }}>
                      <Icon name="verified" size={3} />
                    </Flex>
                    Your Vote
                  </Badge>
                )}
                {spellData?.mkrSupport === undefined ? (
                  <Box sx={{ width: 6 }}>
                    <Skeleton />
                  </Box>
                ) : (
                  <Badge
                    variant="primary"
                    sx={{
                      borderColor: 'text',
                      textTransform: 'uppercase'
                    }}
                  >
                    {new Bignumber(spellData.mkrSupport).toFormat(2)} MKR Supporting
                  </Badge>
                )}
              </Flex>
            </Flex>
            {canVote && bpi === 0 && (
              <Box sx={{ pt: 2 }}>
                <Button variant="primaryOutline" sx={{ width: '100%' }}>
                  {hasVotedFor ? 'Withdraw Vote' : 'Vote'}
                </Button>
              </Box>
            )}
          </Stack>
          {canVote && bpi > 0 && (
            <Flex sx={{ mx: 4, alignItems: 'center', justifyContent: 'center', width: 7 }}>
              <Button variant="primaryOutline" sx={{ width: '100%' }}>
                {hasVotedFor ? 'Withdraw Vote' : 'Vote'}
              </Button>
            </Flex>
          )}
        </Flex>

        {spellData !== undefined && spellData.hasBeenCast && (
          <>
            <Divider my={0} />
            <Flex p={3} sx={{ justifyContent: 'center' }}>
              <Text sx={{ fontSize: [2, 3], color: 'onSecondary' }}>
                Passed on {formatDateWithTime(spellData.datePassed)}.{' '}
                {spellData.dateExecuted ? (
                  <>Executed on {formatDateWithTime(spellData.dateExecuted)}.</>
                ) : (
                  <>Available for execution on {formatDateWithTime(spellData.eta)}.</>
                )}
              </Text>
            </Flex>
          </>
        )}
      </Card>
    );
  }
  return (
    <Card sx={{ p: [0, 0] }} {...props}>
      <Text>spell address {proposal.address}</Text>
    </Card>
  );
}
