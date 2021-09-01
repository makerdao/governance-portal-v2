import { Box, Text, Link as ExternalLink } from 'theme-ui';
import { useBreakpointIndex } from '@theme-ui/match-media';
import BigNumber from 'bignumber.js';
import { getNetwork } from 'lib/maker';
import { getEtherscanLink, cutMiddle } from 'lib/utils';
import { useDelegateAddressMap } from 'lib/hooks';
import { PollTallyVote, Poll } from 'modules/polls/types';
import { getVoteColor } from 'modules/polls/helpers/getVoteColor';
import { CurrencyObject } from 'types/currency';

type Props = {
  votes: PollTallyVote[];
  totalMkrParticipation: CurrencyObject;
  poll: Poll;
};

const VotesByAddress = ({ votes, totalMkrParticipation, poll }: Props): JSX.Element => {
  const bpi = useBreakpointIndex();
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
            <Text as="th" sx={{ textAlign: 'left', pb: 2 }} variant="caps">
              Address
            </Text>
            <Text as="th" sx={{ textAlign: 'left', pb: 2 }} variant="caps">
              Voted
            </Text>
            <Text as="th" sx={{ textAlign: 'left', pb: 2 }} variant="caps">
              Voting Power
            </Text>
            <Text as="th" sx={{ textAlign: 'left', pb: 2 }} variant="caps">
              MKR Amount
            </Text>
          </tr>
        </thead>
        <tbody>
          {votes ? (
            <>
              {votes.map((v, i) => (
                <tr key={i}>
                  <Text as="td" sx={{ pb: 2 }}>
                    <ExternalLink href={getEtherscanLink(getNetwork(), v.voter, 'address')} target="_blank">
                      {delegateAddresses[v.voter]
                        ? delegateAddresses[v.voter]
                        : cutMiddle(v.voter, bpi < 1 ? 4 : 8, bpi < 1 ? 4 : 6)}
                    </ExternalLink>
                  </Text>
                  <Text as="td" sx={{ color: getVoteColor(v.optionId, poll.voteType) }}>
                    {v.rankedChoiceOption && v.rankedChoiceOption.length > 1
                      ? poll.options[v.rankedChoiceOption[0]]
                      : poll.options[v.optionId]}
                    {v.rankedChoiceOption && v.rankedChoiceOption.length > 1 && ' *'}
                  </Text>
                  <Text as="td">
                    {`${new BigNumber(v.mkrSupport)
                      .div(totalMkrParticipation.toBigNumber())
                      .times(100)
                      .toFormat(1)}%`}
                  </Text>
                  <Text as="td">{`${new BigNumber(v.mkrSupport).toFormat(2)}${bpi > 0 ? ' MKR' : ''}`}</Text>
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
        {poll.voteType === 'Ranked Choice IRV' && (
          <Text as="p" sx={{ mt: 4, color: 'textSecondary', fontSize: 1 }}>
            *First choice in ranked choice vote shown
          </Text>
        )}
      </table>
    </Box>
  );
};

export default VotesByAddress;
