/** @jsx jsx */
import { jsx } from 'theme-ui';
import { Flex } from 'theme-ui';
import theme from '../../lib/theme';

type Props = {
  gap: number;
};

/**
 * Usage note: children should not specify their own margins
 */
const StackLayout = ({ children, gap = 4 }: React.PropsWithChildren<Props>) => {
  return (
    <Flex
      sx={{ width: '100%', flexDirection: 'column', alignItems: 'stretch' }}
      css={`
        > * + * {
          margin-top: ${theme.sizes[gap]}px;
        }
      `}
    >
      {children}
    </Flex>
  );
};

export default StackLayout;
