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
        '& > *': {
          flex: 'auto',
          margin: gap
        }
      }}
    >
      {children}
    </Flex>
  );
};

export default WrapLayout;
