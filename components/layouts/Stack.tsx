/** @jsx jsx */
import { jsx } from 'theme-ui';
import { Flex } from 'theme-ui';

type Props = {
  gap: number;
};

/**
 * Usage note: children should not specify their own margins
 */
const StackLayout = ({ children, gap = 4 }: React.PropsWithChildren<Props>) => {
  return (
    <Flex
      sx={{
        width: '100%',
        flexDirection: 'column',
        alignItems: 'stretch',
        '& > * + *': {
          mt: theme => `${theme.sizes[gap]}px !important`
        }
      }}
    >
      {children}
    </Flex>
  );
};

export default StackLayout;
