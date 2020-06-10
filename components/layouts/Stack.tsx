/** @jsx jsx */
import { jsx } from 'theme-ui';
import { Flex } from 'theme-ui';
import theme from '../../lib/theme';

type Props = {};

const StackLayout = ({ children }: React.PropsWithChildren<Props>) => {
  return (
    <Flex
      sx={{ width: '100%', flexDirection: 'column', alignItems: 'stretch' }}
      css={`
        > * + * {
          margin-top: ${theme.sizes[4]}px !important;
        }
      `}
    >
      {children}
    </Flex>
  );
};

export default StackLayout;
