/*

SPDX-FileCopyrightText: © 2023 Dai Foundation <www.daifoundation.org>

SPDX-License-Identifier: AGPL-3.0-or-later

*/

import TagComponent from 'modules/app/components/Tag';
import { Tag } from 'modules/app/types/tag';
import { Box } from 'theme-ui';

export function PollCategoryTag({ tag, onClick }: { tag: Tag; onClick?: () => void }): React.ReactElement {
  const categories = {
    'collateral-onboard': {
      color: 'tagColorOne',
      backgroundColor: 'tagColorOneBg'
    },
    oracle: {
      color: 'tagColorTwo',
      backgroundColor: 'tagColorTwoBg'
    },
    'oracle-whitelist': {
      color: 'tagColorTwo',
      backgroundColor: 'tagColorTwoBg'
    },
    'oracle-feed': {
      color: 'tagColorTwo',
      backgroundColor: 'tagColorTwoBg'
    },
    ratification: {
      color: 'tagColorThree',
      backgroundColor: 'tagColorThreeBg'
    },
    inclusion: {
      color: 'tagColorThree',
      backgroundColor: 'tagColorThreeBg'
    },
    'real-world-assets': {
      color: 'tagColorFour',
      backgroundColor: 'tagColorFourBg'
    },
    'risk-parameter': {
      color: 'tagColorFive',
      backgroundColor: 'tagColorFiveBg'
    },
    technical: {
      color: 'tagColorSix',
      backgroundColor: 'tagColorSixBg'
    },
    'misc-governance': {
      color: 'tagColorSeven',
      backgroundColor: 'tagColorSevenBg'
    },
    delegates: {
      color: 'tagColorEight',
      backgroundColor: 'tagColorEightBg'
    },
    mips: {
      color: 'tagColorEight',
      backgroundColor: 'tagColorEightBg'
    },
    budget: {
      color: 'tagColorNine',
      backgroundColor: 'tagColorNineBg'
    },
    auctions: {
      color: 'tagColorTen',
      backgroundColor: 'tagColorTenBg'
    },
    greenlight: {
      color: 'tagColorEleven',
      backgroundColor: 'tagColorElevenBg'
    },
    d3m: {
      color: 'tagColorTwelve',
      backgroundColor: 'tagColorTwelveBg'
    },
    'misc-funding': {
      color: 'tagColorThirteen',
      backgroundColor: 'tagColorThirteenBg'
    },
    'core-unit-onboard': {
      color: 'tagColorFourteen',
      backgroundColor: 'tagColorFourteenBg'
    },

    'mcd-launch': {
      color: 'tagColorFifteen',
      backgroundColor: 'tagColorFifteenBg'
    },

    'collateral-offboard': {
      color: 'tagColorSixteen',
      backgroundColor: 'tagColorSixteenBg'
    },
    surplus: {
      color: 'tagColorSeventeen',
      backgroundColor: 'tagColorSeventeenBg'
    },
    dsr: {
      color: 'tagColorSeventeen',
      backgroundColor: 'tagColorSeventeenBg'
    },
    momc: {
      color: 'tagColorSeventeen',
      backgroundColor: 'tagColorSeventeenBg'
    },
    psm: {
      color: 'tagColorEleven',
      backgroundColor: 'tagColorElevenBg'
    },
    'black-thursday': {
      color: 'black',
      backgroundColor: '#00000014'
    },
    bridge: {
      color: 'tagColorThirteen',
      backgroundColor: 'tagColorThirteenBg'
    }
  };

  return (
    <Box
      sx={{
        cursor: onClick ? 'pointer' : 'inherit'
      }}
      onClick={onClick}
      title={`See all ${tag.id} polls`}
    >
      <TagComponent
        tag={tag}
        color={categories[tag.id]?.color}
        backgroundColor={categories[tag.id]?.backgroundColor}
      />
    </Box>
  );
}
