import { Box, Container, Image } from 'theme-ui';
import url from 'url'

import Header from '../Header';
import Footer from '../Footer'
type Props = {};

const PrimaryLayout = ({ children }: React.PropsWithChildren<Props>) => {
  return (
    <Container mx="auto" px={4} sx={{ background: 'url(/assets/heroVisualTransparent.png) no-repeat', backgroundSize: '100%', backgroundPosition: '0 0' }}>
      <Header />
      <Box as="main">{children}</Box>
      <Footer />
    </Container>
  );
};

export default PrimaryLayout;