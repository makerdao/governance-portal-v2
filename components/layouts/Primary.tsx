import { Box, Container } from 'theme-ui';

import Header from '../Header';

type Props = {};

const PrimaryLayout = ({ children }: React.PropsWithChildren<Props>) => {
  return (
    <Container mx="auto" px={4}>
      <Header />
      <Box as="main">{children}</Box>
      {/* <Footer /> */}
    </Container>
  );
};

export default PrimaryLayout;
