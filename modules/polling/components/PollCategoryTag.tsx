/** @jsx jsx */
import { Box, Text, jsx } from 'theme-ui';
import useUiFiltersStore from 'stores/uiFilters';
import shallow from 'zustand/shallow';

export function PollCategoryTag({ category }: { category: string }): React.ReactElement {


  const categories = {
    'Collateral' : {
      color: 'pink',
      background: 'red'
    },
    'Oracles' : {
      color: 'pink',
      background: 'red'
    },
    'Governance' : {
      color: 'pink',
      background: 'red'
    },
    'Risk Variable' : {
      color: 'pink',
      background: 'red'
    },
    'Technical' : {
      color: 'pink',
      background: 'red'
    },
    'Other' : {
      color: 'pink',
      background: 'red'
    },
    'MIPs' : {
      color: 'pink',
      background: 'red'
    },
    'Rates' : {
      color: 'pink',
      background: 'red'
    },
    'Auctions' : {
      color: 'pink',
      background: 'red'
    },
    'Greenlight' : {
      color: 'pink',
      background: 'red'
    },
    'Transfer' : {
      color: 'pink',
      background: 'red'
    },
    'Budget' : {
      color: 'pink',
      background: 'red'
    },
    'Core Unit' : {
      color: 'pink',
      background: 'red'
    },
    'Test' : {
      color: 'pink',
      background: 'red'
    },
    'Offboard' : {
      color: 'pink',
      background: 'red'
    },
  };

  const color = categories[category] ? categories[category].color: 'white';
  const background = categories[category] ? categories[category].background: 'black';

  const [categoryFilter, setCategoryFilter] = useUiFiltersStore(
    state => [state.pollFilters.categoryFilter, state.setCategoryFilter],
    shallow
  );

  function onClickCategory() {
    setCategoryFilter({ ...categoryFilter, [category]: true });
  }
  return (
   
    <Box sx={{
      background,
      borderRadius: '12px',
      padding: '4px 8px',
      display: 'flex',
      alignItems: 'center',
      cursor: 'pointer',
      color,
    }} onClick={onClickCategory} title={`See all ${category} polls`}><Text sx={{ fontSize: '11px'}}>{category}</Text></Box>
  );
}