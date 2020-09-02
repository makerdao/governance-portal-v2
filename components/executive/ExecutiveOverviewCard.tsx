/** @jsx jsx */
import Link from 'next/link';
import { Text, Flex, Box, Button, Badge, jsx } from 'theme-ui';
import useSWR from 'swr';
import { Icon } from '@makerdao/dai-ui-icons';
import Skeleton from 'react-loading-skeleton';

import CurrencyObject from '../../types/currency';
import Proposal from '../../types/proposal';
import SpellData from '../../types/spellData';
import getMaker, { getNetwork } from '../../lib/maker';
import Stack from '../layouts/Stack';
import { useBreakpointIndex } from '@theme-ui/match-media';
import useAccountsStore from '../../stores/accounts';

export default function ExecutiveOverviewCard({ proposal, ...props }: { proposal: Proposal }): JSX.Element {
  const { data: mkrSupport } = useSWR<CurrencyObject>(
    ['/executive/mkr-support', proposal.address],
    (_, spellAddress) => getMaker().then(maker => maker.service('chief').getApprovalCount(spellAddress))
  );

  const { data: spellData } = useSWR<SpellData>(
    `/api/executive/analyze-spell/${proposal.address}?network=${getNetwork()}`
  );

  const network = getNetwork();
  const account = useAccountsStore(state => state.currentAccount);
  const bpi = useBreakpointIndex();
  const canVote = !!account;

  return (
    <Flex
      p={1}
      sx={{ flexDirection: 'row', justifyContent: 'space-between', variant: 'cards.primary' }}
      {...props}
    >
      <Stack gap={2}>
        <Flex sx={{ justifyContent: 'space-between', flexDirection: 'row', flexWrap: 'nowrap' }}>
          <Text sx={{ textTransform: 'uppercase', color: 'mutedAlt', fontSize: 2 }}>posted 555 iii</Text>
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
        {/* {bpi > 0 && (
          <div>
            <CountdownTimer endText="Poll ended" endDate={poll.endDate} />
          </div>
        )} */}
        <Flex sx={{ alignItems: 'center' }}>
          {
            !!account && null
            // bpi === 0 &&
            // (onBallot ? (
            //   <Button
            //     variant="outline"
            //     mr={2}
            //     onClick={startMobileVoting}
            //     sx={{
            //       display: 'flex',
            //       flexDirection: 'row',
            //       flexWrap: 'nowrap',
            //       alignItems: 'center'
            //     }}
            //   >
            //     <Icon name="edit" size={3} mr={2} />
            //     Edit Choices
            //   </Button>
            // ) : (
            //   <Button variant="primary" mr={2} onClick={startMobileVoting}>
            //     Vote
            //   </Button>
            // ))
          }
          <Link
            key={proposal.key}
            href={{ pathname: '/polling/[poll-hash]', query: { network } }}
            as={{ pathname: `/polling/${proposal.key}`, query: { network } }}
          >
            <Button
              variant="outline"
              sx={{
                borderColor: 'secondaryAlt',
                color: 'secondaryAlt'
              }}
            >
              View Details
            </Button>
          </Link>
          <Flex sx={{ ml: 3 }}>
            {typeof mkrSupport === 'undefined' ? (
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
                {mkrSupport.toBigNumber().toFormat(2)} MKR Supporting
              </Badge>
            )}
          </Flex>

          {/* {isActivePoll(poll) ? '' : <PollOptionBadge poll={poll} sx={{ color: 'mutedAlt' }} />} */}
        </Flex>
      </Stack>
      {canVote && bpi > 0 && (
        <Flex sx={{ mx: 4, alignItems: 'center', justifyContent: 'center', width: 7 }}>
          <Button variant="primaryOutline" sx={{ width: '100%' }}>
            Vote
          </Button>
        </Flex>
      )}
    </Flex>
  );
}
