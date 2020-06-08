import { useMemo } from 'react';
import { Box, NavLink } from 'theme-ui';
import Link from 'next/link';
import { Icon } from '@makerdao/dai-ui-icons';

import { getNetwork } from '../../lib/maker';
import { isActivePoll } from '../../lib/utils';
import useAccountsStore from '../../stores/accounts';
import Poll from '../../types/poll';

type Props = {
  polls: Poll[];
};

const IntroCard = ({ polls }: Props) => {
  const activePolls = useMemo(() => polls.filter(poll => isActivePoll(poll)), [polls]);
  const account = useAccountsStore(state => state.currentAccount);

  if (account) {
    // do something else
    // return ...
  }

  const activePollsFound = activePolls.length > 0;
  return (
    <Box py="5" mx="auto" sx={{ maxWidth: 9, textAlign: 'center' }}>
      <Link
        href={{
          pathname: '/polling',
          query: { network: getNetwork(), ...(activePollsFound && { pollFilter: 'active' }) }
        }}
      >
        <NavLink
          variant="buttons.outline"
          sx={{
            borderRadius: 'round',
            bg: 'background',
            border: '1px solid',
            borderColor: 'secondary',
            color: 'text',
            alignItems: 'center'
          }}
        >
          {activePollsFound ? (
            <>
              <span
                style={{
                  display: 'inline-block',
                  border: '1px solid #1AAB9B',
                  borderRadius: 13,
                  width: 26,
                  height: 26,
                  color: '#1AAB9B',
                  marginRight: 20
                }}
              >
                {activePolls.length}
              </span>
              Live polls in the Maker Governance system
            </>
          ) : (
            'There are no live Governance Polls at the moment'
          )}
          <Icon name="chevron_right" color="#708390" size="2" sx={{ marginLeft: 20 }} />
        </NavLink>
      </Link>
    </Box>
  );
};

export default IntroCard;
