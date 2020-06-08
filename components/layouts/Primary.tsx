import { Container } from 'theme-ui';

import Header from '../Header';
import Footer from '../Footer';

type Props = {
  shortenFooter?: boolean;
};

const PrimaryLayout = ({ children, shortenFooter }: React.PropsWithChildren<Props>) => {
  return (
    <Container mx="auto" px={4}>
      <Header />
      <main>{children}</main>
      <Footer shorten={shortenFooter || false} />
    </Container>
  );
};

export default PrimaryLayout;
