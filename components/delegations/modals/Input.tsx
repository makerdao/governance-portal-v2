import { Button, Box, Flex, Text } from '@theme-ui/components';
import MKRInput from 'components/MKRInput';
import Skeleton from 'react-loading-skeleton';

const InputContent = ({ onChange, error, ref, bpi, disabled, onMkrClick, mkrBalance, onClick }) => (
  <Flex sx={{ flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
    <Text variant="microHeading" sx={{ fontSize: [3, 6] }}>
      Deposit into delegate contract
    </Text>
    <Text sx={{ color: 'secondaryEmphasis', mt: 2 }}>
      Input the amount of MKR to deposit into the delegate contract.
    </Text>
    <Box sx={{ mt: 3, width: '20rem' }}>
      <Flex sx={{ border: '1px solid #D8E0E3', justifyContent: 'space-between' }}>
        <MKRInput
          onChange={onChange}
          placeholder="0.00 MKR"
          error={error}
          style={{ border: '0px solid', width: bpi < 1 ? '100%' : null, m: 0 }}
          ref={ref}
        />
        <Button
          disabled={disabled}
          variant="textual"
          sx={{ width: '100px', fontWeight: 'bold' }}
          onClick={onMkrClick}
        >
          Set max
        </Button>
      </Flex>
      <Flex sx={{ alignItems: 'baseline', mb: 3, alignSelf: 'flex-start' }}>
        <Text
          sx={{
            textTransform: 'uppercase',
            color: 'secondaryEmphasis',
            fontSize: 1,
            fontWeight: 'bold'
          }}
        >
          MKR Balance:&nbsp;
        </Text>
        {mkrBalance ? (
          <Text sx={{ cursor: 'pointer', fontSize: 2, mt: 2 }} onClick={onMkrClick}>
            {mkrBalance.toBigNumber().toFormat(6)}
          </Text>
        ) : (
          <Box sx={{ width: 6 }}>
            <Skeleton />
          </Box>
        )}
      </Flex>
      <Button onClick={onClick} sx={{ width: '100%' }}>
        Delegate MKR
      </Button>
    </Box>
  </Flex>
);

export default InputContent;
