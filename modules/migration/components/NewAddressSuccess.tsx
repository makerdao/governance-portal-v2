import { Flex, Text, Button } from 'theme-ui';
import TxIndicators from 'modules/app/components/TxIndicators';
import { InternalLink } from 'modules/app/components/InternalLink';

export function NewAddressSuccess(): JSX.Element {
  return (
    <Flex sx={{ flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
      <Text as="h3" variant="smallHeading">
        Your request has been submitted to DUX team for verification
      </Text>
      <Flex sx={{ my: 4 }}>
        <TxIndicators.Success sx={{ width: 6 }} />
      </Flex>
      <Text as="p" variant="secondary" sx={{ textAlign: 'center' }}>
        Please allow 24-48 to process the request, upon which you can continue the migration steps by
        connecting your previously submitted wallet address.
      </Text>
      <InternalLink href="/" title="View homepage">
        <Button sx={{ mt: 4, minWidth: '300px' }}>Back to home</Button>
      </InternalLink>
    </Flex>
  );
}
