import { getMigrationBannerContent } from '../helpers/getMigrationBannerContent';

describe('getMigrationBannerContent', () => {
  const defaultProps = {
    isDelegateContractExpired: true,
    isDelegateContractExpiring: true,
    isDelegatedToExpiredContract: true,
    isDelegatedToExpiringContract: true
  };
  it('should return delegate contract is expired if all inputs are true', () => {
    const { href, variant } = getMigrationBannerContent(defaultProps);

    expect(href).toEqual('/migration/delegate');
    expect(variant).toEqual('bannerWarning');
  });

  it('should return delegate contract is expiring if isDelegateContractExpired is false and isDelegateContractExpiring is true', () => {
    const props = {
      ...defaultProps,
      isDelegateContractExpired: false
    };
    const { href, variant } = getMigrationBannerContent(props);

    expect(href).toEqual('/migration/delegate');
    expect(variant).toEqual('bannerNotice');
  });

  it('should return delegator has delegated to expired if both isDelegatedToExpiredContract and isDelegatedToExpiringContract are true', () => {
    const props = {
      ...defaultProps,
      isDelegateContractExpired: false,
      isDelegateContractExpiring: false
    };
    const { href, variant } = getMigrationBannerContent(props);

    expect(href).toEqual('/migration/delegator');
    expect(variant).toEqual('bannerWarning');
  });
});
