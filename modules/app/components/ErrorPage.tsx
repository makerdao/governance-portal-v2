/*

SPDX-FileCopyrightText: © 2023 Dai Foundation <www.daifoundation.org>

SPDX-License-Identifier: AGPL-3.0-or-later

*/

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
  const headTitle = `${statusCode}: ${title}`;
  return (
    <Box>
      <Head>
        <title>{headTitle}</title>
      </Head>
      <Box sx={{ maxWidth: '500px', margin: '0 auto', pt: '200px', paddingBottom: '200px' }}>
        <Flex sx={{ justifyContent: 'center', alignItems: 'center' }}>
          <Text sx={{ fontSize: 5, fontWeight: 'bold', mr: 2 }}>{statusCode}</Text> |{' '}
          <Text sx={{ ml: 2 }}>{title}</Text>
        </Flex>
        <Box pt={3}>{children}</Box>
        <Flex pt={3} sx={{ justifyContent: 'center' }}>
          <Text sx={{ textAlign: 'center' }}>
            For more information or help, please join the{' '}
            <ExternalLink href="https://discord.gg/skyecosystem" title="Discord">
              <Text>Sky Discord</Text>
            </ExternalLink>
          </Text>
        </Flex>
      </Box>
    </Box>
  );
}
