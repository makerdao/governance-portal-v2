import Link from 'next/link';
import { Box, Text, Link as ThemeUILink } from 'theme-ui';
import { useBreakpointIndex } from '@theme-ui/match-media';
import BigNumber from 'bignumber.js';
import { getNetwork } from 'lib/maker';
import { cutMiddle } from 'lib/string';
import { useDelegateAddressMap } from 'lib/hooks';
import { PollTally, Poll } from 'modules/polling/types';
import { getVoteColor } from 'modules/polling/helpers/getVoteColor';
import { Address } from 'modules/address/components/Address';

type Props = {
  delegators: any; //TODO FIXME
  totalDelegated: any; //TODO FIXME
};

const DelegatedByAddress = ({ delegators, totalDelegated }: Props): JSX.Element => {
  console.log('delegators from comp', delegators);
  console.log('dtotalDelegated', totalDelegated);
  const bpi = useBreakpointIndex();
  const network = getNetwork();

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
              MKR Delegated
            </Text>
            <Text as="th" sx={{ textAlign: 'left', pb: 2, width: '20%' }} variant="caps">
              Voting Power
            </Text>
            {/* <Text as="th" sx={{ textAlign: 'right', pb: 2, width: '20%' }} variant="caps">
              Verify
            </Text> */}
          </tr>
        </thead>
        <tbody>
          {delegators ? (
            <>
              {delegators.map(({ address, lockAmount }, i) => (
                <tr key={i}>
                  <Text as="td" sx={{ pb: 2, fontSize: bpi < 1 ? 1 : 3 }}>
                    <Link href={{ pathname: `/address/${address}`, query: { network } }} passHref>
                      <ThemeUILink title="View address detail">
                        {/* {delegateAddresses[v.voter] ? (
                          delegateAddresses[v.voter]
                        ) : ( */}
                        <Address address={address} />
                        {/* )} */}
                      </ThemeUILink>
                    </Link>
                  </Text>
                  {/* <Text
                    as="td"
                    sx={{ color: getVoteColor(v.optionId, poll.voteType), pb: 2, fontSize: bpi < 1 ? 1 : 3 }}
                  >
                    {v.rankedChoiceOption && v.rankedChoiceOption.length > 1
                      ? poll.options[v.rankedChoiceOption[0]]
                      : poll.options[v.optionId]}
                    {v.rankedChoiceOption && v.rankedChoiceOption.length > 1 && '*'}
                  </Text> */}
                  <Text as="td" sx={{ pb: 2, fontSize: bpi < 1 ? 1 : 3 }}>{`${new BigNumber(
                    lockAmount
                  ).toFormat(2)}${bpi > 0 ? ' MKR' : ''}`}</Text>
                  <Text as="td" sx={{ pb: 2 }}>
                    {`${new BigNumber(lockAmount).div(totalDelegated.toBigNumber()).times(100).toFormat(1)}%`}
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
      {/* {showRankedChoiceInfo && (
        <Text as="p" sx={{ mt: 4, color: 'textSecondary', fontSize: 1 }}>
          *First choice in ranked choice vote shown
        </Text>
      )} */}
    </Box>
  );
};

export default DelegatedByAddress;
