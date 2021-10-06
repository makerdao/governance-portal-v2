/** @jsx jsx */
import { Box, Heading, Card, Link as ExternalLink, Flex, Text, jsx } from 'theme-ui';
import { Icon } from '@makerdao/dai-ui-icons';

export default function ResourceBox({ className }: { className?: string }): JSX.Element {
  return (
    <Box className={className}>
      <Heading mt={3} mb={2} as="h3" variant="microHeading">
        Resources
      </Heading>
      <Card variant="compact">
        <Flex sx={{ alignItems: 'center' }}>
          <ExternalLink href="https://forum.makerdao.com" target="_blank">
            <Text sx={{ color: 'accentBlue', fontSize: [2, 3], ':hover': { color: 'blueLinkHover' } }}>
              Maker Forum
              <Icon ml={2} name="arrowTopRight" size={2} />
            </Text>
          </ExternalLink>
        </Flex>
        <Flex sx={{ alignItems: 'center', pt: 3 }}>
          <ExternalLink href="https://makerdao.world/learn/governance/governance-faq" target="_blank">
            <Text sx={{ color: 'accentBlue', fontSize: [2, 3], ':hover': { color: 'blueLinkHover' } }}>
              Governance FAQs
              <Icon ml={2} name="arrowTopRight" size={2} />
            </Text>
          </ExternalLink>
        </Flex>
        <Flex sx={{ alignItems: 'center', pt: 3 }}>
          <ExternalLink href="https://blog.makerdao.com/makerdao-governance-risk-framework/" target="_blank">
            <Text sx={{ color: 'accentBlue', fontSize: [2, 3], ':hover': { color: 'blueLinkHover' } }}>
              Governance Risk Framework
              <Icon ml={2} name="arrowTopRight" size={2} />
            </Text>
          </ExternalLink>
        </Flex>
        <Flex sx={{ alignItems: 'center', pt: 3 }}>
          <ExternalLink href="https://github.com/makerdao/awesome-makerdao" target="_blank">
            <Text sx={{ color: 'accentBlue', fontSize: [2, 3], ':hover': { color: 'blueLinkHover' } }}>
              Awesome MakerDAO
              <Icon ml={2} name="arrowTopRight" size={2} />
            </Text>
          </ExternalLink>
        </Flex>

        <Flex sx={{ alignItems: 'center', pt: 3 }}>
          <ExternalLink href="https://makerdao.world/resources/governance_and_risk_meetings" target="_blank">
            <Text sx={{ color: 'accentBlue', fontSize: [2, 3], ':hover': { color: 'blueLinkHover' } }}>
              Governance Call Schedule
              <Icon ml={2} name="arrowTopRight" size={2} />
            </Text>
          </ExternalLink>
        </Flex>

        <Flex sx={{ alignItems: 'center', pt: 3 }}>
          <ExternalLink
            href="https://calendar.google.com/calendar/embed?src=makerdao.com_3efhm2ghipksegl009ktniomdk%40group.calendar.google.com&ctz=America%2FLos_Angeles"
            target="_blank"
          >
            <Text sx={{ color: 'accentBlue', fontSize: [2, 3], ':hover': { color: 'blueLinkHover' } }}>
              MakerDAO Events Calendar
              <Icon ml={2} name="arrowTopRight" size={2} />
            </Text>
          </ExternalLink>
        </Flex>
      </Card>
    </Box>
  );
}
