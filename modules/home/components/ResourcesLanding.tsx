import { Flex, Heading, Card, Grid, Text, Image } from 'theme-ui';

const resourceList = [
  {
    title: 'Monthly Governance Cycle',
    tag: 'Governance Cycle',
    bg: '/assets/gov-cycle-bg.png',
    logo: 'resourcesGovCycle',
    summary:
      'The Monthly Governance Cycle is defined in MIP51 and provides a predictable monthly cadence by which governance decisions are made.'
  },
  {
    title: 'Monthly Governance Cycle',
    tag: 'Governance Cycle',
    bg: '/assets/gov-cycle-bg.png',
    logo: 'resourcesGovCycle',
    summary:
      'The Monthly Governance Cycle is defined in MIP51 and provides a predictable monthly cadence by which governance decisions are made.'
  },
  {
    title: 'Monthly Governance Cycle',
    tag: 'Governance Cycle',
    bg: '/assets/gov-cycle-bg.png',
    logo: 'resourcesGovCycle',
    summary:
      'The Monthly Governance Cycle is defined in MIP51 and provides a predictable monthly cadence by which governance decisions are made.'
  },
  {
    title: 'Monthly Governance Cycle',
    tag: 'Governance Cycle',
    bg: '/assets/gov-cycle-bg.png',
    logo: 'resourcesGovCycle',
    summary:
      'The Monthly Governance Cycle is defined in MIP51 and provides a predictable monthly cadence by which governance decisions are made.'
  },
  {
    title: 'Monthly Governance Cycle',
    tag: 'Governance Cycle',
    bg: '/assets/gov-cycle-bg.png',
    logo: 'resourcesGovCycle',
    summary:
      'The Monthly Governance Cycle is defined in MIP51 and provides a predictable monthly cadence by which governance decisions are made.'
  },
  {
    title: 'Monthly Governance Cycle',
    tag: 'Governance Cycle',
    bg: '/assets/gov-cycle-bg.png',
    logo: 'resourcesGovCycle',
    summary:
      'The Monthly Governance Cycle is defined in MIP51 and provides a predictable monthly cadence by which governance decisions are made.'
  },
  {
    title: 'Monthly Governance Cycle',
    tag: 'Governance Cycle',
    bg: '/assets/gov-cycle-bg.png',
    logo: 'resourcesGovCycle',
    summary:
      'The Monthly Governance Cycle is defined in MIP51 and provides a predictable monthly cadence by which governance decisions are made.'
  },
  {
    title: 'Monthly Governance Cycle',
    tag: 'Governance Cycle',
    bg: '/assets/gov-cycle-bg.png',
    logo: 'resourcesGovCycle',
    summary:
      'The Monthly Governance Cycle is defined in MIP51 and provides a predictable monthly cadence by which governance decisions are made.'
  },
  {
    title: 'Monthly Governance Cycle',
    tag: 'Governance Cycle',
    bg: '/assets/gov-cycle-bg.png',
    logo: 'resourcesGovCycle',
    summary:
      'The Monthly Governance Cycle is defined in MIP51 and provides a predictable monthly cadence by which governance decisions are made.'
  }
];

export const ResourcesLanding = (): JSX.Element => {
  return (
    <Flex sx={{ flexDirection: 'column' }}>
      <Flex sx={{ justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Heading>Resources</Heading>
        <Flex>Button thing here</Flex>
      </Flex>
      <Flex sx={{ justifyContent: 'center' }}>
        <Grid gap={4} columns={[1, 1, 2, 3]}>
          {resourceList.map(resource => (
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
