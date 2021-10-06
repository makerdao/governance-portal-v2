import { Card, Text, Link } from 'theme-ui';
import { getNetwork } from 'lib/maker';
import { getEtherscanLink, formatDateWithTime, formatRound } from 'lib/utils';
import { cutMiddle } from 'lib/string';
import { CurrencyObject } from 'types/currency';
import { StakingHistoryRow } from 'types/esmodule';

type Props = {
  stakingHistory: StakingHistoryRow[] | undefined;
};

const ESMHistory = ({ stakingHistory }: Props): JSX.Element => {
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
                <Text color="text" variant="allcaps">
                  Loading
                </Text>
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
                    <Text as="p" color="text" variant="caption" sx={{ paddingY: 3 }}>
                      {formatDateWithTime(action.time)}
                    </Text>
                  </td>
                  <td
                    css={`
                      white-space: nowrap;
                    `}
                  >
                    <Text as="p" color="text" variant="caption" sx={{ paddingY: 3 }}>
                      {action.amount.gte(0.01)
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
                      {cutMiddle(action.senderAddress, 8, 6)}
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
