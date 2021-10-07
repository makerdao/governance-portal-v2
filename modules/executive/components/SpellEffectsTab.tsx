/** @jsx jsx */

import { Box, Text, jsx, Link as ThemeUILink, Flex } from 'theme-ui';
import { getNetwork } from 'lib/maker';
import { getEtherscanLink } from 'lib/utils';
import { Proposal, SpellData } from '../types';

export function SpellEffectsTab({
  proposal,
  spellData
}: {
  proposal: Proposal;
  spellData?: SpellData;
}): React.ReactElement {
  // ch401: hide until API is fixed
  // const [stateDiff, setStateDiff] = useState<SpellStateDiff>();
  // const [stateDiffError, setStateDiffError] = useState();

  // useEffect(() => {
  //   (async () => {
  //     try {
  //       const url = `/api/executive/state-diff/${proposal.address}?network=${getNetwork()}`;
  //       const _stateDiff = parseSpellStateDiff(await fetchJson(url));
  //       setStateDiff(_stateDiff);
  //     } catch (error) {
  //       setStateDiffError(error);
  //     }
  //   })();
  // }, []);

  /*
{stateDiff ? (
        <OnChainFx stateDiff={stateDiff} />
      ) : stateDiffError ? (
        <Flex>Unable to fetch on-chain effects at this time</Flex>
      ) : (
        <Flex sx={{ alignItems: 'center' }}>
          loading <Spinner size={20} ml={2} />
        </Flex>
      )}
  */

  return (
    <Box>
      <Flex sx={{ mb: 3, overflow: 'auto' }}>
        Spell at address
        <ThemeUILink href={getEtherscanLink(getNetwork(), proposal.address, 'address')} target="_blank">
          <Text sx={{ ml: 2, color: 'accentBlue', ':hover': { color: 'blueLinkHover' } }}>
            {proposal.address}
          </Text>
        </ThemeUILink>
      </Flex>
    </Box>
  );
}
