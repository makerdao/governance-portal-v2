import { DialogOverlay, DialogContent } from '@reach/dialog';
import { useBreakpointIndex } from '@theme-ui/match-media';
import { Text, Heading, Flex, Button, Link as ExternalLink } from 'theme-ui';
import { Icon } from '@makerdao/dai-ui-icons';
import { fadeIn, slideUp } from 'lib/keyframes';
import { BoxWithClose } from 'modules/app/components/BoxWithClose';

type Props = {
  isOpen: boolean;
  onDismiss: () => void;
};

export const CoreUnitModal = ({ isOpen, onDismiss }: Props): JSX.Element => {
  const bpi = useBreakpointIndex();

  return (
    <DialogOverlay isOpen={isOpen} onDismiss={onDismiss}>
      <DialogContent
        sx={
          bpi === 0
            ? { variant: 'dialog.mobile', animation: `${slideUp} 350ms ease` }
            : {
                variant: 'dialog.desktop',
                animation: `${fadeIn} 350ms ease`,
                width: '580px',
                px: 5,
                py: 4
              }
        }
      >
        <BoxWithClose close={onDismiss}>
          <Flex sx={{ flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
            <Icon
              name={'info'}
              color="voterYellow"
              sx={{
                size: 39,
                mb: 3
              }}
            />
            <Heading sx={{ textAlign: 'center', mb: 3 }}>
              Note: This delegate is also a Core Unit Member
            </Heading>
            <Text sx={{ mb: 3, color: 'onSecondary' }}>
              Core Unit members are paid contributors to MakerDAO. When delegating your MKR to this delegate,
              please be conscious of any potential conflicts of interest. GovAlpha generally advises against
              delegating to CU members.{' '}
            </Text>
            <ExternalLink href={'#'} sx={{ mb: 3 }} target="_blank">
              <Text px={4} sx={{ textAlign: 'center', fontSize: 14, color: 'accentBlue' }}>
                Read More
                <Icon name="arrowTopRight" pt={2} color="accentBlue" />
              </Text>
            </ExternalLink>
            <Button onClick={onDismiss}>Close</Button>
          </Flex>
        </BoxWithClose>
      </DialogContent>
    </DialogOverlay>
  );
};
