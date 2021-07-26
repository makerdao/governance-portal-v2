/** @jsx jsx */

import Toggle from 'components/es/Toggle';
import useAccountsStore from 'stores/accounts';
import { jsx, Box, Text } from 'theme-ui';

export function DelegateSwitch(): React.ReactElement | null {

  const [voteDelegate, isActingAsDelegate, setIsActingAsDelegate] = useAccountsStore(state => [
    state.voteDelegate,
    state.isActingAsDelegate,
    state.setIsActingAsDelegate
  ]);

  const styles = {
    toggleWrapper: {
      display: 'flex',
      alignItems: 'center'
    }
  };

  return (
    voteDelegate ? <Box>
      <Text as="p" color="textSecondary" variant="caps" sx={{ pt: 2, pb: 2, fontSize: 1, fontWeight: '600' }}>
          Voting delegation
      </Text>
      <Text as="p" sx={{ fontSize: 2, pb: 2 }} color="textSecondary">
        Enable/Disable this switch between your normal account and your delegate account
      </Text>
      <Box sx={styles.toggleWrapper}>
        <Box>
          <Toggle
            active={isActingAsDelegate}
            onClick={(newVal) => setIsActingAsDelegate(newVal)}
            data-testid="allowance-toggle"
          />
        </Box>
        <Text as="p" sx={{ fontSize: 2, pl: 2 }} color="textSecondary">
          { isActingAsDelegate ? 'You are acting as a delegate': 'You are not acting as a delegate. ' }
        </Text>
      </Box>
    </Box>: null
  );
}