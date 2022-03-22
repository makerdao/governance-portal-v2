import { DialogOverlay, DialogContent } from '@reach/dialog';
import { useBreakpointIndex } from '@theme-ui/match-media';
import { Text } from 'theme-ui';
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
          <Text>Core unit member bla blah </Text>
        </BoxWithClose>
      </DialogContent>
    </DialogOverlay>
  );
};
