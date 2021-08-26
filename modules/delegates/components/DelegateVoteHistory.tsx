import { AddressAPIStats } from 'modules/address/types/addressApiResponse';
import { Box } from 'theme-ui';
import { Delegate } from '../types';

export function DelegateVoteHistory({ delegate, stats }: { delegate: Delegate, stats: AddressAPIStats}): React.ReactElement {
  return (
    <Box>
      Vote History
    </Box>
  );
}