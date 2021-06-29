import { forwardRef } from 'react';
import { Button, Box, Flex, Text } from '@theme-ui/components';
import MKRInput from 'components/MKRInput';
import Skeleton from 'react-loading-skeleton';

type Props = {
  title: string;
  description: string;
  onChange: any;
  error: string;
  bpi: number;
  disabled: boolean;
  onMkrClick: () => void;
  mkrBalance: any;
  buttonLabel: string;
  onClick: () => void;
};

const InputContent = forwardRef<HTMLInputElement, Props>(
  (
    {
      title,
      description,
      onChange,
      error,
      bpi,
      disabled,
      onMkrClick,
      mkrBalance,
      buttonLabel,
      onClick
    }: Props,
    ref
  ): JSX.Element => (
    <Flex
      sx={{ flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}
    >
      <Text variant="microHeading" sx={{ fontSize: [3, 6] }}>
        {title}
      </Text>
      <Text sx={{ color: 'secondaryEmphasis', mt: 3 }}>{description}</Text>
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
        <Button onClick={onClick} sx={{ width: '100%', mt: 3 }}>
          {buttonLabel}
        </Button>
      </Box>
    </Flex>
  )
);

export default InputContent;
