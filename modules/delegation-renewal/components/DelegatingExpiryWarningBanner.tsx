import { Text, Flex } from 'theme-ui';
import Banner from 'modules/app/components/layout/header/Banner';
import { Icon } from '@makerdao/dai-ui-icons';
import { InternalLink } from 'modules/app/components/InternalLink';

export default function DelegatingExpiryWarningBanner({
  isExpired
}: {
  isExpired: boolean;
}): React.ReactElement {
  const link = <Icon name="chevron_right" size={2} ml={2} />;
  return (
    <Banner
      variant="warning"
      content={
        <InternalLink href={'/migration/delegator'} title="View delegator migration page">
          <Flex>
            {isExpired ? (
              <Text>
                You have MKR delegated to a contract that has expired. Please migrate your MKR to a new
                delegate contract. {link}
              </Text>
            ) : (
              <Text>
                You have MKR delegated to a contract that will expire soon. Please migrate your MKR to a new
                delegate contract. {link}
              </Text>
            )}
          </Flex>
        </InternalLink>
      }
    />
  );
}
