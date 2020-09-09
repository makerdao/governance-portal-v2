import React from 'react';
import { Flex, Close } from 'theme-ui';
import { useBreakpointIndex } from '@theme-ui/match-media';
import { DialogOverlay, DialogContent } from '@reach/dialog';

const VoteModal = ({ showDialog, close }) => {
  const bpi = useBreakpointIndex();
  return (
    <DialogOverlay style={{ background: 'hsla(0, 100%, 100%, 0.9)' }} isOpen={showDialog} onDismiss={close}>
      <DialogContent
        aria-label="Executive Vote"
        sx={
          bpi === 0
            ? { variant: 'dialog.mobile' }
            : { boxShadow: '0px 10px 50px hsla(0, 0%, 0%, 0.33)', width: '450px', borderRadius: '8px' }
        }
      >
        <Flex sx={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Close aria-label="close" sx={{ height: '18px', width: '18px', p: 0 }} onClick={close} />
        </Flex>
      </DialogContent>
    </DialogOverlay>
  );
};

export default VoteModal;
