import { useEffect, useState } from 'react';
import { Box, Input, ThemeUIStyleObject } from 'theme-ui';
import { Icon } from '@makerdao/dai-ui-icons';
import shallow from 'zustand/shallow';
import useUiFiltersStore from 'modules/app/stores/uiFilters';
import { debounce } from 'modules/app/helpers/debounce';

type Props = {
  sx?: ThemeUIStyleObject;
};

export const PollTitleSearch = ({ ...props }: Props): JSX.Element => {
  const [searchTerm, setSearchTerm] = useState('');
  const [title, setTitle] = useUiFiltersStore(state => [state.pollFilters.title, state.setTitle], shallow);

  const handleInput = event => {
    setSearchTerm(event.target.value);
    debounce(setTitle(event.target.value));
  };

  useEffect(() => {
    if (title === null) {
      setSearchTerm('');
    }
  }, [title]);

  return (
    <Box sx={{ position: 'relative' }}>
      <Input
        name="pollSearch"
        onChange={handleInput}
        type="search"
        value={searchTerm}
        placeholder="Search poll titles"
        sx={{ maxWidth: 250, borderRadius: 'round', px: 3 }}
        {...props}
      />
      {(!searchTerm || searchTerm === '') && (
        <Box sx={{ position: 'absolute', top: 11, right: 16 }}>
          <Icon name="magnifying_glass" sx={{ color: 'black', size: 3 }} />
        </Box>
      )}
    </Box>
  );
};
