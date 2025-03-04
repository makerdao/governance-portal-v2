/*

SPDX-FileCopyrightText: © 2023 Dai Foundation <www.daifoundation.org>

SPDX-License-Identifier: AGPL-3.0-or-later

*/

export const getMigrationBannerContent = ({
  isDelegateV1Contract,
  isDelegatedToV1Contract
}: {
  isDelegateV1Contract: boolean;
  isDelegatedToV1Contract: boolean;
}): { variant: string; href: string; copy: string } => {
  if (isDelegateV1Contract) {
    return {
      variant: 'bannerNotice',
      href: '/migration/delegate',
      copy: 'Your delegate contract needs to be migrated to v2. Please visit the migration page to migrate it.'
    };
  }

  // next check if user has delegated to a v1 contract
  if (isDelegatedToV1Contract) {
    return {
      variant: 'bannerNotice',
      href: '/migration/delegator',
      copy: 'You have MKR delegated to a v1 delegate contract. Please visit the migration page to migrate your MKR to its v2 delegate contract.'
    };
  }

  // if we're here, something went wrong
  return {
    variant: '',
    href: '',
    copy: ''
  };
};
