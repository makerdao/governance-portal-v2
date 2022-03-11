import { Box, Flex, Text, Link as ThemeUILink, Heading, Divider } from 'theme-ui';
import { Proposal, SpellData, SpellDiff as SpellDiffType } from '../types';
import { useEffect, useState } from 'react';
import { Icon as DaiUIIcon } from '@makerdao/dai-ui-icons';

import Stack from 'modules/app/components/layout/layouts/Stack';
import SkeletonThemed from 'modules/app/components/SkeletonThemed';
import { formatDateWithoutTime } from 'lib/datetime';
import { formatLocation, formatDiffValue } from '../helpers/spellDiffParsers';
import Tooltip from 'modules/app/components/Tooltip';
// import { formatLocation, formatValue } from '../helpers/spellDiffParsers';

// import { SpellDiff as SpellDiffType } from '../../../pages/executive/[proposal-id]';

const CircleIcon = ({ name }) => (
  <Flex
    mr={2}
    sx={theme => ({
      background: theme.colors?.background,
      borderRadius: '100%',
      width: '34px',
      minWidth: '34px',
      height: '34px',
      alignItems: 'center',
      justifyContent: 'center'
    })}
  >
    <DaiUIIcon name={name} size={3} color="primary" />
  </Flex>
);

const SpellDiff = ({ diffs }) => {
  return diffs.map((diff, i) => {
    const { contract, location, fromVal, toVal } = diff;
    return (
      <Flex key={JSON.stringify(diff[i])} sx={{ flexDirection: 'column' }}>
        {/* <Flex key={JSON.stringify(diff[i]) + i} sx={{ flexDirection: 'column', p: 3, m: 3 }}> */}
        <Divider sx={{ m: 0 }} />
        <Flex sx={{ justifyContent: 'space-between', my: 0, py: 4 }}>
          <Flex sx={{ flexDirection: 'column', gap: 1 }}>
            <Text sx={{ fontWeight: 'semiBold' }}>{`${contract}`}</Text>
            <Tooltip label={location}>
              <Text sx={{ pl: 2 }}>{formatLocation(location)}</Text>
            </Tooltip>
          </Flex>

          <Flex sx={{ flexDirection: 'column', mt: 0, gap: 3 }}>
            <Flex
              sx={{
                flexDirection: 'column',
                alignItems: 'flex-end',
                gap: 1
              }}
            >
              <Text variant="caps" color="onSecondary">
                Old Value
              </Text>
              <Tooltip label={fromVal}>
                <Text>{formatDiffValue(fromVal)}</Text>
              </Tooltip>
            </Flex>

            <Flex
              sx={{
                flexDirection: 'column',
                alignItems: 'flex-end',
                gap: 1
              }}
            >
              <Text variant="caps" color="onSecondary">
                New Value
              </Text>
              <Tooltip label={toVal}>
                <Text>{formatDiffValue(toVal)}</Text>
              </Tooltip>
            </Flex>
          </Flex>
        </Flex>
      </Flex>
    );
  });
};

export function SpellEffectsTab({
  proposal,
  spellData,
  spellDiffs
}: {
  proposal: Proposal;
  spellData?: SpellData;
  spellDiffs?: SpellDiffType[];
}): React.ReactElement {
  const [expanded, setExpanded] = useState(false);

  return spellData ? (
    <Box>
      <Text
        as="p"
        variant="microHeading"
        sx={{
          mb: 4
        }}
      >
        Spell Details
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
          sx={theme => ({
            background: theme.colors?.background,
            p: 3,
            transition: 'all 300ms linear',
            overflow: 'hidden',
            borderRadius: '3px'
          })}
        >
          <Flex
            sx={{
              justifyContent: 'space-between'
            }}
          >
            {spellData?.executiveHash && (
              <Text sx={{ mr: 2, fontWeight: 'semiBold', wordBreak: 'break-all' }}>
                {spellData?.executiveHash}
              </Text>
            )}
            <Box sx={{ cursor: 'pointer', ml: 2, minWidth: '99px' }} onClick={() => setExpanded(!expanded)}>
              <Text color={'textMuted'}>
                What&apos;s this? <DaiUIIcon name={expanded ? 'chevron_up' : 'chevron_down'} size={2} />
              </Text>
            </Box>
          </Flex>

          {expanded && (
            <Box sx={{ mt: 3 }}>
              <Text as="p" color="textMuted">
                This hash allows for manually verifying that the spell belongs to the correct Executive
                Proposal. It can be reproduced by hashing the raw markdown text of this Executive Proposal.
                The hash, the URL to the raw markdown text, and the correct hashing algorithm are all
                registered on the blockchain in the spell smart contract.
              </Text>
              <Box sx={{ mt: 3 }}>
                <ThemeUILink
                  href={'https://makerdao.world/en/learn/governance/audit-exec-spells'}
                  target="_blank"
                >
                  <Text sx={{ color: 'accentBlue', ':hover': { color: 'blueLinkHover' } }}>
                    Learn more about auditing Executive Spells
                    <DaiUIIcon ml={2} name="arrowTopRight" size="2" />
                  </Text>
                </ThemeUILink>
              </Box>
            </Box>
          )}
        </Box>
      </Box>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', mb: 4 }}>
        {'proposalLink' in proposal && (
          <Box sx={{ width: ['100%', '50%'] }}>
            <Text
              as="p"
              sx={{
                fontWeight: 'semiBold'
              }}
            >
              Proposal Markdown
            </Text>
            <Box>
              <ThemeUILink href={proposal.proposalLink} target="_blank">
                <Text sx={{ color: 'accentBlue', ':hover': { color: 'blueLinkHover' } }}>
                  View in GitHub
                  <DaiUIIcon ml={2} name="arrowTopRight" size="2" />
                </Text>
              </ThemeUILink>
            </Box>
          </Box>
        )}
        <Box sx={{ width: ['100%', '50%'] }}>
          {spellData?.expiration && (
            <Flex mb={3} mt={[3, 0]}>
              <CircleIcon name="hourglass" />
              <Box>
                <Text
                  as="p"
                  sx={{
                    fontWeight: 'semiBold'
                  }}
                >
                  Expiration
                </Text>
                <Text as="p" color="textMuted">
                  {formatDateWithoutTime(spellData?.expiration)}
                </Text>
              </Box>
            </Flex>
          )}
          {spellData?.officeHours && (
            <Flex mb={3}>
              <CircleIcon name="clock" />
              <Box>
                <Text
                  as="p"
                  sx={{
                    fontWeight: 'semiBold'
                  }}
                >
                  Office Hours Only
                </Text>
                <Text as="p" color="textMuted">
                  Spell will only be executed Monday through Friday between 14:00 and 21:00 UTC
                </Text>
              </Box>
            </Flex>
          )}
        </Box>
      </Box>
      {spellDiffs && <SpellDiff diffs={spellDiffs} />}
    </Box>
  ) : (
    <Stack gap={3}>
      <SkeletonThemed />
      <SkeletonThemed />
      <SkeletonThemed />
    </Stack>
  );
}
