import { Box } from 'theme-ui';
import { Delegate } from '../types';

export function DelegateCredentials({ delegate }: { delegate: Delegate} ): React.ReactElement {
  return (
    <Box p={[3,4]}>
      <div
          sx={{ variant: 'markdown.default' }}
          dangerouslySetInnerHTML={{ __html: delegate.description }}
        />
    </Box>
  );
}