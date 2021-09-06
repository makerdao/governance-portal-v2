/** @jsx jsx */
import { Box, Divider, jsx, Link as ExternalLink, Text } from 'theme-ui';
import { Icon } from '@makerdao/dai-ui-icons';

import { Delegate } from '../types';
import { DelegateMKRDelegatedStats } from './DelegateMKRDelegatedStats';

export function DelegateCredentials({ delegate }: { delegate: Delegate }): React.ReactElement {
  return (
    <Box>
      <Box p={[3, 4]}>
        <Box
          sx={{ variant: 'markdown.default' }}
          dangerouslySetInnerHTML={{ __html: delegate.description }}
        />

        {delegate.externalUrl && (
          <Box sx={{ mt: 2 }}>
            <ExternalLink title="See external profile" href={delegate.externalUrl} target="_blank">
              <Text sx={{ fontSize: [1,3] }}>
                See external profile
                <Icon ml={2} name="arrowTopRight" size={2} />
              </Text>
            </ExternalLink>
          </Box>
        )}
      </Box>
      <Divider my={0} />
      <Box sx={{ p: [3, 4], display: 'flex', flexDirection: 'column' }}>
        <DelegateMKRDelegatedStats delegate={delegate} />
      </Box>
    </Box>
  );
}
