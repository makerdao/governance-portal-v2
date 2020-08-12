/** @jsx jsx */
import { Text, Flex, Box, Button, jsx } from 'theme-ui';
import { Icon } from '@makerdao/dai-ui-icons';
import { getNumberWithOrdinal } from '../../lib/utils';
import { ABSTAIN } from '../../lib/constants';

const ChoiceSummary = ({ choice, poll, edit, voteIsPending, ...props }) => {
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
              <Text sx={{ textTransform: 'uppercase', fontSize: 1, fontWeight: 'bold' }}>
                {getNumberWithOrdinal(index + 1)} choice
              </Text>
              <Text>{poll.options[id]}</Text>
            </Flex>
          </Flex>
        ))
      )}
      <Button
        onClick={edit}
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
