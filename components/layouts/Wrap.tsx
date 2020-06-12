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
          mr: gap
        }
      }}
    >
      {children}
    </Flex>
  );
};

export default WrapLayout;
