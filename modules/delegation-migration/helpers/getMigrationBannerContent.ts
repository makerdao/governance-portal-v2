export const getMigrationBannerContent = ({
  isDelegateContractExpired,
  isDelegateContractExpiring,
  isDelegatedToExpiredContract,
  isDelegatedToExpiringContract
}: {
  isDelegateContractExpired: boolean;
  isDelegateContractExpiring: boolean;
  isDelegatedToExpiredContract: boolean;
  isDelegatedToExpiringContract: boolean;
}): { variant: string; href: string; copy: string } => {
  // a delegate having an expired contract is
  if (isDelegateContractExpired) {
    return {
      variant: 'bannerWarning',
      href: '/migration/delegate',
      copy: 'Your delegate contract has expired. Please visit the migration page and renew it in order to be able to vote as a delegate.'
    };
  }

  // next check if delegate contract is expiring
  if (isDelegateContractExpiring) {
    return {
      variant: 'bannerNotice',
      href: '/migration/delegate',
      copy: 'Your delegate contract is expiring soon. Please visit the migration page and renew it in order to be able to continue voting as a delegate.'
    };
  }

  // next check if user has delegated to an expired contract
  if (isDelegatedToExpiredContract) {
    return {
      variant: 'bannerWarning',
      href: '/migration/delegator',
      copy: 'You have MKR delegated to a contract that has expired. Please visit the migration page to delegate your MKR to a new delegate contract.'
    };
  }

  // next check if user has delegated to an expiring contract
  if (isDelegatedToExpiringContract) {
    return {
      variant: 'bannerNotice',
      href: '/migration/delegator',
      copy: 'You have MKR delegated to a contract that is expiring soon. Please visit the migration page to delegate your MKR to a new delegate contract.'
    };
  }

  // if we're here, something went wrong
  return {
    variant: '',
    href: '',
    copy: ''
  };
};
