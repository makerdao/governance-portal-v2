/** @jsx jsx */
import { Grid, Text, Box, Link as ExternalLink, jsx } from 'theme-ui';
import BigNumber from 'bignumber.js';

import Stack from '../layouts/Stack';
import SpellStateDiff from '../../types/spellStateDiff';
import { formatAddress } from '../../lib/utils';
import { ethers } from 'ethers';

const Header = ({ stateDiff }) => (
  <Text>
    {Object.keys(stateDiff.groupedDiff).length > 0 ? (
      <>
        {stateDiff.hasBeenCast
          ? `Effects resulting from this spell's execution on block ${new BigNumber(
              stateDiff.executedOn
            ).toFormat()}. `
          : 'Simulated effects if this spell were to be executed now.'}
        Please check the{' '}
        <ExternalLink target="_blank" href="https://docs.makerdao.com">
          MCD Docs
        </ExternalLink>{' '}
        for definitions.{' '}
        <strong>
          NOTE: This shows only changes to the Vat. The rest of the MCD contracts will be added soon.
        </strong>
      </>
    ) : (
      'This spell has no on-chain effects.'
    )}
  </Text>
);

export default function OnChainFx({ stateDiff, ...props }: { stateDiff: SpellStateDiff }): JSX.Element {
  return (
    <Stack gap={3}>
      <Header stateDiff={stateDiff} />
      <Stack gap={3} {...props}>
        {Object.entries(stateDiff.groupedDiff).map(([label, diffs]) => (
          <Box key={label}>
            <Text sx={{ fontWeight: 'bold', textTransform: 'uppercase' }}>{label}</Text>
            <Grid columns="max-content max-content 3ch max-content" sx={{ rowGap: 0, overflowX: 'scroll' }}>
              {diffs.map((diff, index) => (
                <>
                  <Text key={index} sx={{ fontWeight: 'semibold', fontSize: 3, mr: 3 }}>
                    {diff.name}
                    {diff.keys
                      ? diff.keys.map(key => `[${ethers.utils.isAddress(key) ? formatAddress(key) : key}]`)
                      : ''}
                    {diff.field ? `.${diff.field}` : ''}
                  </Text>
                  <Text>
                    {new BigNumber(diff.from).toFormat(diff.from.toString().split('.')?.[1]?.length || 0)}
                  </Text>
                  <Text>{'=>'}</Text>
                  <Text>
                    {new BigNumber(diff.to).toFormat(diff.to.toString().split('.')?.[1]?.length || 0)}
                  </Text>
                </>
              ))}
            </Grid>
          </Box>
        ))}
      </Stack>
    </Stack>
  );
}
