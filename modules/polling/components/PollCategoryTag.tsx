import { Box, Text } from 'theme-ui';
import useUiFiltersStore from 'modules/app/stores/uiFilters';
import shallow from 'zustand/shallow';

export function PollCategoryTag({
  category,
  clickable
}: {
  category: string;
  clickable?: boolean;
}): React.ReactElement {
  const categories = {
    Collateral: {
      color: 'tagColorOne',
      backgroundColor: 'tagColorOneBg'
    },
    Oracles: {
      color: 'tagColorTwo',
      backgroundColor: 'tagColorTwoBg'
    },
    Governance: {
      color: 'tagColorThree',
      backgroundColor: 'tagColorThreeBg'
    },
    'Risk Variable': {
      color: 'tagColorFour',
      backgroundColor: 'tagColorFourBg'
    },
    Risk: {
      color: 'tagColorFive',
      backgroundColor: 'tagColorFiveBg'
    },
    Technical: {
      color: 'tagColorSix',
      backgroundColor: 'tagColorSixBg'
    },
    Other: {
      color: 'tagColorSeven',
      backgroundColor: 'tagColorSevenBg'
    },
    MIPs: {
      color: 'tagColorEight',
      backgroundColor: 'tagColorEightBg'
    },
    Rates: {
      color: 'tagColorNine',
      backgroundColor: 'tagColorNineBg'
    },
    Auctions: {
      color: 'tagColorTen',
      backgroundColor: 'tagColorTenBg'
    },
    Greenlight: {
      color: 'tagColorEleven',
      backgroundColor: 'tagColorElevenBg'
    },
    Transfer: {
      color: 'tagColorTwelve',
      backgroundColor: 'tagColorTwelveBg'
    },
    Budget: {
      color: 'tagColorThirteen',
      backgroundColor: 'tagColorThirteenBg'
    },
    'Core Unit': {
      color: 'tagColorFourteen',
      backgroundColor: 'tagColorFourteenBg'
    },
    Test: {
      color: 'tagColorFifteen',
      backgroundColor: 'tagColorFifteenBg'
    },
    Offboard: {
      color: 'tagColorSixteen',
      backgroundColor: 'tagColorSixteenBg'
    },
    Uncategorized: {
      color: 'tagColorSeventeen',
      backgroundColor: 'tagColorSeventeenBg'
    }
  };

  const color = categories[category] ? categories[category].color : 'tagColorSeventeen';
  const backgroundColor = categories[category] ? categories[category].backgroundColor : 'tagColorSeventeenBg';

  const [categoryFilter, setCategoryFilter] = useUiFiltersStore(
    state => [state.pollFilters.categoryFilter, state.setCategoryFilter],
    shallow
  );

  function onClickCategory() {
    if (clickable) {
      setCategoryFilter({ ...categoryFilter, [category]: !(categoryFilter || {})[category] });
    }
  }
  return (
    <Box
      sx={{
        backgroundColor,
        borderRadius: '12px',
        padding: '4px 8px',
        display: 'flex',
        alignItems: 'center',
        cursor: clickable ? 'pointer' : 'inherit',
        color
      }}
      onClick={onClickCategory}
      title={`See all ${category} polls`}
    >
      <Text sx={{ fontSize: 2 }}>{category}</Text>
    </Box>
  );
}
