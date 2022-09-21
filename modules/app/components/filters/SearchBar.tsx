import { useEffect, useState } from 'react';
import { Box, Input, ThemeUIStyleObject } from 'theme-ui';
import { Icon } from '@makerdao/dai-ui-icons';
import { debounce } from 'modules/app/helpers/debounce';

type Props = {
  sx?: ThemeUIStyleObject;
  onChange: (seach: string) => void;
  value: string | null;
  placeholder?: string;
};

export const SearchBar = ({ onChange, value, placeholder = 'Search', ...props }: Props): JSX.Element => {
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (value) {
      setSearchTerm(value);
    }
  }, []);

  const handleInput = event => {
    setSearchTerm(event.target.value);
    debounce(onChange(event.target.value));
  };

  useEffect(() => {
    if (!value) {
      setSearchTerm('');
    }
  }, [value]);

  const hasSearchTerm = !(!searchTerm || searchTerm === '');

  return (
    <Box sx={{ position: 'relative' }} {...props}>
      <Input
        name="search"
        onChange={handleInput}
        type="search"
        value={searchTerm}
        placeholder={placeholder}
        sx={{
          maxWidth: 250,
          borderRadius: 'round',
          px: 3,
          borderColor: hasSearchTerm ? 'primary' : 'auto',
          '&:focus': {
            borderColor: hasSearchTerm ? 'primary' : 'auto'
          },
          'input:invalid ~ span:after': {
            paddingLeft: '5px',
            position: 'absolute',
            cursor: 'pointer'
          }
        }}
      />
      {!hasSearchTerm && (
        <Box sx={{ position: 'absolute', top: 11, right: 16 }}>
          <Icon name="magnifying_glass" sx={{ color: 'text', size: 3 }} />
        </Box>
      )}
    </Box>
  );
};
