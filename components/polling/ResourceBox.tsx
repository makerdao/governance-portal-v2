import { Box, Heading, Card, Link as ExternalLink, Flex, Text } from 'theme-ui';
import { Icon } from '@makerdao/dai-ui-icons';

export default function (props): JSX.Element {
  return (
    <Box {...props}>
      <Heading mb={3} variant="microHeading">
        Resources
      </Heading>
      <Card variant="compact">
        <ExternalLink href="https://https://forum.makerdao.com/c/governance/" target="_blank">
          <Flex sx={{ alignItems: 'center' }}>
            <Text sx={{ color: 'accentBlue', fontSize: 3 }}>
              Governance Forum
              <Icon ml={2} name="arrowTopRight" size={2} />
            </Text>
          </Flex>
        </ExternalLink>
        <ExternalLink href="https://community-development.makerdao.com/governance/governance" target="_blank">
          <Flex sx={{ alignItems: 'center', pt: 3 }}>
            <Text sx={{ color: 'accentBlue', fontSize: 3 }}>
              Governance FAQs
              <Icon ml={2} name="arrowTopRight" size={2} />
            </Text>
          </Flex>
        </ExternalLink>
        <ExternalLink href="https://blog.makerdao.com/makerdao-governance-risk-framework/" target="_blank">
          <Flex sx={{ alignItems: 'center', pt: 3 }}>
            <Text sx={{ color: 'accentBlue', fontSize: 3 }}>
              Governance Risk Framework
              <Icon ml={2} name="arrowTopRight" size={2} />
            </Text>
          </Flex>
        </ExternalLink>
        <ExternalLink href="https://github.com/makerdao/awesome-makerdao" target="_blank">
          <Flex sx={{ alignItems: 'center', pt: 3 }}>
            <Text sx={{ color: 'accentBlue', fontSize: 3 }}>
              Awesome MakerDAO
              <Icon ml={2} name="arrowTopRight" size={2} />
            </Text>
          </Flex>
        </ExternalLink>
        <ExternalLink
          href="https://community-development.makerdao.com/governance/governance-and-risk-meetings"
          target="_blank"
        >
          <Flex sx={{ alignItems: 'center', pt: 3 }}>
            <Text sx={{ color: 'accentBlue', fontSize: 3 }}>
              Governance call schedule
              <Icon ml={2} name="arrowTopRight" size={2} />
            </Text>
          </Flex>
        </ExternalLink>
        <ExternalLink
          href="https://calendar.google.com/calendar/embed?src=makerdao.com_3efhm2ghipksegl009ktniomdk%40group.calendar.google.com&ctz=America%2FLos_Angeles"
          target="_blank"
        >
          <Flex sx={{ alignItems: 'center', pt: 3 }}>
            <Text sx={{ color: 'accentBlue', fontSize: 3 }}>
              MakerDAO events calendar
              <Icon ml={2} name="arrowTopRight" size={2} />
            </Text>
          </Flex>
        </ExternalLink>
      </Card>
    </Box>
  );
}
