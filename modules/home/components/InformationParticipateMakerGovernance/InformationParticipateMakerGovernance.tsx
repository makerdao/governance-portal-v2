/*

SPDX-FileCopyrightText: © 2023 Dai Foundation <www.daifoundation.org>

SPDX-License-Identifier: AGPL-3.0-or-later

*/

import { Box, Flex, Heading, Text } from 'theme-ui';
import { Icon } from '@makerdao/dai-ui-icons';
import { useState } from 'react';
import { ExternalLink } from 'modules/app/components/ExternalLink';
import CirclesBackground from '../CirclesBackground';
import { InfoPoint, infoPoints } from './InfoPoints';
import { useBreakpointIndex } from '@theme-ui/match-media';
import { ViewMore } from '../ViewMore';

function Card({
  infoPoint,
  children
}: {
  infoPoint: InfoPoint;
  children?: React.ReactNode;
}): React.ReactElement {
  return (
    <Box sx={{ height: '100%', background: 'transparent' }}>
      <Flex sx={{ height: '100%' }}>
        <Box sx={{ p: 3, display: ['none', 'block'] }}>
          <Heading as="h1" sx={{ fontSize: '32px' }}>
            <Text sx={{ color: infoPoint.color }}>{infoPoint.number}</Text>
          </Heading>
        </Box>
        <Flex
          sx={{
            flexDirection: 'column',
            justifyContent: 'space-between',
            height: '100%',
            flex: 1,
            p: [0, 3],
            pl: [0, 2]
          }}
        >
          <Box>
            <Flex sx={{ alignItems: 'center' }}>
              <Heading as="h1" sx={{ mb: 3, p: [3, 0], flex: 1 }}>
                <Text as="p" sx={{ color: infoPoint.color, display: ['block', 'none'] }}>
                  {infoPoint.number}
                </Text>
                <Text>{infoPoint.titleFirst}</Text>
                <Text sx={{ color: infoPoint.color, ml: 1 }}>{infoPoint.titleSecond}</Text>
              </Heading>
              {children}
            </Flex>

            <Box sx={{ width: ['100%', '100%', '50%'], p: [3, 0] }}>{infoPoint.description}</Box>
          </Box>
          <Box>
            {infoPoint.links.map(link => (
              <Box mb={2} key={link.linkHref} sx={{ p: [3, 0] }}>
                <ExternalLink
                  href={link.linkHref}
                  title={link.linkTitle}
                  styles={{ color: 'inherit', fontWeight: 'semiBold' }}
                >
                  <Flex sx={{ alignItems: 'center' }}>
                    <Text>{link.linkTitle}</Text>
                    <Icon ml={2} name="arrowTopRight" size={3} sx={{ color: infoPoint.color }} />
                  </Flex>
                </ExternalLink>
              </Box>
            ))}
          </Box>
        </Flex>
      </Flex>
    </Box>
  );
}
export default function InformationParticipateMakerGovernance(): React.ReactElement {
  const [active, setActive] = useState(infoPoints[0]);
  const bpi = useBreakpointIndex();

  const indexCard = infoPoints.findIndex(i => i.number === active.number);
  return (
    <CirclesBackground activeColor={active.color} mobile={bpi <= 1}>
      <Box sx={{ mt: 3 }}>
        <Box sx={{ p: 3, height: '100%' }}>
          <Flex sx={{ justifyContent: 'space-between', mb: 3, height: '100%', alignItems: 'center' }}>
            <Box sx={{ mr: 2, flex: 1 }}>
              <Heading as="h2">How to participate in Maker Governance</Heading>
            </Box>
            <Box>
              <ExternalLink
                href="https://manual.makerdao.com/"
                title="Learn more"
                styles={{ color: 'inherit' }}
              >
                <ViewMore label="Learn More" />
              </ExternalLink>
            </Box>
          </Flex>

          <Flex
            sx={{
              flexWrap: ['wrap', 'nowrap']
            }}
          >
            <Box sx={{ mr: 3, width: ['100%', '30%'] }}>
              {infoPoints.map(infoPoint => (
                <Box
                  key={`info-point-${infoPoint.number}`}
                  sx={{
                    mb: [1, 3],
                    backgroundColor: 'semiTransparentBackground',
                    p: [2, 3],
                    borderRadius: 'medium',
                    cursor: 'pointer'
                  }}
                  onClick={() => setActive(infoPoint)}
                >
                  <Box>
                    <Text
                      sx={{
                        color: infoPoint.color,
                        mr: 1
                      }}
                    >
                      {infoPoint.number}
                    </Text>
                    <Text
                      sx={{
                        color: active.number === infoPoint.number ? infoPoint.color : 'text',
                        fontSize: 3,
                        fontWeight: 'semiBold'
                      }}
                    >
                      {infoPoint.title}
                    </Text>
                  </Box>
                </Box>
              ))}
            </Box>
            <Box
              sx={{
                borderRadius: 'medium',
                backgroundColor: 'semiTransparentBackground',
                width: ['100%', '70%'],
                backgroundImage: [
                  'none',
                  'url(/home/understand-governance/00_visual_how_to_participate.png);'
                ],
                backgroundPosition: `100% -${indexCard * 430}px`,
                backgroundSize: ['340px'],
                backgroundRepeat: 'no-repeat',
                transition: 'all 300ms ease-in-out',
                height: ['auto', '430px'],
                overflow: 'hidden'
              }}
            >
              {bpi > 0 ? (
                <Box
                  sx={{ transform: `translateY(-${indexCard * 430}px)`, transition: 'all 300ms ease-in-out' }}
                >
                  {infoPoints.map(infoPoint => (
                    <Box key={`card-${infoPoint.number}`} sx={{ height: '430px' }}>
                      <Card infoPoint={infoPoint} />
                    </Box>
                  ))}
                </Box>
              ) : (
                <Box>
                  <Card infoPoint={active}>
                    <Box
                      sx={{
                        borderRadius: 'medium',
                        backgroundImage: 'url(/home/understand-governance/00_visual_how_to_participate.png);',
                        backgroundPosition: `100% -${indexCard * 160}px`,
                        backgroundSize: ['130px'],
                        backgroundRepeat: 'no-repeat',
                        transition: 'all 300ms ease-in-out',
                        height: '150px',
                        width: '150px',
                        overflow: 'hidden'
                      }}
                    />
                  </Card>
                </Box>
              )}
            </Box>
          </Flex>
        </Box>
      </Box>
    </CirclesBackground>
  );
}
