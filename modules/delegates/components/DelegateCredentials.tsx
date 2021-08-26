import { Box } from 'theme-ui';
import { Delegate } from '../types';

export function DelegateCredentials({ delegate }: { delegate: Delegate} ): React.ReactElement {
  return (
    <Box>
      <div
          sx={{ variant: 'markdown.default' }}
          dangerouslySetInnerHTML={{ __html: delegate.description }}
        />
    </Box>
  );
}