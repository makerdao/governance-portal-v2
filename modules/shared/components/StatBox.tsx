import { Box, Text, Flex, ThemeUIStyleObject } from 'theme-ui';
import Skeleton from 'components/SkeletonThemed';

type Props = {
  value: string | JSX.Element;
  label: string;
  styles?: ThemeUIStyleObject;
};

export const StatBox = ({ value, label, styles }: Props): JSX.Element => {
  return (
    <Flex
      sx={{
        flexDirection: 'column',
        m: 1,
        ...styles
      }}
    >
      <Box sx={{ height: '30px' }}>
        {value ? (
          <Text
            as="p"
            sx={{
              color: 'secondaryAlt',
              fontWeight: 'semiBold',
              fontSize: [3, 5]
            }}
          >
            {value}
          </Text>
        ) : (
          <Box sx={{ width: 5 }}>
            <Skeleton />
          </Box>
        )}
      </Box>
      <Text
        as="p"
        sx={{
          color: 'secondaryEmphasis',
          fontSize: [1, 3]
        }}
      >
        {label}
      </Text>
    </Flex>
  );
};
