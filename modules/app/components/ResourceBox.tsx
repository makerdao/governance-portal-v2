/** @jsx jsx */
import { Box, Heading, Card, Link as ExternalLink, Flex, Text, jsx } from 'theme-ui';
import { Icon } from '@makerdao/dai-ui-icons';

type ResourceType = 'general' | 'polling' | 'executive' | 'delegates';

type ResourceLink = {
  linkTitle: string;
  url: string;
};

type Resource = {
  boxTitle: string;
  links: ResourceLink[];
};

const resources: Record<ResourceType, Resource> = {
  general: {
    boxTitle: 'General Governance Resources',
    links: [
      { linkTitle: 'Maker Forum', url: 'https://forum.makerdao.com/' },
      { linkTitle: 'Governance FAQs', url: 'https://makerdao.world/learn/governance/governance-faq/' },
      {
        linkTitle: 'Governance Risk Framework',
        url: 'https://blog.makerdao.com/makerdao-governance-risk-framework/'
      },
      { linkTitle: 'Awesome MakerDAO', url: 'https://github.com/makerdao/awesome-makerdao/' },
      {
        linkTitle: 'Governance Call Schedule',
        url: 'https://makerdao.world/resources/governance_and_risk_meetings/'
      }
    ]
  },
  polling: {
    boxTitle: 'Polling FAQs',
    links: [
      {
        linkTitle: 'How to participate in MakerDAO governance?',
        url: 'https://makerdao.world/en/learn/governance/how-voting-works/'
      },
      {
        linkTitle: 'What are Governance Polls?',
        url: 'https://makerdao.world/en/learn/governance/how-voting-works#governance-polls'
      },
      {
        linkTitle: 'How is voting weight calculated?',
        url:
          'https://makerdao.world/en/learn/governance/how-voting-works#governance-polls-and-executive-votes'
      },
      {
        linkTitle: 'How to set up your wallet for voting?',
        url: 'https://makerdao.world/en/learn/governance/voting-setup/'
      },
      {
        linkTitle: 'Find historical polls',
        url: 'https://mkrgov.science/polls/'
      }
    ]
  },
  executive: {
    boxTitle: 'Executive Proposal FAQs',
    links: [
      {
        linkTitle: 'How to participate in MakerDAO governance?',
        url: 'https://makerdao.world/en/learn/governance/how-voting-works/'
      },
      {
        linkTitle: 'What are Executive Votes?',
        url: 'https://makerdao.world/en/learn/governance/how-voting-works#executive-votes'
      },
      {
        linkTitle: 'How to manually verify Executive Spells',
        url: 'https://makerdao.world/en/learn/governance/audit-exec-spells'
      },
      {
        linkTitle: 'How is voting weight calculated?',
        url:
          'https://makerdao.world/en/learn/governance/how-voting-works#governance-polls-and-executive-votes'
      },
      {
        linkTitle: 'How to set up your wallet for voting?',
        url: 'https://makerdao.world/en/learn/governance/voting-setup/'
      },
      {
        linkTitle: 'Find historical Executive Proposals',
        url: 'https://mkrgov.science/executive/'
      }
    ]
  },
  delegates: {
    boxTitle: 'Delegation FAQs',
    links: [
      {
        linkTitle: 'What is vote delegation and how does it work in MakerDAO?',
        url: 'https://forum.makerdao.com/t/delegation-and-makerdao/9429'
      },
      {
        linkTitle: 'What are the requirements for becoming a recognized delegate?',
        url: 'https://forum.makerdao.com/t/recognised-delegate-requirements/9421'
      },
      {
        linkTitle: "The MKR holder's guide to delegation",
        url: 'https://forum.makerdao.com/t/mkr-holder-s-guide-to-delegation/9602'
      },
      {
        linkTitle: "MKR token holder's delegation agreement",
        url: 'https://forum.makerdao.com/t/token-holders-delegation-agreement/9385'
      },
      {
        linkTitle: 'Recognized delegate code of conduct',
        url: 'https://forum.makerdao.com/t/recognised-delegate-code-of-conduct/9384'
      }
    ]
  }
};

export default function ResourceBox({
  type,
  className
}: {
  type: ResourceType;
  className?: string;
}): JSX.Element {
  return (
    <Box className={className}>
      <Heading mt={3} mb={2} as="h3" variant="microHeading">
        {resources[type].boxTitle}
      </Heading>
      <Card variant="compact">
        {resources[type].links.map(resource => (
          <Flex key={resource.linkTitle} sx={{ alignItems: 'center', ':not(:last-of-type)': { mb: 3 } }}>
            <ExternalLink href={resource.url} target="_blank">
              <Text sx={{ color: 'accentBlue', fontSize: [2, 3], ':hover': { color: 'blueLinkHover' } }}>
                {resource.linkTitle}
                <Icon ml={2} name="arrowTopRight" size={2} />
              </Text>
            </ExternalLink>
          </Flex>
        ))}
      </Card>
    </Box>
  );
}
