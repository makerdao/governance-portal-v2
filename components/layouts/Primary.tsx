import { Box, Container } from 'theme-ui';

import Header from '../Header';

type props = {};

const PrimaryLayout: React.FC<React.PropsWithChildren<props>> = ({
  children
}) => {
  return (
    <Container mx="auto" px={4}>
      <Header />
      <Box as="main">{children}</Box>
      {/* <Footer /> */}
    </Container>
  );
};

export default PrimaryLayout;
