import BigNumber from 'bignumber.js';
import { Card, Text, Link, Spinner } from 'theme-ui';
import { useBreakpointIndex } from '@theme-ui/match-media';
import { getNetwork } from 'lib/maker';
import { getEtherscanLink, formatRound } from 'lib/utils';
import { formatDateWithTime, formatDateWithoutTime } from 'lib/datetime';
import { cutMiddle } from 'lib/string';
import { AllEsmJoinsRecord } from 'modules/gql/generated/graphql';

type Props = {
  allEsmJoins: AllEsmJoinsRecord[] | undefined;
};

const ESMHistory = ({ allEsmJoins }: Props): JSX.Element => {
  const bpi = useBreakpointIndex();

  return (
    <Card mt={3} p={3} pb={4}>
      <table
        style={{
          width: '100%',
          borderCollapse: 'collapse'
        }}
      >
        <thead>
          <tr>
            <Text as="th" style={{ textAlign: 'left' }} variant="caps">
              Date
            </Text>
            <Text as="th" style={{ textAlign: 'left' }} variant="caps">
              Amount Burned
            </Text>
            <Text as="th" style={{ textAlign: 'left' }} variant="caps">
              Sender Address
            </Text>
          </tr>
        </thead>
        <tbody>
          {!allEsmJoins ? (
            <tr key={0}>
              <td colSpan={3}>
                <Spinner size={30} mt={2} />
              </td>
            </tr>
          ) : allEsmJoins.length > 0 ? (
            allEsmJoins.map(
              (
                action: {
                  blockTimestamp: string;
                  joinAmount: string;
                  txHash: string;
                  txFrom: string;
                },
                i
              ) => {
                const amount = new BigNumber(action.joinAmount);
                return (
                  <tr
                    key={i}
                    style={{
                      borderBottom:
                        allEsmJoins.length > 0 && i < allEsmJoins.length - 1 ? '1px solid #EDEDED' : 'none'
                    }}
                  >
                    <td
                      css={`
                        white-space: nowrap;
                        max-width: 205px;
                        text-overflow: ellipsis;
                        overflow: hidden;
                      `}
                    >
                      <Text
                        as="p"
                        color="text"
                        variant="caption"
                        sx={{ paddingY: 3, mr: 2, fontSize: [2, 3] }}
                      >
                        {bpi > 0
                          ? formatDateWithTime(action.blockTimestamp)
                          : formatDateWithoutTime(action.blockTimestamp)}
                      </Text>
                    </td>
                    <td
                      css={`
                        white-space: nowrap;
                      `}
                    >
                      <Text
                        as="p"
                        color="text"
                        variant="caption"
                        sx={{ paddingY: 3, mr: 2, fontSize: [2, 3] }}
                      >
                        {amount.gte(0.1) ? formatRound(amount.toNumber()) : formatRound(amount.toNumber(), 3)}{' '}
                        MKR
                      </Text>
                    </td>
                    <td>
                      <Link
                        href={getEtherscanLink(getNetwork(), action.txFrom, 'address')}
                        target="_blank"
                        variant="caption"
                        color="accentBlue"
                      >
                        <Text
                          as="p"
                          color="accentBlue"
                          variant="caption"
                          sx={{ paddingY: 3, mr: 2, fontSize: [2, 3] }}
                        >
                          {cutMiddle(action.txFrom, bpi > 0 ? 8 : 4, bpi > 0 ? 6 : 4)}
                        </Text>
                      </Link>
                    </td>
                  </tr>
                );
              }
            )
          ) : (
            <tr key={0}>
              <td colSpan={3}>
                <Text color="text" variant="caption">
                  No history to show
                </Text>
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </Card>
  );
};

export default ESMHistory;
