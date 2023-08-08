/*

SPDX-FileCopyrightText: © 2023 Dai Foundation <www.daifoundation.org>

SPDX-License-Identifier: AGPL-3.0-or-later

*/

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
    isDelegateContractExpiring,
    isShadowDelegate
  } = useMigrationStatus();
  const showDelegationMigrationBanner =
    (isDelegateContractExpired && !isShadowDelegate) ||
    (isDelegateContractExpiring && !isShadowDelegate) ||
    isDelegatedToExpiringContract ||
    isDelegatedToExpiredContract;

  const { variant, href, copy } = getMigrationBannerContent({
    isDelegatedToExpiredContract,
    isDelegateContractExpired: isDelegateContractExpired && !isShadowDelegate,
    isDelegatedToExpiringContract,
    isDelegateContractExpiring: isDelegateContractExpiring && !isShadowDelegate
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
