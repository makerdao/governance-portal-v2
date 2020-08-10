/** @jsx jsx */
import { Box, Flex, jsx } from 'theme-ui';

import Header from '../Header';
import Footer from '../Footer';

type Props = {
  shortenFooter?: boolean;
  sxAlt?: {
    maxWidth: string;
  };
};

const PrimaryLayout = ({ children, shortenFooter, sxAlt }: React.PropsWithChildren<Props>) => {
  return (
    <Flex
      sx={{
        flexDirection: 'column',
        minHeight: '100vh',
        mx: 'auto',
        variant: 'layout.root',
        px: [3, 4],
        ...sxAlt
      }}
    >
      <Header />
      <Box as="main" sx={{ width: '100%', flex: '1 1 auto', variant: 'layout.main' }}>
        {children}
      </Box>
      <Footer shorten={shortenFooter || false} />
    </Flex>
  );
};

export default PrimaryLayout;
