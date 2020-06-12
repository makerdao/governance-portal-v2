/** @jsx jsx */
import { Flex, jsx } from 'theme-ui';

type Props = {
  gap?: number | number[];
  justifyContent?: string;
};

const WrapLayout = ({ children, gap = 4, justifyContent }: React.PropsWithChildren<Props>) => {
  return (
    <Flex
      sx={{
        justifyContent: justifyContent || 'flex-start',
        alignItems: 'center',
        flexDirection: 'row',
        flexWrap: 'wrap',
        '& > *:not(:last-child)': {
          // this is more specific than the owl selector so it can override theme-ui's class-based margin: 0
          // while still allowing breakpoints and without preventing !important overrides from children *sigh*
          mr: gap
        }
      }}
    >
      {children}
    </Flex>
  );
};

export default WrapLayout;
