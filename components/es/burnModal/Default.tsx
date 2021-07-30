/** @jsx jsx */
import { Flex, Button, Text, Grid, jsx, Close } from 'theme-ui';
import { Icon } from '@makerdao/dai-ui-icons';

const DefaultScreen = ({ setShowDialog, setStep }) => (
  <Flex sx={{ flexDirection: 'column', alignItems: 'center' }}>
    <Close onClick={() => setShowDialog(false)} sx={{ alignSelf: 'flex-end' }} />
    <Icon ml={2} name="warning" size={5} sx={{ color: 'notice' }} />
    <Text variant="heading" mt={4}>
      Are you sure you want to burn MKR?
    </Text>
    <Text variant="text" sx={{ mt: 3, textAlign: 'center' }}>
      By burning your MKR in the ESM, you are contributing to the shutdown of the Dai Credit System. Your MKR
      will be immediately burned and cannot be retrieved.
    </Text>
    <Grid columns={2} mt={4}>
      <Button
        onClick={close}
        variant="outline"
        sx={{ color: '#9FAFB9', borderColor: '#9FAFB9', borderRadius: 'small' }}
      >
        Cancel
      </Button>
      <Button
        onClick={() => setStep('amount')}
        variant="outline"
        sx={{ color: 'onNotice', borderColor: 'notice', borderRadius: 'small' }}
      >
        Continue
      </Button>
    </Grid>
  </Flex>
);

export default DefaultScreen;
