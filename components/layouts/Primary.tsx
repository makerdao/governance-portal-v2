/** @jsx jsx */
import { jsx } from 'theme-ui';

import Header from '../Header';
import Footer from '../Footer';

type Props = {
  shortenFooter?: boolean;
};

const PrimaryLayout = ({ children, shortenFooter }: React.PropsWithChildren<Props>) => {
  return (
    <div
      sx={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
        maxWidth: 'page',
        mx: 'auto',
        variant: 'layout.root'
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
        <div
          sx={{
            mx: 'auto',
            px: [0, 4],
            maxWidth: 'page',
            variant: 'layout.container'
          }}
        >
          {children}
        </div>
      </main>
      <Footer shorten={shortenFooter || false} />
    </div>
  );
};

export default PrimaryLayout;
