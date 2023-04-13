/*

SPDX-FileCopyrightText: © 2023 Dai Foundation <www.daifoundation.org>

SPDX-License-Identifier: AGPL-3.0-or-later

*/

import { Box, Heading, Card, Link as ExternalLink, Flex, Text } from 'theme-ui';
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
        url: 'https://makerdao.world/en/learn/governance/how-voting-works#governance-polls-and-executive-votes'
      },
      {
        linkTitle: 'How to manually vote in a poll with Etherscan?',
        url: 'https://makerdux.notion.site/How-to-manually-vote-in-a-Maker-poll-with-Etherscan-d61a8fbac15a4bfc840ecb2d5c19cd80'
      },
      {
        linkTitle: 'How to set up your wallet for voting?',
        url: 'https://makerdao.world/en/learn/governance/voting-setup/'
      },
      {
        linkTitle: 'How does gasless poll voting work?',
        url: 'https://manual.makerdao.com/governance/voting-in-makerdao/gasless-poll-voting/'
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
        linkTitle: 'How to manually verify Executive Spells?',
        url: 'https://makerdao.world/en/learn/governance/audit-exec-spells'
      },
      {
        linkTitle: 'How is voting weight calculated?',
        url: 'https://makerdao.world/en/learn/governance/how-voting-works#governance-polls-and-executive-votes'
      },
      {
        linkTitle: 'How to set up your wallet for voting?',
        url: 'https://makerdao.world/en/learn/governance/voting-setup/'
      }
    ]
  },
  delegates: {
    boxTitle: 'Delegation FAQs',
    links: [
      {
        linkTitle: 'What is MKR vote delegation?',
        url: 'https://manual.makerdao.com/delegation/overview/what-is-delegation'
      },
      {
        linkTitle: "What's a Constitutional Voter Committee(CVC)?",
        url: 'https://mips.makerdao.com/mips/details/MIP101#5-constitutional-voter-committees-cvcs-'
      },
      {
        linkTitle: 'What is the Maker Constitution?',
        url: 'https://mips.makerdao.com/mips/details/MIP101'
      },
      {
        linkTitle: 'What is a Constitutional Delegate?',
        url: 'https://mips.makerdao.com/mips/details/MIP113#5-constitutional-delegates'
      },
      {
        linkTitle: 'What is Maker Endgame?',
        url: 'https://endgame.makerdao.com/endgame/overview'
      },
      {
        linkTitle: "The MKR holder's guide to delegation",
        url: 'https://manual.makerdao.com/delegation/for-mkr-holders/mkr-holder-guide'
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
              <Text sx={{ color: 'accentBlue', ':hover': { color: 'accentBlueEmphasis' } }}>
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
