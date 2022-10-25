import React from 'react';
import { fadeIn, slideUp } from 'lib/keyframes';

import { DialogOverlay as ReachDialogOverlay, DialogContent as ReachDialogContent } from '@reach/dialog';
import { useBreakpointIndex } from '@theme-ui/match-media';

export function DialogOverlay({
  children,
  isOpen,
  onDismiss
}: {
  children: React.ReactNode;
  isOpen: boolean;
  onDismiss: () => void;
}): React.ReactElement {
  return (
    <ReachDialogOverlay
      isOpen={isOpen}
      onDismiss={onDismiss}
      sx={{
        zIndex: 2
      }}
    >
      {children}
    </ReachDialogOverlay>
  );
}

export function DialogContent({
  children,
  widthDesktop = '450px',
  ariaLabel = ''
}: {
  children: React.ReactNode;
  widthDesktop?: string;
  ariaLabel?: string;
}): React.ReactElement {
  const bpi = useBreakpointIndex();

  return (
    <ReachDialogContent
      aria-label={ariaLabel}
      sx={
        bpi === 0
          ? { variant: 'dialog.mobile', animation: `${slideUp} 350ms ease` }
          : { variant: 'dialog.desktop', animation: `${fadeIn} 350ms ease`, width: widthDesktop }
      }
    >
      {children}
    </ReachDialogContent>
  );
}
