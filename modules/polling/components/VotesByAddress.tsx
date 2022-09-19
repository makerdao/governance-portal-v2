import { Box, Flex, Text } from 'theme-ui';
import { useBreakpointIndex } from '@theme-ui/match-media';
import BigNumber from 'lib/bigNumberJs';
import { PollTally, Poll } from 'modules/polling/types';
import { InternalLink } from 'modules/app/components/InternalLink';
import { getVoteColor } from 'modules/polling/helpers/getVoteColor';
import AddressIconBox from 'modules/address/components/AddressIconBox';
import { useMemo, useState } from 'react';
import { parseUnits } from 'ethers/lib/utils';
import { Icon } from '@makerdao/dai-ui-icons';
import { formatValue } from 'lib/string';
import {
  isInputFormatChooseFree,
  isInputFormatRankFree,
  isResultDisplayApprovalBreakdown
} from '../helpers/utils';
import { ExternalLink } from 'modules/app/components/ExternalLink';
import { getEtherscanLink } from 'modules/web3/helpers/getEtherscanLink';
import { chainIdToNetworkName } from 'modules/web3/helpers/chain';
import { CHAIN_INFO } from 'modules/web3/constants/networks';

type Props = {
  tally: PollTally;
  poll: Poll;
};

const VotesByAddress = ({ tally, poll }: Props): JSX.Element => {
  const bpi = useBreakpointIndex();
  const { votesByAddress: votes, totalMkrParticipation } = tally;
  const [sortBy, setSortBy] = useState({
    type: 'mkr',
    order: 1
  });

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

  const sortedVotes = useMemo(() => {
    switch (sortBy.type) {
      case 'mkr':
        return votes?.sort((a, b) => {
          const aMKR = parseUnits(a.mkrSupport.toString());
          const bMKR = parseUnits(b.mkrSupport.toString());
          return sortBy.order === 1 ? (aMKR.gt(bMKR) ? -1 : 1) : aMKR.gt(bMKR) ? 1 : -1;
        });
      case 'address':
        return votes?.sort((a, b) =>
          sortBy.order === 1 ? (a.voter > b.voter ? -1 : 1) : a.voter > b.voter ? 1 : -1
        );
      case 'option':
        return votes?.sort((a, b) =>
          sortBy.order === 1 ? (a.ballot[0] > b.ballot[0] ? -1 : 1) : a.ballot[0] > b.ballot[0] ? 1 : -1
        );
      default:
        return votes;
    }
  }, [votes, sortBy.type, sortBy.order]);

  return (
    <Box>
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
            <Text
              as="th"
              sx={{ textAlign: 'left', cursor: 'pointer', pb: 2, width: ['15%', '10%'] }}
              variant="caps"
              onClick={() => changeSort('mkr')}
            >
              Vote{bpi > 0 ? ' %' : ''}
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
            <Text
              as="th"
              sx={{ textAlign: 'left', cursor: 'pointer', pb: 2, width: '15%' }}
              variant="caps"
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

            <Text
              as="th"
              sx={{ textAlign: 'right', cursor: 'pointer', pb: 2, width: ['5%', '10%'] }}
              variant="caps"
            >
              Verify
            </Text>
          </tr>
        </thead>
        <tbody>
          {sortedVotes ? (
            <>
              {sortedVotes.map((v, i) => (
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
                      color: getVoteColor(v.ballot[0], poll.parameters),
                      pb: 2
                    }}
                  >
                    {v.ballot.length > 1 ? (
                      v.ballot.map((choice, index) => (
                        <Box
                          key={`voter-${v.voter}-option-${choice}`}
                          sx={{
                            lineHeight: '1.7',
                            color:
                              index === 0 || isInputFormatChooseFree(poll.parameters) ? 'inherit' : '#708390',
                            fontSize:
                              bpi < 1
                                ? 1
                                : isResultDisplayApprovalBreakdown(poll.parameters)
                                ? 3
                                : index === 0
                                ? 3
                                : 2,
                            mb: 1
                          }}
                        >
                          {isInputFormatRankFree(poll.parameters) ? `${index + 1} - ` : ''}
                          {poll.options[choice]}
                        </Box>
                      ))
                    ) : (
                      <Text sx={{ fontSize: [1, 3] }}>{poll.options[v.ballot[0]]}</Text>
                    )}
                  </Box>
                  <Text as="td" sx={{ textAlign: 'left', pb: 2, fontSize: [1, 3] }}>
                    {`${
                      new BigNumber(v.mkrSupport).isGreaterThan(0)
                        ? new BigNumber(v.mkrSupport).div(totalMkrParticipation).times(100).toFormat(1)
                        : 0
                    }%`}
                  </Text>
                  <Text
                    as="td"
                    data-testid={`vote-mkr-${v.voter}`}
                    sx={{ textAlign: 'left', pb: 2, fontSize: [1, 3] }}
                  >
                    {`${formatValue(parseUnits(v.mkrSupport.toString()), undefined, undefined, true, true)}${
                      bpi > 0 ? ' MKR' : ''
                    }`}
                  </Text>
                  <Text
                    as="td"
                    data-testid={`vote-mkr-${v.hash}`}
                    sx={{ textAlign: 'right', pb: 2, fontSize: [1, 3] }}
                  >
                    <ExternalLink
                      title="See transaction details"
                      href={getEtherscanLink(chainIdToNetworkName(v.chainId), v.hash, 'transaction')}
                    >
                      <Flex sx={{ alignItems: 'center' }}>
                        {CHAIN_INFO[v.chainId].type === 'gasless' && (
                          <Icon name="lightningBolt" color="onSecondary" size={3} />
                        )}

                        <Text sx={{ mr: 1, display: ['none', 'block'] }}>
                          {CHAIN_INFO[v.chainId] ? CHAIN_INFO[v.chainId].blockExplorerName : 'Unknown'}
                        </Text>
                        <Icon sx={{ ml: 'auto' }} name="arrowTopRight" size={2} color="accentBlue" />
                      </Flex>
                    </ExternalLink>
                  </Text>
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
    </Box>
  );
};

export default VotesByAddress;
