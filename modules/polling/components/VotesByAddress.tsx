import Link from 'next/link';
import { Box, Text, Link as ThemeUILink } from 'theme-ui';
import { useBreakpointIndex } from '@theme-ui/match-media';
import BigNumber from 'bignumber.js';
import { PollTally, Poll } from 'modules/polling/types';
import { getVoteColor } from 'modules/polling/helpers/getVoteColor';
import { Address } from 'modules/address/components/Address';
import { useDelegateAddressMap } from 'modules/delegates/hooks/useDelegateAddressMap';

type Props = {
  tally: PollTally;
  poll: Poll;
};

const VotesByAddress = ({ tally, poll }: Props): JSX.Element => {
  const bpi = useBreakpointIndex();
  const { votesByAddress: votes, totalMkrParticipation } = tally;
  const showRankedChoiceInfo = votes?.find(v => v.rankedChoiceOption && v.rankedChoiceOption.length > 1);
  const { data: delegateAddresses } = useDelegateAddressMap();

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
            <Text as="th" sx={{ textAlign: 'left', pb: 2, width: '30%' }} variant="caps">
              Address
            </Text>
            <Text as="th" sx={{ textAlign: 'left', pb: 2, width: '30%' }} variant="caps">
              Option
            </Text>
            <Text as="th" sx={{ textAlign: 'left', pb: 2, width: '20%' }} variant="caps">
              Voting Power
            </Text>
            <Text as="th" sx={{ textAlign: 'right', pb: 2, width: '20%' }} variant="caps">
              MKR Amount
            </Text>
          </tr>
        </thead>
        <tbody>
          {votes ? (
            <>
              {votes.map((v, i) => (
                <tr key={i} data-testid="vote-by-address">
                  <Text as="td" sx={{ pb: 2, fontSize: bpi < 1 ? 1 : 3 }}>
                    <Link href={{ pathname: `/address/${v.voter}` }} passHref>
                      <ThemeUILink title="View address detail">
                        {delegateAddresses[v.voter] ? (
                          delegateAddresses[v.voter]
                        ) : (
                          <Address address={v.voter} />
                        )}
                      </ThemeUILink>
                    </Link>
                  </Text>
                  <Text
                    as="td"
                    sx={{ color: getVoteColor(v.optionId, poll.voteType), pb: 2, fontSize: bpi < 1 ? 1 : 3 }}
                  >
                    {v.rankedChoiceOption && v.rankedChoiceOption.length > 1
                      ? poll.options[v.rankedChoiceOption[0]]
                      : poll.options[v.optionId]}
                    {v.rankedChoiceOption && v.rankedChoiceOption.length > 1 && '*'}
                  </Text>
                  <Text as="td" sx={{ pb: 2 }}>
                    {`${new BigNumber(v.mkrSupport).div(totalMkrParticipation).times(100).toFormat(1)}%`}
                  </Text>
                  <Text
                    as="td"
                    sx={{ textAlign: 'right', pb: 2, fontSize: bpi < 1 ? 1 : 3 }}
                  >{`${new BigNumber(v.mkrSupport).toFormat(3)}${bpi > 0 ? ' MKR' : ''}`}</Text>
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
      {showRankedChoiceInfo && (
        <Text as="p" sx={{ mt: 4, color: 'textSecondary', fontSize: 1 }}>
          *First choice in ranked choice vote shown
        </Text>
      )}
    </Box>
  );
};

export default VotesByAddress;
