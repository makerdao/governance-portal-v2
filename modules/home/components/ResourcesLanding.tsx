import { useState } from 'react';
import { Button, Box, Flex, Heading, Card, Text, Image } from 'theme-ui';
import { resources, ResourceColor, ResourceCategory } from 'modules/home/helpers/resources';
import { ExternalLink } from 'modules/app/components/ExternalLink';
import { fadeIn } from 'lib/keyframes';

const CategoryButton = ({ label, color, active, onClick }) => {
  return (
    <Button
      variant="outline"
      onClick={onClick}
      sx={{
        background: active ? 'onPrimary' : 'rgba(255, 255, 255, 0.1)',
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
            border: '1.35px solid rgba(255, 255, 255, 0.2)',
            boxShadow: 'inset 0px -3px 22px #FFFFFF',
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
                  sx={{ width: '380px', height: '300px', mb: 4, animation: `${fadeIn} 750ms ease` }}
                >
                  <Box sx={{ position: 'relative' }}>
                    <Box sx={{ position: 'absolute', width: '100%' }}>
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
                              <Text sx={{ color: resource.color, fontSize: '10px' }}>
                                {resource.category}
                              </Text>
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
                    <Image
                      src={resource.bg}
                      sx={{
                        objectFit: 'cover',
                        width: '100%'
                      }}
                    />
                  </Box>
                  <Text sx={{ fontSize: 2, color: 'secondaryEmphasis' }}>{resource.summary}</Text>
                </Card>
              </ExternalLink>
            ))}
        </Flex>
      </Flex>
    </Flex>
  );
};
