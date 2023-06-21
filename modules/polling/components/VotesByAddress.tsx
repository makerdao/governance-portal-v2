/*

SPDX-FileCopyrightText: © 2023 Dai Foundation <www.daifoundation.org>

SPDX-License-Identifier: AGPL-3.0-or-later

*/

import { Box, Button, Flex, Text } from 'theme-ui';
import { useBreakpointIndex } from '@theme-ui/match-media';
import BigNumber from 'lib/bigNumberJs';
import { PollTally, Poll, PollTallyVote } from 'modules/polling/types';
import { InternalLink } from 'modules/app/components/InternalLink';
import AddressIconBox from 'modules/address/components/AddressIconBox';
import { useMemo, useState } from 'react';
import { parseUnits } from 'ethers/lib/utils';
import { Icon } from '@makerdao/dai-ui-icons';
import { formatValue } from 'lib/string';
import { isResultDisplayApprovalBreakdown } from '../helpers/utils';
import { chainIdToNetworkName } from 'modules/web3/helpers/chain';
import VotedOption from './VotedOption';
import EtherscanLink from 'modules/web3/components/EtherscanLink';

type Props = {
  tally: PollTally;
  poll: Poll;
};

const INITIAL_VOTES_COUNT = 10;

const VotesByAddress = ({ tally, poll }: Props): JSX.Element => {
  const bpi = useBreakpointIndex();
  const { votesByAddress: votes, totalMkrParticipation } = tally;
  const [sortBy, setSortBy] = useState({
    type: 'mkr',
    order: 1
  });
  const [showAllVotes, setShowAllVotes] = useState(false);

  const changeSort = type => {
    if (sortBy.type === type) {
      setSortBy({
        type,
        order: sortBy.order === 1 ? -1 : 1
      });
    } else {
      setSortBy({
        type,
        order: 1
      });
    }
  };

  const loadMoreVotes = () => {
    setShowAllVotes(true);
  };

  const filteredVotes = useMemo(() => {
    let sorted: PollTallyVote[] | undefined;

    switch (sortBy.type) {
      case 'mkr':
        sorted = votes?.sort((a, b) => {
          const aMKR = parseUnits(a.mkrSupport.toString());
          const bMKR = parseUnits(b.mkrSupport.toString());
          return sortBy.order === 1 ? (aMKR.gt(bMKR) ? -1 : 1) : aMKR.gt(bMKR) ? 1 : -1;
        });
        break;
      case 'address':
        sorted = votes?.sort((a, b) =>
          sortBy.order === 1 ? (a.voter > b.voter ? -1 : 1) : a.voter > b.voter ? 1 : -1
        );
        break;
      case 'option':
        sorted = votes?.sort((a, b) =>
          sortBy.order === 1 ? (a.ballot[0] > b.ballot[0] ? -1 : 1) : a.ballot[0] > b.ballot[0] ? 1 : -1
        );
        break;
      default:
        sorted = votes;
    }

    return showAllVotes ? sorted : sorted?.slice(0, INITIAL_VOTES_COUNT);
  }, [votes, sortBy.type, sortBy.order, showAllVotes]);

  return (
    <Flex sx={{ flexDirection: 'column', alignItems: 'center' }}>
      <table
        style={{
          width: '100%',
          borderCollapse: 'collapse'
        }}
      >
        <thead>
          <tr>
            <Text
              as="th"
              sx={{ textAlign: 'left', cursor: 'pointer', pb: 2, width: '32%' }}
              variant="caps"
              onClick={() => changeSort('address')}
            >
              Address
              {sortBy.type === 'address' ? (
                sortBy.order === 1 ? (
                  <Icon name="chevron_down" size={2} ml={1} />
                ) : (
                  <Icon name="chevron_up" size={2} ml={1} />
                )
              ) : (
                ''
              )}
            </Text>
            <Text
              as="th"
              sx={{ textAlign: 'left', cursor: 'pointer', pb: 2, width: '38%' }}
              variant="caps"
              onClick={() => changeSort('option')}
            >
              {`Option${isResultDisplayApprovalBreakdown(poll.parameters) ? '(s)' : ''}`}
              {sortBy.type === 'option' ? (
                sortBy.order === 1 ? (
                  <Icon name="chevron_down" size={2} ml={1} />
                ) : (
                  <Icon name="chevron_up" size={2} ml={1} />
                )
              ) : (
                ''
              )}
            </Text>
            {bpi > 3 && (
              <Text
                as="th"
                sx={{ textAlign: 'left', cursor: 'pointer', pb: 2, width: '10%' }}
                variant="caps"
                onClick={() => changeSort('mkr')}
              >
                Vote %
                {sortBy.type === 'mkr' ? (
                  sortBy.order === 1 ? (
                    <Icon name="chevron_down" size={2} ml={1} />
                  ) : (
                    <Icon name="chevron_up" size={2} ml={1} />
                  )
                ) : (
                  ''
                )}
              </Text>
            )}
            <Text
              as="th"
              sx={{ textAlign: ['right', 'right', 'left'], cursor: 'pointer', pb: 2, width: '15%' }}
              variant="caps"
              data-testid="mkr-header"
              onClick={() => changeSort('mkr')}
            >
              MKR
              {sortBy.type === 'mkr' ? (
                sortBy.order === 1 ? (
                  <Icon name="chevron_down" size={2} ml={1} />
                ) : (
                  <Icon name="chevron_up" size={2} ml={1} />
                )
              ) : (
                ''
              )}
            </Text>

            {bpi > 1 && (
              <Text
                as="th"
                sx={{ textAlign: 'right', cursor: 'pointer', pb: 2, width: ['10%'] }}
                variant="caps"
              >
                Verify
              </Text>
            )}
          </tr>
        </thead>
        <tbody>
          {filteredVotes ? (
            <>
              {filteredVotes.map((v, i) => (
                <tr key={`voter-${v.voter}-${i}`} data-testid="vote-by-address">
                  <Text
                    as="td"
                    sx={{ pb: 2, fontSize: [1, 3], verticalAlign: 'top', wordBreak: 'break-word' }}
                  >
                    <InternalLink href={`/address/${v.voter}`} title="View address detail">
                      <AddressIconBox
                        address={v.voter}
                        width={bpi < 1 ? 31 : 41}
                        limitTextLength={bpi < 1 ? 15 : 0}
                      />
                    </InternalLink>
                  </Text>
                  <Box
                    as="td"
                    sx={{
                      pb: 2
                    }}
                  >
                    <VotedOption vote={v} poll={poll} />
                  </Box>
                  {bpi > 3 && (
                    <Text as="td" sx={{ textAlign: 'left', pb: 2, fontSize: [1, 3] }}>
                      {`${
                        new BigNumber(v.mkrSupport).isGreaterThan(0)
                          ? new BigNumber(v.mkrSupport).div(totalMkrParticipation).times(100).toFormat(1)
                          : 0
                      }%`}
                    </Text>
                  )}
                  <Text
                    as="td"
                    data-testid={`vote-mkr-${v.voter}`}
                    sx={{ textAlign: ['right', 'right', 'left'], pb: 2, fontSize: [1, 3] }}
                  >
                    {`${formatValue(parseUnits(v.mkrSupport.toString()), undefined, undefined, true, true)}${
                      bpi > 3 ? ' MKR' : ''
                    }`}
                  </Text>
                  {bpi > 1 && (
                    <Text
                      as="td"
                      data-testid={`vote-mkr-${v.hash}`}
                      sx={{ textAlign: 'right', pb: 2, fontSize: [1, 3] }}
                    >
                      <EtherscanLink
                        hash={v.hash}
                        type="transaction"
                        styles={{ justifyContent: 'flex-end' }}
                        network={chainIdToNetworkName(v.chainId)}
                        prefix=""
                      />
                    </Text>
                  )}
                </tr>
              ))}
            </>
          ) : (
            <tr key={0}>
              <td colSpan={3}>
                <Text color="text" variant="allcaps">
                  Loading
                </Text>
              </td>
            </tr>
          )}
        </tbody>
      </table>
      {filteredVotes && votes && filteredVotes.length < votes.length && (
        <Button
          onClick={loadMoreVotes}
          variant="outline"
          data-testid="button-show-more-poll-voters"
          sx={{ mt: 3 }}
        >
          <Text color="text" variant="caps">
            Show all votes
          </Text>
        </Button>
      )}
    </Flex>
  );
};

export default VotesByAddress;
