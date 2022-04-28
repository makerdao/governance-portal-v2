import React from 'react';
import { Box } from 'theme-ui';
import { DialogOverlay, DialogContent } from '@reach/dialog';
import { useBreakpointIndex } from '@theme-ui/match-media';
import { fadeIn, slideUp } from 'lib/keyframes';

const VideoModal = ({
  url,
  isOpen,
  onDismiss
}: {
  url: string;
  isOpen: boolean;
  onDismiss: () => void;
}): React.ReactElement => {
  const bpi = useBreakpointIndex();

  return (
    <DialogOverlay isOpen={isOpen} onDismiss={onDismiss} sx={{ zIndex: 200 }}>
      <DialogContent
        aria-label="Video"
        sx={
          bpi === 0
            ? {
                variant: 'dialog.mobile',
                animation: `${slideUp} 350ms ease`,
                borderRadius: 0,
                p: 0,
                background: 'black'
              }
            : {
                variant: 'dialog.desktop',
                animation: `${fadeIn} 350ms ease`,
                borderRadius: 0,
                p: 0,
                background: 'black'
              }
        }
      >
        <Box sx={{ height: ['180px', '445px'] }}>
          <iframe
            src={url}
            width="620"
            height="360"
            sx={{
              width: '100%',
              height: '100%'
            }}
            frameBorder="0"
            allow="autoplay; fullscreen; picture-in-picture"
            allowFullScreen
          />
        </Box>
      </DialogContent>
    </DialogOverlay>
  );
};

export default VideoModal;
