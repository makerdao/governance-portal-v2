import { Container, Box } from 'theme-ui';

import Header from '../Header';
import Footer from '../Footer';

type Props = {
  shortenFooter?: boolean;
};

const PrimaryLayout = ({ children, shortenFooter }: React.PropsWithChildren<Props>) => {
  return (
    <>
      {/* Desktop */}
      <Box sx={{ display: ['none', 'block'] }}>
        <Container mx="auto" px={4} sx={{ px: [0, 4], background: 'url(/assets/heroVisualTransparent.png) no-repeat', backgroundSize: '100%', backgroundPosition: '0 0' }}>
          <Header />
          <main>{children}</main>
          <Footer shorten={shortenFooter || false} />
        </Container>
      </Box>

      {/* Mobile */}
      <Box sx={{ display: ['block', 'none'] }}>
        <Container mx="auto" sx={{ background: 'url(/assets/heroVisualTransparent.png) no-repeat', backgroundSize: '100%', backgroundPosition: '0 0' }}>
          <Header />
          <main>{children}</main>
          <Footer shorten={shortenFooter || false} />
        </Container>
      </Box>
    </>
  );
};

export default PrimaryLayout;
