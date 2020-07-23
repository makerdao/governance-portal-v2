/** @jsx jsx */
import { Box, Flex, Container, jsx } from 'theme-ui';

import Header from '../Header';
import Footer from '../Footer';

type Props = {
  shortenFooter?: boolean;
};

const PrimaryLayout = ({ children, shortenFooter }: React.PropsWithChildren<Props>) => {
  return (
    <Flex
      sx={{
        flexDirection: 'column',
        minHeight: '100vh',
        mx: 'auto',
        variant: 'layout.root',
        px: [0, 4]
      }}
    >
      <Header />
      <Box as='main'
        sx={{
          width: '100%',
          flex: '1 1 auto',
          variant: 'layout.main'
        }}
      >
        {children}
      </Box>
      <Footer shorten={shortenFooter || false} />
    </Flex>
  );
};

export default PrimaryLayout;
