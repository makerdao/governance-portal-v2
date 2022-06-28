import Banner from 'modules/app/components/layout/header/Banner';
import { Text } from 'theme-ui';

export default function DelegatingExpiryWarningBanner(): React.ReactElement {
  return (
    <Banner
      variant="warning"
      content={
        <Text sx={{ fontWeight: '400' }}>
          You delegated MKR to a contract that is going to expire or has expired. Please migrate your MKR to a
          renewed Delegate Contract
        </Text>
      }
    />
  );
}
