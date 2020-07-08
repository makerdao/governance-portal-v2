import { Button, Box, Card } from 'theme-ui';
import { Icon } from '@makerdao/dai-ui-icons';
import { useState } from 'react';

type Props = { name: () => string, children: React.ReactNode };

export default function({ name, children }: Props) {
  const [showControls, setShowControls] = useState(false);
  return (
    <Box sx={{ position: 'relative' }}>
      <Button
        variant="outline"
        sx={{ display: 'flex', alignItems: 'center' }}
        onClick={() => setShowControls(!showControls)}
      >
        {name()}
        <Icon name="chevron_down" size={2} ml={2} />
      </Button>
      <Card
        p={3}
        sx={{
          position: 'absolute',
          top: '100%',
          left: 0,
          display: showControls ? 'block' : 'none'
        }}
      >
        {children}
      </Card>
    </Box>
  );
}
