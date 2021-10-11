/** @jsx jsx */

import { Box, Text, jsx, Link as ThemeUILink, Flex } from 'theme-ui';
import { getNetwork } from 'lib/maker';
import { getEtherscanLink } from 'lib/utils';
import { CMSProposal, SpellData } from '../types';
import { useState } from 'react';
import { Icon } from '@makerdao/dai-ui-icons';
import SkeletonThemed from 'modules/app/components/SkeletonThemed';

export function SpellEffectsTab({
  proposal,
  spellData
}: {
  proposal: CMSProposal;
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
      console.log(proposal, spellData)
  const [expanded, setExpanded] = useState(false);

  return (
    <Box>
      <Text
        as="p"
        variant="microHeading"
        sx={{
          mb: 4
        }}
      >
        Spell details
      </Text>
      <Box mb={4}>
        <Text
          as="p"
          sx={{
            fontWeight: 'semiBold'
          }}
        >
          Executive Hash
        </Text>

        <Box
          sx={{
            background: '#F6F8F9',
            p: 3,
            transition: 'all 300ms linear',
            overflow: 'hidden',
            borderRadius: '3px'
          }}
        >
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between'
            }}
          >
            {spellData?.executiveHash ? <Text  sx={{ mr: 2, fontWeight: 'semiBold', wordBreak: 'break-all' }}>{spellData?.executiveHash}</Text> : <SkeletonThemed width='300px' height='15px' />}

            <Box sx={{ cursor: 'pointer', ml: 2, minWidth: '99px' }} onClick={() => setExpanded(!expanded)}>
              <Text color={'textMuted'}>What&apos;s this? <Icon name={expanded ? 'chevron_up' : 'chevron_down'} size={2} /></Text>
            </Box>
          </Box>

          {expanded && (
            <Box sx={{ mt: 3 }}>
              <Text as="p" color="textMuted">
                This hash allows for manually verifying that the Spell belongs to the correct Executive
                Proposal. It can be reproduced by hashing the raw markdown text of this Executive Proposal.
                The hash, the URL to the raw markdown text, and the correct hashing algorithm are all
                registered on the blockchain in the Spell smart contract.
              </Text>
              <Box sx={{ mt: 3 }}>
                <ThemeUILink
                  href={getEtherscanLink(getNetwork(), proposal.address, 'address')}
                  target="_blank"
                >
                  <Text sx={{ color: 'accentBlue', ':hover': { color: 'blueLinkHover' } }}>
                    Learn more about auditing Executive Spells
                    <Icon ml={2} name="arrowTopRight" size="2" />
                  </Text>
                </ThemeUILink>
              </Box>
            </Box>
          )}
        </Box>
      </Box>

      <Box sx={{ display: 'flex', flexWrap: 'wrap' }}>
        <Box sx={{ width: ['100%', '50%'] }}>
          <Text
            as="p"
            sx={{
              fontWeight: 'semiBold'
            }}
          >
            Executive Hash
          </Text>
          <Box >
            <ThemeUILink
              href={proposal.proposalLink}
              target="_blank"
            >
              <Text sx={{ color: 'accentBlue', ':hover': { color: 'blueLinkHover' } }}>
                View in GitHub
                <Icon ml={2} name="arrowTopRight" size="2" />
              </Text>
            </ThemeUILink>
          </Box>
        </Box>
        <Box sx={{ width: ['100%', '50%'] }}>
          <Text
            as="p"
            sx={{
              fontWeight: 'semiBold'
            }}
          >
            Expiration
          </Text>
        </Box>
      </Box>


      Spell at address
      <ThemeUILink href={getEtherscanLink(getNetwork(), proposal.address, 'address')} target="_blank">
        <Text sx={{ ml: 2, color: 'accentBlue', ':hover': { color: 'blueLinkHover' } }}>
          {proposal.address}
        </Text>
      </ThemeUILink>
    </Box>
  );
}
