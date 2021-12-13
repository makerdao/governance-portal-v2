import { Text, Flex, Box, Button } from 'theme-ui';
import { getNumberWithOrdinal } from 'lib/utils';
import { ABSTAIN } from 'lib/constants';
import { useAnalytics } from 'modules/app/client/analytics/useAnalytics';
import { ANALYTICS_PAGES } from 'modules/app/client/analytics/analytics.constants';
import isNil from 'lodash/isNil';
import useBallotStore from '../stores/ballotStore';
import shallow from 'zustand/shallow';
import { Icon } from '@makerdao/dai-ui-icons';
import { Poll } from '../types';

const ChoiceSummary = ({
  choice,
  poll,
  edit,
  voteIsPending,
  showHeader,
  ...props
}: {
  poll: Poll;
  edit: () => void;
  voteIsPending: boolean;
  showHeader: boolean;
  choice: number | number[];
}): React.ReactElement => {
  const { trackButtonClick } = useAnalytics(ANALYTICS_PAGES.POLLING_REVIEW);

  const voteBoxStyle = showHeader ? {} : { width: '100%', justifyContent: 'center', mt: 3 };
  const isSingleSelect = typeof choice === 'number';

  const [removeFromBallot, ballot] = useBallotStore(state => [state.removeFromBallot, state.ballot], shallow);

  const onBallot = !isNil(ballot[poll.pollId]?.option);

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
      <Flex sx={{ justifyContent: 'space-between' }}>
        <Button
          onClick={() => {
            trackButtonClick('editChoice');
            edit();
          }}
          variant={showHeader ? 'smallOutline' : 'outline'}
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
        {onBallot && (
          <Button
            onClick={() => {
              removeFromBallot(poll.pollId);
            }}
            variant={showHeader ? 'smallOutline' : 'outline'}
            sx={{
              display: voteIsPending ? 'none' : 'inline-flex',
              flexDirection: 'row',
              alignItems: 'center',
              ml: 2,
              ...voteBoxStyle
            }}
          >
            {' '}
            <Icon mr="1" size={3} name={'ballot'} />
            Remove vote
          </Button>
        )}
      </Flex>
    </Box>
  );
};

export default ChoiceSummary;
