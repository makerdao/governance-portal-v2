/** @jsx jsx */
import { Box, Text, jsx } from 'theme-ui';
import useUiFiltersStore from 'stores/uiFilters';
import shallow from 'zustand/shallow';

export function PollCategoryTag({ category }: { category: string }): React.ReactElement {
  const categories = {
    Collateral: {
      color: '#D44C96',
      background: '#FFF4FA'
    },
    Oracles: {
      color: '#8F2EC1',
      background: '#FBF2FF'
    },
    Governance: {
      color: '#02CB9B',
      background: '#EBFFFA'
    },
    'Risk Variable': {
      color: '#FF4085',
      background: '#FFF0F4'
    },
    Risk: {
      color: '#EF5277',
      background: '#FEEEF2'
    },
    Technical: {
      color: '#5D48FF',
      background: '#F7F5FF'
    },
    Other: {
      color: '#7D8FAA',
      background: '#F2F5FA'
    },
    MIPs: {
      color: '#00B5D3',
      background: '#EEFAFC'
    },
    Rates: {
      color: '#34AAFF',
      background: '#F1F9FF'
    },
    Auctions: {
      color: '#FF8237',
      background: '#FFF5EF'
    },
    Greenlight: {
      color: '#1AAB9B',
      background: '#EEFFFD'
    },
    Transfer: {
      color: '#635696',
      background: '#F7F4FF'
    },
    Budget: {
      color: '#E7C200',
      background: '#FFFBEF'
    },
    'Core Unit': {
      color: '#FF36C7',
      background: '#FFF3F8'
    },
    Test: {
      color: '#FF8237',
      background: '#FFFBEF'
    },
    Offboard: {
      color: '#FF8237',
      background: '#FFFBEF'
    }
  };

  const color = categories[category] ? categories[category].color : '#AD927D';
  const background = categories[category] ? categories[category].background : '#FFF9F4';

  const [categoryFilter, setCategoryFilter] = useUiFiltersStore(
    state => [state.pollFilters.categoryFilter, state.setCategoryFilter],
    shallow
  );

  function onClickCategory() {
    setCategoryFilter({ ...categoryFilter, [category]: !(categoryFilter || {})[category] });
  }
  return (
    <Box
      sx={{
        background,
        borderRadius: '12px',
        padding: '4px 8px',
        display: 'flex',
        alignItems: 'center',
        cursor: 'pointer',
        color
      }}
      onClick={onClickCategory}
      title={`See all ${category} polls`}
    >
      <Text sx={{ fontSize: '11px' }}>{category}</Text>
    </Box>
  );
}
