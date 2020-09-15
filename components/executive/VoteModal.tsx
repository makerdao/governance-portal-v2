import React from 'react';
import { Grid, Button, Flex, Close, Text, Textarea, Box, Label } from 'theme-ui';
import { useBreakpointIndex } from '@theme-ui/match-media';
import { DialogOverlay, DialogContent } from '@reach/dialog';
// import ProposalPage from '../../pages/executive/[proposal-id]';

const VoteModal = ({ showDialog, close, proposal }) => {
  const bpi = useBreakpointIndex()
  return (
    <DialogOverlay style={{ background: 'hsla(237.4%, 13.8%, 32.7%, 0.9)' }} isOpen={showDialog} onDismiss={close}>
      <DialogContent
        aria-label='Executive Vote'
        sx={
          bpi === 0
            ? { variant: 'dialog.mobile' }
            : { boxShadow: '0px 10px 50px hsla(0, 0%, 0%, 0.33)', width: '650px', borderRadius: '8px' }
        }
      >
        <Flex sx={{ flexDirection: 'column', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          
           <Close aria-label='close' sx={{ height: '18px', width: '18px', p: 0, alignSelf: 'flex-end' }} onClick={close} />
        
        <Text variant='heading' sx={{fontSize: 6}}>Confirm Vote</Text>
        <Text sx={{marginTop: 3, color: 'onSecondary'}}>You are voting for the following executive proposal</Text>
        <Box sx={{mt: 2, p: 3, width: '100%', mx: 3, backgroundColor: 'background', textAlign: 'center'}}>
          <Text>{proposal.title}</Text>
        </Box>
        <Grid columns={3} sx={{borderRadius: 'small', border: '1px solid black', mt: 3, flexDirection: 'row', justifyContent:'center', alignItems: 'center'}}>
          <Box sx={{p: 3, pt: 2, height: '100%', borderRight: '1px solid black'}}>
            <Text color='onSecondary' sx={{fontSize: 3}}>Your voting weight</Text>
            <Text color='#434358' mt={2} sx={{fontSize: 3}}>voting.weight MKR</Text>
          </Box>
          <Box sx={{p: 3, pt: 2, height: '100%', borderRight: '1px solid black'}}>
            <Text color='onSecondary' sx={{fontSize: 3}}>MKR supporting</Text>
            <Text color='#434358' mt={2} sx={{fontSize: 3}}>mkr.supporting MKR</Text>
          </Box>
          <Box sx={{p: 3, pt: 2, height: '100%'}}>
            <Text color='onSecondary' sx={{fontSize: 3}}>After vote cast</Text>
            <Text color='#434358' mt={2} sx={{fontSize: 3}}>mkr.supporting + voting.weight MKR</Text>
          </Box>

          
        </Grid>
        <Box as='form' sx={{ width: '100%' }}>
            <Label htmlFor='reason'>Why are you voting for this proposal?</Label>
            <Textarea name='reason' defaultValue={`Optional. 250 character max. You'll be prompted to sign a message with your wallet`} />
            <Button variant='primary' sx={{width: '100%'}}>
              Submit Vote
            </Button>
          </Box>
        </Flex>

      </DialogContent>
    </DialogOverlay>
  );
};

export default VoteModal;
