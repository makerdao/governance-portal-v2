// this component passes through to @reach/tooltip on desktop,
// and on mobile, renders a button that opens a sheet

import { DialogOverlay, DialogContent } from '@reach/dialog';
import Tooltip from '@reach/tooltip';

import { useBreakpointIndex } from '@theme-ui/match-media';
import { Box } from 'theme-ui';
import { useState } from 'react';

export default function TooltipComponent({ children, label, ...props }): JSX.Element {
  const bpi = useBreakpointIndex();
  const [isOpen, setOpen] = useState(false);
  return bpi === 0 ? (
    <Box onClick={() => setOpen(true)}>
      {children}
      <DialogOverlay isOpen={isOpen} onDismiss={() => setOpen(false)} sx={{ zIndex: 1 }}>
        <DialogContent sx={{ variant: 'dialog.mobile' }}>
          <Box {...props}>{label}</Box>
        </DialogContent>
      </DialogOverlay>
    </Box>
  ) : (
    <Tooltip
      sx={{ bg: 'surface', borderColor: 'secondary', color: 'text', fontSize: 3, borderRadius: 'medium' }}
      label={label}
      {...props}
    >
      {children}
    </Tooltip>
  );
}
