import { Text, Flex } from 'theme-ui';
import Banner from 'modules/app/components/layout/header/Banner';
import { Icon } from '@makerdao/dai-ui-icons';
import { InternalLink } from 'modules/app/components/InternalLink';
import { getMigrationBannerContent } from 'modules/migration/helpers/getMigrationBannerContent';

export function DelegatationMigrationStatusBanner({
  isDelegatedToExpiredContract,
  isDelegateContractExpired,
  isDelegatedToExpiringContract,
  isDelegateContractExpiring
}: {
  isDelegatedToExpiredContract: boolean;
  isDelegatedToExpiringContract: boolean;
  isDelegateContractExpired: boolean;
  isDelegateContractExpiring: boolean;
}): React.ReactElement {
  const link = <Icon name="chevron_right" size={2} ml={2} />;

  const { variant, href, copy } = getMigrationBannerContent({
    isDelegatedToExpiredContract,
    isDelegateContractExpired,
    isDelegatedToExpiringContract,
    isDelegateContractExpiring
  });

  return (
    <Banner
      variant={variant}
      content={
        <InternalLink href={href} title="View migration page">
          <Flex>
            <Text>
              {copy} {link}
            </Text>
            )
          </Flex>
        </InternalLink>
      }
    />
  );
}
