/** @jsx jsx */
import { Flex, Container, jsx } from 'theme-ui';

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
        minWidth: [0, 'page'],
        // mx: 'auto',
        justifyContent: 'center',
        alignItems: 'center',
        variant: 'layout.root',
        px: [0, 5]
      }}

    >
      <Header sx={{px: 0}}/>
      {children}

      <Footer shorten={shortenFooter || false} />
    </Flex>
  );
};

export default PrimaryLayout;
