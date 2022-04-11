import { Box, Flex, Heading, Text } from 'theme-ui';
import { Icon } from '@makerdao/dai-ui-icons';
import { useState } from 'react';
import { ExternalLink } from 'modules/app/components/ExternalLink';
import CirclesBackground from '../CirclesBackground';
import { InfoPoint, infoPoints } from './InfoPoints';

function Card({ infoPoint }: { infoPoint: InfoPoint }): React.ReactElement {
  return (
    <Box sx={{ height: '100%', background: ['#ffffffb0', '#ffffffb0', 'transparent'] }}>
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
            background: `url(${infoPoint.image});`,
            backgroundPositionX: '100%',
            backgroundRepeat: 'no-repeat',
            p: 3,
            pl: 2,
            backgroundSize: 'auto 100%'
          }}
        >
          <Box>
            <Heading as="h1" sx={{ mb: 3 }}>
              <Text>{infoPoint.titleFirst}</Text>
              <Text sx={{ color: infoPoint.color, ml: 1 }}>{infoPoint.titleSecond}</Text>
            </Heading>

            <Box sx={{ width: ['100%', '100%', '50%'] }}>{infoPoint.description}</Box>
          </Box>
          <Box>
            {infoPoint.links.map(link => (
              <Box mb={2} key={link.linkHref}>
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

  const indexCard = infoPoints.findIndex(i => i.number === active.number);
  return (
    <CirclesBackground activeColor={active.color}>
      <Box>
        <Box sx={{ p: 3, height: '100%' }}>
          <Flex sx={{ justifyContent: 'space-between', mb: 3, height: '100%', alignItems: 'center' }}>
            <Box sx={{ mr: 2, flex: 1 }}>
              <Heading as="h2">How to participate in Maker Governance</Heading>
            </Box>
            <Box>
              <ExternalLink
                href="https://manual.makerdao.com/"
                title="Learn more"
                styles={{ color: 'inherit', fontSize: [2, 3] }}
              >
                <Flex sx={{ alignItems: 'center' }}>
                  <Text>Learn more</Text>
                  <Icon name="chevron_right" color="primary" size="3" ml="1" />
                </Flex>
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
                    background: 'rgba(255, 255, 255, 0.5)',
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
                        fontSize: [2, 3]
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
                background: ' rgba(255, 255, 255, 0.5)',
                width: ['100%', '70%'],
                backgroundImage: 'url(/home/understand-governance/00_visual_how_to_participate.png);',
                backgroundPosition: `100% -${indexCard * 430}px`,
                backgroundSize: '340px',
                backgroundRepeat: 'no-repeat',
                transition: 'all 300ms ease-in-out',
                height: '430px',
                overflow: 'hidden'
              }}
            >
              <Box
                sx={{ transform: `translateY(-${indexCard * 430}px)`, transition: 'all 300ms ease-in-out' }}
              >
                {infoPoints.map(infoPoint => (
                  <Box key={`card-${infoPoint.number}`} sx={{ height: '430px' }}>
                    <Card infoPoint={infoPoint} />
                  </Box>
                ))}
              </Box>
            </Box>
          </Flex>
        </Box>
      </Box>
    </CirclesBackground>
  );
}
