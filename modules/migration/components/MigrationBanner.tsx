import { Text, Flex } from 'theme-ui';
import Banner from 'modules/app/components/layout/header/Banner';
import { Icon } from '@makerdao/dai-ui-icons';
import { InternalLink } from 'modules/app/components/InternalLink';
import { getMigrationBannerContent } from 'modules/migration/helpers/getMigrationBannerContent';
import { useMigrationStatus } from 'modules/migration/hooks/useMigrationStatus';

export function MigrationBanner(): React.ReactElement | null {
  const link = <Icon name="chevron_right" size={2} ml={2} />;

  const {
    isDelegatedToExpiringContract,
    isDelegatedToExpiredContract,
    isDelegateContractExpired,
    isDelegateContractExpiring
  } = useMigrationStatus();
  const showDelegationMigrationBanner =
    isDelegateContractExpired ||
    isDelegateContractExpiring ||
    isDelegatedToExpiringContract ||
    isDelegatedToExpiredContract;

  const { variant, href, copy } = getMigrationBannerContent({
    isDelegatedToExpiredContract,
    isDelegateContractExpired,
    isDelegatedToExpiringContract,
    isDelegateContractExpiring
  });

  return showDelegationMigrationBanner ? (
    <Banner
      variant={variant}
      content={
        <InternalLink href={href} title="View migration page">
          <Flex>
            <Text>
              {copy} {link}
            </Text>
          </Flex>
        </InternalLink>
      }
    />
  ) : null;
}
