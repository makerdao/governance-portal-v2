import { Box, Text } from 'theme-ui';
import { useBreakpointIndex } from '@theme-ui/match-media';
import BigNumber from 'bignumber.js';
import { PollTally, Poll } from 'modules/polling/types';
import { InternalLink } from 'modules/app/components/InternalLink';
import { getVoteColor } from 'modules/polling/helpers/getVoteColor';
import AddressIconBox from 'modules/address/components/AddressIconBox';
import { useMemo, useState } from 'react';
import { parseUnits } from 'ethers/lib/utils';
import { Icon } from '@makerdao/dai-ui-icons';

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
          sortBy.order === 1 ? (a.optionId > b.optionId ? -1 : 1) : a.optionId > b.optionId ? 1 : -1
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
              sx={{ textAlign: 'left', cursor: 'pointer', pb: 2, width: '30%' }}
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
              sx={{ textAlign: 'left', cursor: 'pointer', pb: 2, width: '30%' }}
              variant="caps"
              onClick={() => changeSort('option')}
            >
              Option
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
              sx={{ textAlign: 'left', cursor: 'pointer', pb: 2, width: '20%' }}
              variant="caps"
              onClick={() => changeSort('mkr')}
            >
              Voting Power
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
              sx={{ textAlign: 'right', cursor: 'pointer', pb: 2, width: '20%' }}
              variant="caps"
              onClick={() => changeSort('mkr')}
            >
              MKR Amount
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
          </tr>
        </thead>
        <tbody>
          {sortedVotes ? (
            <>
              {sortedVotes.map((v, i) => (
                <tr key={`voter-${v.voter}-${i}`} data-testid="vote-by-address">
                  <Text as="td" sx={{ pb: 2, fontSize: bpi < 1 ? 1 : 3, verticalAlign: 'top' }}>
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
                    sx={{ color: getVoteColor(v.optionId, poll.voteType), pb: 2, verticalAlign: 'top' }}
                  >
                    {v.rankedChoiceOption && v.rankedChoiceOption.length > 1 ? (
                      v.rankedChoiceOption.map((choice, index) => (
                        <Box
                          key={`voter-${v.voter}-option-${choice}`}
                          sx={{
                            color: index === 0 ? 'inherit' : '#708390',
                            fontSize: bpi < 1 ? 1 : index === 0 ? 3 : 2
                          }}
                        >
                          {index + 1} - {poll.options[choice]}
                        </Box>
                      ))
                    ) : (
                      <Text sx={{ fontSize: bpi < 1 ? 1 : 3 }}>{poll.options[v.optionId]}</Text>
                    )}
                  </Box>
                  <Text as="td" sx={{ pb: 2, verticalAlign: 'top' }}>
                    {`${new BigNumber(v.mkrSupport).div(totalMkrParticipation).times(100).toFormat(1)}%`}
                  </Text>
                  <Text
                    as="td"
                    data-testid={`vote-mkr-${v.voter}`}
                    sx={{ textAlign: 'right', pb: 2, fontSize: bpi < 1 ? 1 : 3, verticalAlign: 'top' }}
                  >
                    {`${
                      new BigNumber(v.mkrSupport).lte(0.01)
                        ? '≈0.00'
                        : new BigNumber(v.mkrSupport).toFormat(new BigNumber(v.mkrSupport).gt(999) ? 0 : 2)
                    }${bpi > 0 ? ' MKR' : ''}`}{' '}
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
