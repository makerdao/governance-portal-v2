import { ExternalLink } from './ExternalLink';
import { Box, Text, Flex } from 'theme-ui';
import Icon from 'modules/app/components/Icon';

export const MkrUpgradeToastContent = (): JSX.Element => {
  return (
    <Box
      sx={{
        p: 2
      }}
    >
      <Flex sx={{ alignItems: 'center', mb: 2 }}>
        <Icon name="info" size={24} sx={{ mr: 2, mt: '2px', flexShrink: 0, color: 'primary' }} />
        <Text as="h3" sx={{ fontSize: 2, fontWeight: 'bold', color: 'text' }}>
          Governance Migration Notice
        </Text>
      </Flex>

      <Flex sx={{ alignItems: 'flex-start' }}>
        <Text sx={{ fontSize: 2, color: 'text' }}>
          SKY is now the sole governance token of the Sky Protocol. MKR holders are encouraged to withdraw
          their MKR from the Chief contract, un-delegate voting power (if applicable), and then{' '}
          <ExternalLink
            href="https://app.sky.money/?network=ethereum&widget=upgrade&source_token=mkr"
            title="Upgrade to SKY"
            styles={{ textDecoration: 'underline', margin: '0 3px', color: '#504DFF' }}
          >
            <>upgrade to SKY</>
          </ExternalLink>{' '}
          promptly to maintain the ability to participate in governance and avoid the Delayed Upgrade Penalty.{' '}
          <br />
          <br />
          Only withdrawal actions are supported here. You can vote with SKY at the new{' '}
          <ExternalLink
            href="https://vote.sky.money"
            title="Sky Governance Voting Portal"
            styles={{ textDecoration: 'underline', margin: '0 3px', color: '#504DFF' }}
          >
            <>vote.sky.money</>
          </ExternalLink>
          . For more information, please visit the{' '}
          <ExternalLink
            href="https://upgrademkrtosky.sky.money"
            title="MKR to SKY Upgrade Hub"
            styles={{ textDecoration: 'underline', margin: '0 3px', color: '#504DFF' }}
          >
            <>MKR to SKY Upgrade Hub</>
          </ExternalLink>
          .
        </Text>
      </Flex>
    </Box>
  );
};
