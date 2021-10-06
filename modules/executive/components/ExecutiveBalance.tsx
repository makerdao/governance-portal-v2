import { Flex, Box, Text } from 'theme-ui';
import Skeleton from 'modules/app/components/SkeletonThemed';
import Deposit from '../../mkr/components/Deposit';
import Withdraw from '../../mkr/components/Withdraw';

type Props = {
  lockedMkr: any;
  voteDelegate?: any;
  voteProxy?: any;
};

export const ExecutiveBalance = ({ lockedMkr, voteDelegate, voteProxy }: Props) => (
  <Flex sx={{ alignItems: [null, 'center'], flexDirection: ['column', 'row'] }}>
    <Flex>
      <Text sx={{ mr: 1 }}>
        {voteDelegate ? 'In delegate contract:' : voteProxy ? 'In proxy contract:' : 'In voting contract:'}{' '}
      </Text>
      {lockedMkr ? (
        <Text sx={{ fontWeight: 'bold' }} data-testid="locked-mkr">
          {lockedMkr.toBigNumber().toFormat(6)} MKR
        </Text>
      ) : (
        <Box sx={{ width: 6 }}>
          <Skeleton />
        </Box>
      )}
    </Flex>
    {!voteDelegate && (
      <Flex sx={{ mt: [3, 0], alignItems: 'center' }}>
        <Deposit sx={{ ml: [0, 3] }} />
        <Withdraw sx={{ ml: 3 }} />
      </Flex>
    )}
  </Flex>
);
