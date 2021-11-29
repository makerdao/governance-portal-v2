import { Card, Text, Link, Spinner } from 'theme-ui';
import { useBreakpointIndex } from '@theme-ui/match-media';
import { getNetwork } from 'lib/maker';
import { getEtherscanLink, formatRound } from 'lib/utils';
import { formatDateWithTime, formatDateWithoutTime } from 'lib/datetime';
import { cutMiddle } from 'lib/string';
import { CurrencyObject } from 'modules/app/types/currency';
import { StakingHistoryRow } from 'modules/emergency-shutdown/types/esmodule';

type Props = {
  stakingHistory: StakingHistoryRow[] | undefined;
};

const ESMHistory = ({ stakingHistory }: Props): JSX.Element => {
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
          {!stakingHistory ? (
            <tr key={0}>
              <td colSpan={3}>
                <Spinner size={30} mt={2} />
              </td>
            </tr>
          ) : stakingHistory.length > 0 ? (
            stakingHistory.map(
              (
                action: {
                  time: string;
                  amount: CurrencyObject;
                  transactionHash: string;
                  senderAddress: string;
                },
                i
              ) => (
                <tr
                  key={i}
                  style={{
                    borderBottom:
                      stakingHistory.length > 0 && i < stakingHistory.length - 1
                        ? '1px solid #EDEDED'
                        : 'none'
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
                    <Text as="p" color="text" variant="caption" sx={{ paddingY: 3, mr: 2 }}>
                      {bpi > 0 ? formatDateWithTime(action.time) : formatDateWithoutTime(action.time)}
                    </Text>
                  </td>
                  <td
                    css={`
                      white-space: nowrap;
                    `}
                  >
                    <Text as="p" color="text" variant="caption" sx={{ paddingY: 3, mr: 2 }}>
                      {action.amount.gte(0.1)
                        ? formatRound(action.amount.toNumber())
                        : formatRound(action.amount.toNumber(), 6)}{' '}
                      MKR
                    </Text>
                  </td>
                  <td>
                    <Link
                      href={getEtherscanLink(getNetwork(), action.senderAddress, 'address')}
                      target="_blank"
                      variant="caption"
                      color="accentBlue"
                    >
                      {cutMiddle(action.senderAddress, bpi > 0 ? 8 : 4, bpi > 0 ? 6 : 4)}
                    </Link>
                  </td>
                </tr>
              )
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
