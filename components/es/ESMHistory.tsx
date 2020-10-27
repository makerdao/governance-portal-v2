import { useEffect, useState } from 'react';
import { Card, Text, Link } from 'theme-ui';
import getMaker, { getNetwork } from '../../lib/maker';
import { getEtherscanLink, cutMiddle, formatDateWithTime, formatRound } from '../../lib/utils';
import CurrencyObject from '../../types/currency';

const ESMHistory = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [rows, setRows] = useState([]);

  useEffect(() => {
    (async () => {
      const maker = await getMaker();
      const stakingHistory = await maker.service('esm').getStakingHistory();
      setRows(stakingHistory);
      setIsLoading(false);
    })();
  }, []);
  return (
    <Card mt={3} p={3} pb={4}>
      <table
        style={{
          width: '100%'
        }}
        //   variant="normal"
        // css={`
        //   td,
        //   th {
        //     padding-right: 10px;
        //   }
        // `}
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
          {isLoading ? (
            <tr key={0}>
              <td colSpan={3}>
                <Text color="darkLavender" variant="allcaps">
                  Loading
                </Text>
              </td>
            </tr>
          ) : rows && rows.length > 0 ? (
            rows.map(
              (
                action: {
                  time: string;
                  amount: CurrencyObject;
                  transactionHash: string;
                  senderAddress: string;
                },
                i
              ) => (
                <tr key={i}>
                  <td
                    css={`
                      white-space: nowrap;
                      max-width: 205px;
                      text-overflow: ellipsis;
                      overflow: hidden;
                    `}
                  >
                    <Text color="darkLavender" variant="caption">
                      {formatDateWithTime(action.time)}
                    </Text>
                  </td>
                  <td
                    css={`
                      white-space: nowrap;
                    `}
                  >
                    <Text color="darkLavender" variant="caption">
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
                      color="blue"
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
                <Text color="darkLavender" variant="caption">
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
