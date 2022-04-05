import Head from 'next/head';

import { config } from 'lib/config';

export function HeadComponent({
  title,
  description,
  image,
  url
}: {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
}): React.ReactElement {
  const dev = config.NODE_ENV === 'development';

  const defaultDescription =
    'The MakerDAO Governance Portal allows for anyone to view governance proposals, and also allows for MKR holders to vote.';
  const defaultTitle = 'Governance Portal';

  const renderedTitle = title || defaultTitle;
  const renderedDescription = description || defaultDescription;
  return (
    <Head>
      <title>Maker Governance - {renderedTitle}</title>
      <meta name="description" content={renderedDescription} />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <meta property="og:title" content={renderedTitle} />
      <meta property="og:description" content={renderedDescription} />
      {image && <meta property="og:image" content={image} />}
      {url && <meta property="og:url" content={url}></meta>}

      <meta name="twitter:title" content={renderedTitle} />
      <meta name="twitter:description" content={renderedDescription} />
      {image && <meta name="twitter:image" content={image} />}
      <meta name="twitter:card" content="summary_large_image"></meta>

      <meta
        httpEquiv="Content-Security-Policy"
        content={
          "default-src 'none';" +
          'frame-src https://connect.trezor.io https://www.youtube-nocookie.com https://player.vimeo.com;' +
          "font-src 'self';" +
          "connect-src http://localhost:8545/ 'self' https: wss:;" +
          "style-src 'self' 'unsafe-inline';" +
          `script-src 'self' https://gc.zgo.at/count.js ${
            dev ? "'unsafe-eval'" : ''
          } 'sha256-a0L6Pfwt+Nftvey0NflqMTGt/tO5UMFmI/PAiNnoYRo=';` +
          "img-src 'self' https: data:"
        }
      />
    </Head>
  );
}
