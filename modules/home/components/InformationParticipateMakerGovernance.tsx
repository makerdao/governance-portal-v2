import { Box, Flex, Heading, Text, ThemeUIStyleObject } from 'theme-ui';
import { Icon } from '@makerdao/dai-ui-icons';
import { useState } from 'react';

export default function InformationParticipateMakerGovernance(): React.ReactElement {
  const infoPoints = [
    {
      number: '01',
      title: 'Understand off-chain governance',
      color: '#1AAB9B',
      description:
        'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum'
    },
    {
      number: '02',
      color: '#1ACCA7',
      title: 'Understand on-chain governance',
      description:
        'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum'
    },
    {
      number: '03',
      color: '#4B68FF',
      title: 'Set up your voting wallet',
      description:
        'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum'
    },
    {
      number: '04',
      color: '#9A4BFF',
      title: 'Vote manually',
      description:
        'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum'
    },
    {
      number: '05',
      color: '#E64BFF',
      title: 'Delegate your voting power',
      description:
        'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum'
    }
  ];

  const [active, setActive] = useState(infoPoints[0]);

  return (
    <Box>
      <Box sx={{ p: 3 }}>
        <Flex sx={{ justifyContent: 'space-between', mb: 3 }}>
          <Box>
            <Heading as="h2">How to participate in Maker Governance</Heading>
          </Box>

          <Flex sx={{ alignItems: 'center' }}>
            <Text>Learn more</Text>
            <Icon name="chevron_right" color="primary" size="3" ml="1" />
          </Flex>
        </Flex>

        <Flex>
          <Box sx={{ mr: 3, width: '30%' }}>
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
                <Flex>
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
                </Flex>
              </Box>
            ))}
          </Box>
          <Box sx={{ p: 3, borderRadius: 'medium', background: ' rgba(255, 255, 255, 0.5)', width: '70%' }}>
            <Text>{active.description}</Text>
          </Box>
        </Flex>
      </Box>
    </Box>
  );
}
