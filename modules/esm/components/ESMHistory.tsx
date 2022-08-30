import BigNumber from 'lib/bigNumberJs';
import { Card, Text, Spinner } from 'theme-ui';
import { useBreakpointIndex } from '@theme-ui/match-media';
import { useWeb3 } from 'modules/web3/hooks/useWeb3';
import { formatRound } from 'lib/utils';
import { formatDateWithTime, formatDateWithoutTime } from 'lib/datetime';
import { cutMiddle } from 'lib/string';
import { AllEsmJoinsRecord } from 'modules/gql/generated/graphql';
import { getEtherscanLink } from 'modules/web3/helpers/getEtherscanLink';
import { ExternalLink } from 'modules/app/components/ExternalLink';

type Props = {
  allEsmJoins: AllEsmJoinsRecord[] | undefined;
};

const ESMHistory = ({ allEsmJoins }: Props): JSX.Element => {
  const bpi = useBreakpointIndex();
  const { network } = useWeb3();

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
            allEsmJoins
              .sort((a, b) => (a.blockTimestamp > b.blockTimestamp ? -1 : 1))
              .map(
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
                        <Text as="p" color="text" variant="caption" sx={{ paddingY: 3, mr: 2 }}>
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
                        <Text as="p" color="text" variant="caption" sx={{ paddingY: 3, mr: 2 }}>
                          {amount.gte(0.1)
                            ? formatRound(amount.toNumber())
                            : formatRound(amount.toNumber(), 3)}{' '}
                          MKR
                        </Text>
                      </td>
                      <td>
                        <ExternalLink
                          href={getEtherscanLink(network, action.txFrom, 'address')}
                          styles={{ color: 'accentBlue' }}
                          title="View on etherscan"
                        >
                          <Text as="p" color="accentBlue" variant="caption" sx={{ paddingY: 3, mr: 2 }}>
                            {cutMiddle(action.txFrom, bpi > 0 ? 8 : 4, bpi > 0 ? 6 : 4)}
                          </Text>
                        </ExternalLink>
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
