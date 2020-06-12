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
        maxWidth: 'page',
        mx: 'auto',
        variant: 'layout.root',
        px: [0, 4]
      }}
    >
      <Header />
      <main
        sx={{
          width: '100%',
          flex: '1 1 auto',
          variant: 'layout.main'
        }}
      >
        <Container sx={{}}>{children}</Container>
      </main>
      <Footer shorten={shortenFooter || false} />
    </Flex>
  );
};

export default PrimaryLayout;
