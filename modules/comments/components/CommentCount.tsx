import InternalIcon from 'modules/app/components/Icon';
import { Text, Flex } from 'theme-ui';

export default function CommentCount({ count }: { count: number }): React.ReactElement {
  return (
    <Flex sx={{ alignItems: 'center' }}>
      <InternalIcon name="comment" />
      <Text as="p" variant="caps" sx={{ ml: 2 }}>
        {count} Comment{count > 1 ? 's' : ''}
      </Text>
    </Flex>
  );
}
