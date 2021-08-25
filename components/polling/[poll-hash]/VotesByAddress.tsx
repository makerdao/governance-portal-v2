import { Box, Text } from 'theme-ui';
import { cutMiddle } from 'lib/utils';

const VotesByAddress = ({ votes }) => {
  console.log({ votes });
  return (
    <Box>
      <Text variant="microHeading" sx={{ mb: 3 }}>
        Voting By Address
      </Text>
      <table
        style={{
          width: '100%',
          borderCollapse: 'collapse'
        }}
      >
        <thead>
          <tr>
            <Text as="th" style={{ textAlign: 'left' }} variant="caps">
              Voted
            </Text>
            <Text as="th" style={{ textAlign: 'left' }} variant="caps">
              Voting Power
            </Text>
            <Text as="th" style={{ textAlign: 'left' }} variant="caps">
              MKR Amount
            </Text>
            <Text as="th" style={{ textAlign: 'right' }} variant="caps">
              Address
            </Text>
          </tr>
        </thead>
        <tbody>
          {votes ? (
            votes.map((v, i) => (
              <tr key={i}>
                <Text as="td">{v.optionId}</Text>
                <Text as="td">tbd</Text>
                <Text as="td">{v.mkrSupport}</Text>
                <Text as="td" sx={{ textAlign: 'right' }}>
                  {cutMiddle(v.voter)}
                </Text>
              </tr>
            ))
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
