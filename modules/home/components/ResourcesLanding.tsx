import { Box, Flex, Heading, Card, Text, Image } from 'theme-ui';
import { resources } from 'modules/home/helpers/resources';
import { ExternalLink } from 'modules/app/components/ExternalLink';

export const ResourcesLanding = (): JSX.Element => {
  return (
    <Flex sx={{ flexDirection: 'column' }}>
      <Flex sx={{ justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Heading>Resources</Heading>
        <Flex>Button thing here</Flex>
      </Flex>
      <Flex sx={{ justifyContent: 'center' }}>
        <Flex sx={{ flexWrap: 'wrap', justifyContent: ['center', 'space-evenly', 'space-between'] }}>
          {resources.map(resource => (
            <ExternalLink href={resource.url} title={resource.title} key={resource.title}>
              <Card key={resource.title} sx={{ width: '380px', height: '300px', mb: 4 }}>
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
                            <Text sx={{ color: resource.color, fontSize: '10px' }}>{resource.tag}</Text>
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
