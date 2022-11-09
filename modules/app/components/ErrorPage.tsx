import Head from 'next/head';
import { Box, Flex, Text } from 'theme-ui';
import { ExternalLink } from './ExternalLink';

export default function ErrorPage({
  statusCode,
  title = 'An unexpected error has ocurred',
  children
}: {
  statusCode: number;
  title?: string;
  children?: React.ReactElement;
}): React.ReactElement {
  return (
    <Box>
      <Head>
        <title>
          {statusCode}: {title}
        </title>
      </Head>
      <Box sx={{ maxWidth: '500px', margin: '0 auto', pt: '200px', paddingBottom: '200px' }}>
        <Flex sx={{ justifyContent: 'center', alignItems: 'center' }}>
          <Text sx={{ fontSize: 5, fontWeight: 'bold', mr: 2 }}>{statusCode}</Text> |{' '}
          <Text sx={{ ml: 2 }}>{title}</Text>
        </Flex>
        <Box pt={3}>{children}</Box>
        <Box pt={3}>
          <Text sx={{ textAlign: 'center' }}>
            For more information or help, please contact the Development &amp; UX core unit on{' '}
            <ExternalLink href="https://discord.gg/GHcFMdKden" title="Discord">
              <Text>Discord</Text>
            </ExternalLink>
          </Text>
        </Box>
      </Box>
    </Box>
  );
}
