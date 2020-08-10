/** @jsx jsx */
import { Grid, Text, Box, jsx } from 'theme-ui';
import Bignumber from 'bignumber.js';

import Stack from '../layouts/Stack';
import SpellStateDiff from '../../types/spellStateDiff';
import { formatAddress } from '../../lib/utils';
import { ethers } from 'ethers';

export default function SingleSelect({ stateDiff, ...props }: { stateDiff: SpellStateDiff }): JSX.Element {
  return (
    <Stack gap={3} {...props}>
      {Object.entries(stateDiff.groupedDiff).map(([label, diffs]) => (
        <Box key={label}>
          <Text sx={{ fontWeight: 'bold', textTransform: 'uppercase' }}>{label}</Text>
          <Grid columns="max-content max-content 3ch max-content" sx={{ rowGap: 0, overflowX: 'scroll' }}>
            {diffs.map(diff => (
              <>
                <Text sx={{ fontWeight: 'semibold', fontSize: 3, mr: 3 }}>
                  {diff.name}
                  {diff.keys
                    ? diff.keys.map(key => `[${ethers.utils.isAddress(key) ? formatAddress(key) : key}]`)
                    : ''}
                  {diff.field ? `.${diff.field}` : ''}
                </Text>
                <Text>
                  {new Bignumber(diff.from).toFormat(diff.from.toString().split('.')?.[1]?.length || 0)}
                </Text>
                <Text>{'=>'}</Text>
                <Text>
                  {new Bignumber(diff.to).toFormat(diff.to.toString().split('.')?.[1]?.length || 0)}
                </Text>
              </>
            ))}
          </Grid>
        </Box>
      ))}
    </Stack>
  );
}
