import React from 'react';
import { Box } from 'theme-ui';
import { DialogOverlay, DialogContent } from '@reach/dialog';
import { useBreakpointIndex } from '@theme-ui/match-media';
import { fadeIn, slideUp } from 'lib/keyframes';

const VideoModal = ({
  embedId,
  isOpen,
  onDismiss
}: {
  embedId?: string;
  isOpen: boolean;
  onDismiss: () => void;
}): React.ReactElement => {
  const bpi = useBreakpointIndex();

  return (
    <DialogOverlay isOpen={isOpen} onDismiss={onDismiss}>
      <DialogContent
        aria-label="Video"
        sx={
          bpi === 0
            ? { p: 0, variant: 'dialog.mobile', animation: `${slideUp} 350ms ease` }
            : { p: 0, variant: 'dialog.desktop', animation: `${fadeIn} 350ms ease` }
        }
      >
        <Box sx={{ height: ['180px', '445px'] }}>
          <iframe
            src="https://player.vimeo.com/video/649207489?h=f49086d1ab&color=68FEE3"
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
          {/* <iframe 
          width="600" 
          height="400" 
          sx={{
            width: '100%',
            height: '100%'
          }}
          src={`https://www.youtube-nocookie.com/embed/${embedId}?controls=0`} 
          title="YouTube video player" 
          frameborder="0" 
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
          allowfullscreen /> */}
        </Box>
      </DialogContent>
    </DialogOverlay>
  );
};

export default VideoModal;
