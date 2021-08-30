import { Box, Divider } from 'theme-ui';
import { Delegate } from '../types';
import { DelegateMKRDelegatedStats } from './DelegateMKRDelegatedStats';

export function DelegateCredentials({ delegate }: { delegate: Delegate }): React.ReactElement {
  return (
    <Box>
      <Box p={[3, 4]}>
        <div
          sx={{ variant: 'markdown.default' }}
          dangerouslySetInnerHTML={{ __html: delegate.description }}
        />


      </Box>
      <Divider my={0} />
      <Box sx={{ p: [3,4], display: 'flex', flexDirection: 'column' }}>
        <DelegateMKRDelegatedStats delegate={delegate} />
      </Box>
    </Box>);
}