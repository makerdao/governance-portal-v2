import { Flex, Heading, Card, Grid, Text, Image } from 'theme-ui';
import { resources } from 'modules/home/helpers/resources';

export const ResourcesLanding = (): JSX.Element => {
  return (
    <Flex sx={{ flexDirection: 'column' }}>
      <Flex sx={{ justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Heading>Resources</Heading>
        <Flex>Button thing here</Flex>
      </Flex>
      <Flex sx={{ justifyContent: 'center' }}>
        <Grid gap={4} columns={[1, 1, 2, 3]}>
          {resources.map(resource => (
            <Card key={resource.title} sx={{ width: '405px', height: '300px' }}>
              <Text>{resource.title}</Text>
              <Image
                src={resource.bg}
                sx={{
                  objectFit: 'cover',
                  width: '100%'
                }}
              />
            </Card>
          ))}
        </Grid>
      </Flex>
    </Flex>
  );
};
