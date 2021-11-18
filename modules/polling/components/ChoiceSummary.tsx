import { Text, Flex, Box, Button } from 'theme-ui';
import { Icon } from '@makerdao/dai-ui-icons';
import { getNumberWithOrdinal } from 'lib/utils';
import { ABSTAIN } from 'lib/constants';
import { useAnalytics } from 'modules/app/client/analytics/useAnalytics';
import { ANALYTICS_PAGES } from 'modules/app/client/analytics/analytics.constants';

const ChoiceSummary = ({ choice, poll, edit, voteIsPending, ...props }): React.ReactElement => {
  const { trackButtonClick } = useAnalytics(ANALYTICS_PAGES.POLLING_REVIEW);

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
          trackButtonClick('editChoice');
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
