import { Flex, Text, Button } from 'theme-ui';
import TxIndicators from 'modules/app/components/TxIndicators';
import { InternalLink } from 'modules/app/components/InternalLink';

export function NewDelegateContract(): JSX.Element {
  return (
    <Flex sx={{ flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
      <Text as="h3" variant="smallHeading">
        Success!
      </Text>
      <Flex sx={{ my: 4 }}>
        <TxIndicators.Success sx={{ width: 6 }} />
      </Flex>
      <Text as="p" variant="secondary" sx={{ textAlign: 'center' }}>
        Your new wallet has been linked to your previous wallet. You are now ready to create your new delegate
        contract. Please proceed to the Account page to create the new contract.
      </Text>
      <InternalLink href="/account" title="View homepage">
        <Button sx={{ mt: 4, minWidth: '300px' }}>Account page</Button>
      </InternalLink>
    </Flex>
  );
}
