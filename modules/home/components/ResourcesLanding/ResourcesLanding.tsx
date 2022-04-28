import { useState } from 'react';
import { Button, Box, Flex, Heading, Card, Text, Image } from 'theme-ui';
import { resources, ResourceColor, ResourceCategory } from './resources';
import { ExternalLink } from 'modules/app/components/ExternalLink';
import { fadeIn } from 'lib/keyframes';
import { alpha } from '@theme-ui/color';

const CategoryButton = ({ label, color, active, onClick }) => {
  return (
    <Button
      variant="outline"
      onClick={onClick}
      title={label}
      sx={{
        background: theme =>
          active
            ? `${alpha(theme?.rawColors?.badgeSelector, 0.4)(theme)}`
            : `${alpha(theme?.rawColors?.badgeSelector, 0)(theme)}`,
        '&:hover': {
          background: theme =>
            active
              ? `${alpha(theme?.rawColors?.badgeSelector, 0.4)(theme)}`
              : `${alpha(theme?.rawColors?.badgeSelector, 0.2)(theme)}`
        },
        px: [2, 2, 3],
        border: 'none'
      }}
    >
      <Text sx={{ color, fontSize: [1, 1, 2], fontWeight: 'semiBold' }}>{label}</Text>
    </Button>
  );
};

export const ResourcesLanding = (): JSX.Element => {
  const [category, setCategory] = useState(ResourceCategory.ALL_RESOURCES);

  function handleSetCategory(category) {
    setCategory(category);
  }

  return (
    <Flex sx={{ flexDirection: 'column', mt: 4 }}>
      <Flex sx={{ justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Heading>Resources</Heading>
        <Flex
          sx={{
            display: ['none', 'flex', 'flex'],
            background: 'rgba(255, 255, 255, 0.1)',
            backgroundBlendMode: 'multiply',
            border: '1.35px solid rgba(255, 255, 255, 0.1)',
            boxShadow: theme =>
              `inset 0px -3px 10px ${alpha(
                theme.rawColors?.shadowFloater,
                0.15
              )(theme)},inset 0px 2px 10px ${alpha(theme.rawColors?.shadowFloater, 0.15)(theme)}`,
            borderRadius: 'round'
          }}
        >
          <CategoryButton
            label={ResourceCategory.ALL_RESOURCES}
            color={'primary'}
            active={category === ResourceCategory.ALL_RESOURCES}
            onClick={() => handleSetCategory(ResourceCategory.ALL_RESOURCES)}
          />
          <CategoryButton
            label={ResourceCategory.GOVERNANCE}
            color={ResourceColor.GOVERNANCE}
            active={category === ResourceCategory.GOVERNANCE}
            onClick={() => handleSetCategory(ResourceCategory.GOVERNANCE)}
          />
          <CategoryButton
            label={ResourceCategory.PRODUCTS_AND_TOOLS}
            color={ResourceColor.PRODUCTS_AND_TOOLS}
            active={category === ResourceCategory.PRODUCTS_AND_TOOLS}
            onClick={() => handleSetCategory(ResourceCategory.PRODUCTS_AND_TOOLS)}
          />
          <CategoryButton
            label={ResourceCategory.DEVELOPERS}
            color={ResourceColor.DEVELOPERS}
            active={category === ResourceCategory.DEVELOPERS}
            onClick={() => handleSetCategory(ResourceCategory.DEVELOPERS)}
          />
        </Flex>
      </Flex>
      <Flex sx={{ justifyContent: 'center' }}>
        <Flex
          sx={{
            flexWrap: 'wrap',
            justifyContent: ['center', 'space-evenly', 'space-between'],
            width: '100%'
          }}
        >
          {resources
            .filter(resource => category === ResourceCategory.ALL_RESOURCES || category === resource.category)
            .map(resource => (
              <ExternalLink href={resource.url} title={resource.title} key={resource.title}>
                <Card
                  key={resource.title}
                  sx={{
                    width: '380px',
                    maxWidth: '100%',
                    height: '290px',
                    mb: 4,
                    animation: `${fadeIn} 750ms ease`
                  }}
                >
                  <Box
                    sx={{
                      width: '100%',
                      height: '185px',
                      background: resource.bg,
                      borderRadius: 'roundish'
                    }}
                  >
                    <Flex sx={{ width: '100%', justifyContent: 'space-between', p: 3 }}>
                      <Flex sx={{ flexDirection: 'column', width: '60%' }}>
                        <Flex>
                          <Box
                            sx={{
                              backgroundColor: 'background',
                              borderRadius: '12px',
                              padding: '4px 8px',
                              display: 'flex',
                              alignItems: 'center'
                            }}
                          >
                            <Text sx={{ color: resource.color, fontSize: '10px' }}>{resource.category}</Text>
                          </Box>
                        </Flex>
                        <Text
                          sx={{
                            mt: 2,
                            fontSize: '28px',
                            color: 'background',
                            fontWeight: 'semiBold',
                            lineHeight: '32px'
                          }}
                        >
                          {resource.title}
                        </Text>
                      </Flex>
                      <Flex
                        sx={{
                          width: '40%',
                          justifyContent: 'flex-end',
                          alignItems: 'flex-start',
                          mr: 3,
                          mt: 3
                        }}
                      >
                        <Image src={resource.logo} sx={{ width: '64px' }} />
                      </Flex>
                    </Flex>
                  </Box>
                  <Text as="p" sx={{ fontSize: 2, color: 'secondaryEmphasis', mt: 2 }}>
                    {resource.summary}
                  </Text>
                </Card>
              </ExternalLink>
            ))}
        </Flex>
      </Flex>
    </Flex>
  );
};
