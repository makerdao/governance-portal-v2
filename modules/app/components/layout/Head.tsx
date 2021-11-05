import Head from 'next/head';

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
          'frame-src https://connect.trezor.io;' +
          "font-src 'self';" +
          "connect-src 'self' https: wss:;" +
          "style-src 'self' 'unsafe-inline';" +
          "img-src 'self' https: data:"
        }
      />
    </Head>
  );
}
