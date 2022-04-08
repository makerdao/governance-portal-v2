import { Box, Flex, Heading, Text, ThemeUIStyleObject } from 'theme-ui';
import { Icon } from '@makerdao/dai-ui-icons';
import { useState } from 'react';
import { ExternalLink } from 'modules/app/components/ExternalLink';
import { InternalLink } from 'modules/app/components/InternalLink';
import CirclesBackground from './CirclesBackground';

type InfoPoint = {
  number: string;
  title: string;
  titleFirst: string;
  titleSecond: string;
  image: string;
  description: React.ReactNode;
  color: string;
  links: {
    linkHref: string;
    linkTitle: string;
  }[];
};

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
  const infoPoints: InfoPoint[] = [
    {
      number: '01',
      title: 'Understand off-chain governance',
      titleFirst: 'Understand',
      titleSecond: 'off-chain governance',
      links: [
        {
          linkHref: 'https://manual.makerdao.com/governance/voting-in-makerdao/off-chain-governance',
          linkTitle: 'Learn more about off-chain governance'
        }
      ],
      image: '/home/understand-governance/first.png',
      color: '#1AAB9B',
      description:
        "Off-chain governance refers to processes for making decisions that don't require on-chain voting and gathering feedback prior to on-chain voting. Off-chain governance happens on the Maker Governance Forum, where the community meets to propose and discuss new proposals. Anyone can participate in off-chain governance."
    },
    {
      number: '02',
      color: '#1ACCA7',
      title: 'Understand on-chain governance',
      titleFirst: 'Understand',
      titleSecond: 'on-chain governance',
      links: [
        {
          linkHref: 'https://manual.makerdao.com/governance/voting-in-makerdao/on-chain-governance',
          linkTitle: 'Learn more about on-chain governance'
        }
      ],
      image: '/home/understand-governance/second.png',

      description:
        'On-chain governance refers to Governance Polls and Executive Votes, which are formalized governance proposals that require on-chain voting. Anyone who owns MKR tokens can participate in these votes using their wallet.'
    },
    {
      number: '03',
      color: '#4B68FF',
      title: 'Set up your voting wallet',
      titleFirst: 'Set up your',
      titleSecond: 'voting wallet',
      links: [],
      image: '/home/understand-governance/third.png',

      description:
        'Connect a web3 wallet (eg. MetaMask, WalletConnect) that holds your MKR tokens and start participating! Users that hold many MKR tokens or use their wallet for other uses besides Maker governance might want to consider more secure methods of setting up a voting wallet, such as using a hardware wallet or setting up a vote proxy (available soon).'
    },
    {
      number: '04',
      color: '#9A4BFF',
      title: 'Delegate your voting power',
      titleFirst: 'Option 1:',
      titleSecond: 'Delegate your voting power',
      links: [
        {
          linkHref: 'https://manual.makerdao.com/governance/what-is-delegation',
          linkTitle: 'Learn more about delegation'
        },
        {
          linkHref: 'https://vote.makerdao.com/delegates',
          linkTitle: 'Choose a suitable delegate'
        }
      ],
      image: '/home/understand-governance/fourth.png',

      description:
        "Vote delegation is a mechanism through which MKR holders can entrust their voting power to one or more chosen delegates. These delegates can then vote using the MKR delegated to them. Delegating your voting power is a good option if you're not willing to invest much time and gas costs in active participation. Note that delegates can never directly access the MKR tokens delegated to them."
    },
    {
      number: '05',
      color: '#E64BFF',
      title: 'Vote manually',
      titleFirst: 'Option 2:',
      titleSecond: 'Vote manually',
      links: [
        {
          linkHref: 'https://vote.makerdao.com/polling',
          linkTitle: 'Start voting on active governance polls'
        }
      ],
      image: '/home/understand-governance/first.png',

      description: (
        <Text>
          If you prefer to participate in Maker governance manually instead of delegating, then you are able
          to start participating once your voting wallet is set up.{' '}
          <InternalLink href="/executive" title="Executives" styles={{ fontWeight: 'semiBold' }}>
            <Text>Find the latest Executive Proposal</Text>
          </InternalLink>{' '}
          and vote on it by depositing your MKR tokens to the voting contract. By doing so you contribute to
          protecting the protocol against governance attacks. You are able to withdraw your MKR tokens
          anytime. Next,{' '}
          <InternalLink href="/polling" title="Polls" styles={{ fontWeight: 'semiBold' }}>
            <Text>start voting on the active governance polls</Text>
          </InternalLink>{' '}
          and don&apos;t forget to add comments to your votes.
        </Text>
      )
    }
  ];

  const [active, setActive] = useState(infoPoints[0]);

  const indexCard = infoPoints.findIndex(i => i.number === active.number);
  return (
    <CirclesBackground activeColor={active.color}>
      <Box>
        <Box sx={{ p: 3, height: '100%' }}>
          <Flex sx={{ justifyContent: 'space-between', mb: 3, height: '100%' }}>
            <Box>
              <Heading as="h2">How to participate in Maker Governance</Heading>
            </Box>
            <ExternalLink
              href="https://manual.makerdao.com/"
              title="Learn more"
              styles={{ color: 'inherit' }}
            >
              <Flex sx={{ alignItems: 'center' }}>
                <Text>Learn more</Text>
                <Icon name="chevron_right" color="primary" size="3" ml="1" />
              </Flex>
            </ExternalLink>
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
                    mb: 3,
                    background: 'rgba(255, 255, 255, 0.5)',
                    p: 3,
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
                        color: active.number === infoPoint.number ? infoPoint.color : 'text'
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
