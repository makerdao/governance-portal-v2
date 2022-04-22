import { Flex, Grid, Box, Text, Link as ExternalLink, Heading } from 'theme-ui';
import { ViewMore } from 'modules/home/components/ViewMore';

type Props = {
  title: string;
  infoUnits: {
    title: string;
    value: string | JSX.Element;
  }[];
};

export const Stats = ({ title, infoUnits }: Props): JSX.Element => {
  return (
    <>
      {/* Desktop */}
      <Box sx={{ display: ['none', 'block'] }}>
        <Flex sx={{ justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Heading>{title}</Heading>
          <ExternalLink href="https://daistats.com/" target="_blank">
            <ViewMore />
          </ExternalLink>
        </Flex>

        <Flex sx={{ mx: 0, px: 5, pb: 3, backgroundColor: 'background', borderRadius: 'small' }}>
          <Flex m={3} sx={{ width: '100%', justifyContent: 'space-between' }}>
            {infoUnits.map(unit => (
              <Box key={unit.title} data-testid={unit.title}>
                <Box>
                  <Text sx={{ fontSize: 2, color: 'textSecondary' }}>{unit.title}</Text>
                </Box>
                <Box mt={2} data-testid={`${unit.title}-value`}>
                  <Text sx={{ fontSize: 5 }}>{unit.value}</Text>
                </Box>
              </Box>
            ))}
          </Flex>
        </Flex>
      </Box>

      {/* Mobile */}
      <Box sx={{ display: ['block', 'none'], backgroundColor: 'background' }}>
        <Grid sx={{ p: 0 }}>
          <Flex sx={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <Heading>System Stats</Heading>
            <ExternalLink href="https://daistats.com/" target="_blank">
              <ViewMore />
            </ExternalLink>
          </Flex>

          {infoUnits.map(unit => (
            <Flex key={`${unit.title}-mobile`} sx={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text sx={{ fontSize: 2, color: 'textSecondary' }}>{unit.title}</Text>
              <Text sx={{ fontSize: 2 }}>{unit.value}</Text>
            </Flex>
          ))}
        </Grid>
      </Box>
    </>
  );
};
