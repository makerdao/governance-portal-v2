/*

SPDX-FileCopyrightText: © 2023 Dai Foundation <www.daifoundation.org>

SPDX-License-Identifier: AGPL-3.0-or-later

*/

import TagComponent from 'modules/app/components/Tag';
import useUiFiltersStore from 'modules/app/stores/uiFilters';
import shallow from 'zustand/shallow';
import { Tag, TagCount } from 'modules/app/types/tag';
import { Box } from 'theme-ui';

export function PollCategoryTag({
  tag,
  allTags,
  disableTagFilter = false
}: {
  tag: string | Tag;
  allTags?: TagCount[];
  disableTagFilter?: boolean;
}): React.ReactElement {
  const foundTag = allTags?.find(t => t.id === tag) || (tag as Tag);

  const [categoryFilter, setCategoryFilter] = useUiFiltersStore(
    state => [state.pollFilters.categoryFilter, state.setCategoryFilter],
    shallow
  );

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

  return foundTag ? (
    <Box
      sx={{
        cursor: !disableTagFilter ? 'pointer' : 'inherit'
      }}
      onClick={() => {
        if (!disableTagFilter) {
          setCategoryFilter(
            categoryFilter.includes(foundTag.id)
              ? categoryFilter.filter(c => c !== foundTag.id)
              : [...categoryFilter, foundTag.id]
          );
        }
      }}
    >
      <TagComponent
        tag={foundTag}
        color={categories[foundTag.id]?.color}
        backgroundColor={categories[foundTag.id]?.backgroundColor}
      />
    </Box>
  ) : (
    <></>
  );
}
