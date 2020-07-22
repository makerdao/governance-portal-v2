import { Flex, Card, Link as ExternalLink, Text } from 'theme-ui';
import { Icon } from '@makerdao/dai-ui-icons';

export default function(props) {
  return (
    <Card variant="compact" {...props}>
      <ExternalLink href="https://https://forum.makerdao.com/c/governance/" target="_blank">
        <Flex sx={{ alignItems: 'center' }}>
          <Text sx={{ color: 'accentBlue', fontSize: 3 }}>
            Governance Forum
            <Icon ml={2} name="chevron_right" size={2} sx={{ color: 'mutedAlt' }} />
          </Text>
        </Flex>
      </ExternalLink>
      <ExternalLink href="https://community-development.makerdao.com/governance/governance" target="_blank">
        <Flex sx={{ alignItems: 'center', pt: 3 }}>
          <Text sx={{ color: 'accentBlue', fontSize: 3 }}>
            Governance FAQs
            <Icon ml={2} name="chevron_right" size={2} sx={{ color: 'mutedAlt' }} />
          </Text>
        </Flex>
      </ExternalLink>
      <ExternalLink href="https://blog.makerdao.com/makerdao-governance-risk-framework/" target="_blank">
        <Flex sx={{ alignItems: 'center', pt: 3 }}>
          <Text sx={{ color: 'accentBlue', fontSize: 3 }}>
            Governance Risk Framework
            <Icon ml={2} name="chevron_right" size={2} sx={{ color: 'mutedAlt' }} />
          </Text>
        </Flex>
      </ExternalLink>
      <ExternalLink href="https://github.com/makerdao/awesome-makerdao#governance" target="_blank">
        <Flex sx={{ alignItems: 'center', pt: 3 }}>
          <Text sx={{ color: 'accentBlue', fontSize: 3 }}>
            Awesome MakerDAO
            <Icon ml={2} name="chevron_right" size={2} sx={{ color: 'mutedAlt' }} />
          </Text>
        </Flex>
      </ExternalLink>
      <ExternalLink href="https://daistats.com/" target="_blank">
        <Flex sx={{ alignItems: 'center', pt: 3 }}>
          <Text sx={{ color: 'accentBlue', fontSize: 3 }}>
            Governance call schedule
            <Icon ml={2} name="chevron_right" size={2} sx={{ color: 'mutedAlt' }} />
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
            <Icon ml={2} name="chevron_right" size={2} sx={{ color: 'mutedAlt' }} />
          </Text>
        </Flex>
      </ExternalLink>
    </Card>
  );
}
