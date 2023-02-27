/*

SPDX-FileCopyrightText: © 2023 Dai Foundation <www.daifoundation.org>

SPDX-License-Identifier: AGPL-3.0-or-later

*/

import TagComponent from 'modules/app/components/Tag';
import { Tag, TagCount } from 'modules/app/types/tag';
import { Box, Flex } from 'theme-ui';

export default function DelegateTags({
  delegateTags,
  allTags
}: {
  delegateTags: string[] | Tag[];
  allTags?: TagCount[];
}): React.ReactElement {
  const tagColors = {
    academia: {
      color: 'tagColorOne',
      backgroundColor: 'tagColorOneBg'
    },
    community: {
      color: 'tagColorTwo',
      backgroundColor: 'tagColorTwoBg'
    },
    compliance: {
      color: 'tagColorThree',
      backgroundColor: 'tagColorThreeBg'
    },
    'data-driven': {
      color: 'tagColorFour',
      backgroundColor: 'tagColorFourBg'
    },
    decentralization: {
      color: 'tagColorFive',
      backgroundColor: 'tagColorFiveBg'
    },
    growth: {
      color: 'tagColorSix',
      backgroundColor: 'tagColorSixBg'
    },
    ideation: {
      color: 'tagColorSeven',
      backgroundColor: 'tagColorSevenBg'
    },
    'multi-chain': {
      color: 'tagColorEight',
      backgroundColor: 'tagColorEightBg'
    },
    pragmatism: {
      color: 'tagColorNine',
      backgroundColor: 'tagColorNineBg'
    },
    responsibility: {
      color: 'tagColorTen',
      backgroundColor: 'tagColorTenBg'
    },
    revenue: {
      color: 'tagColorEleven',
      backgroundColor: 'tagColorElevenBg'
    },
    risk: {
      color: 'tagColorTwelve',
      backgroundColor: 'tagColorTwelveBg'
    },
    scalability: {
      color: 'tagColorThirteen',
      backgroundColor: 'tagColorThirteenBg'
    },
    security: {
      color: 'tagColorFourteen',
      backgroundColor: 'tagColorFourteenBg'
    },
    simplicity: {
      color: 'tagColorFifteen',
      backgroundColor: 'tagColorFifteenBg'
    },
    sustainability: {
      color: 'tagColorSixteen',
      backgroundColor: 'tagColorSixteenBg'
    },
    trust: {
      color: 'tagColorSeventeen',
      backgroundColor: 'tagColorSeventeenBg'
    },
    vision: {
      color: 'tagColorFive',
      backgroundColor: 'tagColorFiveBg'
    },
    guidance: {
      color: 'tagColorThirteen',
      backgroundColor: 'tagColorThirteenBg'
    },
    other: {
      color: 'tagColorEleven',
      backgroundColor: 'tagColorElevenBg'
    }
  };

  return (
    <Flex sx={{ flexWrap: 'wrap' }}>
      {delegateTags.map(tag => {
        const foundTag = (!allTags ? tag : allTags.find(t => t.id === tag.id || t.id === tag)) as
          | Tag
          | TagCount;

        if (!foundTag) {
          return <></>;
        }

        return (
          <Box
            key={foundTag.id}
            sx={{
              m: 2,
              cursor: 'help'
            }}
          >
            <TagComponent
              tag={foundTag}
              color={tagColors[foundTag.id]?.color}
              backgroundColor={tagColors[foundTag.id]?.backgroundColor}
            />
          </Box>
        );
      })}
    </Flex>
  );
}
