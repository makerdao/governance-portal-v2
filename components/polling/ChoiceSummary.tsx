/** @jsx jsx */
import { Text, Flex, Box, Button, jsx } from 'theme-ui';
import { Icon } from '@makerdao/dai-ui-icons';
import { getNumberWithOrdinal } from 'lib/utils';
import { ABSTAIN } from 'lib/constants';
import { AnalyticsContext } from 'lib/client/analytics/AnalyticsContext';
import { useContext } from 'react';

const ChoiceSummary = ({ choice, poll, edit, voteIsPending, ...props }) => {
  const { trackUserEvent } = useContext(AnalyticsContext);

  const voteBoxStyle = props.showHeader ? {} : { width: '100%', justifyContent: 'center', mt: 3 };
  const isSingleSelect = typeof choice === 'number';
  return (
    <Box {...props}>
      {isSingleSelect ? (
        <Box bg="background" sx={{ p: 3, mb: 2 }}>
          <Text>{choice === ABSTAIN ? 'Abstain' : poll.options[choice]}</Text>
        </Box>
      ) : (
        choice.map((id, index) => (
          <Flex sx={{ backgroundColor: 'background', py: 2, px: 3, mb: 2 }} key={index}>
            <Flex sx={{ flexDirection: 'column' }}>
              <Text sx={{ variant: 'text.caps', fontSize: 1 }}>{getNumberWithOrdinal(index + 1)} choice</Text>
              <Text>{poll.options[id]}</Text>
            </Flex>
          </Flex>
        ))
      )}
      <Button
        onClick={() => {
          trackUserEvent('btn-click', {
            id: 'editChoice',
            product: 'governance-portal-v2',
            page: 'PollingReview'
          });
          edit();
        }}
        variant={props.showHeader ? 'smallOutline' : 'outline'}
        sx={{
          display: voteIsPending ? 'none' : 'inline-flex',
          flexDirection: 'row',
          alignItems: 'center',
          ...voteBoxStyle
        }}
      >
        <Icon name="edit" size={3} mr={1} />
        Edit choice{isSingleSelect ? '' : 's'}
      </Button>
    </Box>
  );
};

export default ChoiceSummary;
