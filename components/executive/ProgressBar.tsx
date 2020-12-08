import { Flex, Box, Text } from 'theme-ui';

function CircleNumber({ selected = false, num }: { selected?: boolean; num: number }): JSX.Element {
  return (
    <Box
      sx={{
        width: '20px',
        minWidth: '20px',
        lineHeight: '20px',
        borderRadius: '50%',
        textAlign: 'center',
        fontSize: '1',
        backgroundColor: selected ? 'primary' : 'badgeGrey',
        color: 'white',
        fontWeight: 'bold',
        mr: 1
      }}
    >
      {num}
    </Box>
  );
}

export default function ProgressBar({ step }: { step: number }): JSX.Element {
  const stepTexts = ['Withdraw', 'Deposit', 'Vote to Activate'];

  return (
    <Flex>
      {stepTexts.map((text, i) => (
        <Flex key={i} sx={{ alignItems: 'center', mr: [3, 4] }}>
          <CircleNumber num={i + 1} selected={i === step} />
          <Text
            sx={{
              mx: 2,
              fontSize: '12px',
              fontWeight: 'bold',
              color: i === step ? 'primary' : '#9FAFB9',
              textTransform: 'uppercase',
              display: [i === step ? 'block' : 'none', 'block']
            }}
          >
            {text}
          </Text>
        </Flex>
      ))}
    </Flex>
  );
}
