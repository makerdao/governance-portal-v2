import { Delegate } from '../types';
import { Flex, Text } from 'theme-ui';

import { DelegatePicture } from 'modules/delegates/components';

export default function DelegateAvatarNameLight({ delegate }: { delegate: Delegate }): React.ReactElement {
  return (
    <Flex sx={{ alignItems: 'center', gap: 2 }}>
      <DelegatePicture delegate={delegate} />
      <Text sx={{ color: 'primary', fontWeight: 'semiBold' }}>{delegate.name}</Text>
    </Flex>
  );
}
