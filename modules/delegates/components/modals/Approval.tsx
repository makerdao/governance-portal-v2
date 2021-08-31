import { Button, Flex, Text } from '@theme-ui/components';

export const ApprovalContent = ({ title, description, buttonLabel, onClick }) => (
  <Flex sx={{ flexDirection: 'column', textAlign: 'center' }}>
    <Text variant="microHeading" color="onBackgroundAlt">
      {title}
    </Text>
    <Text sx={{ color: 'secondaryEmphasis', mt: 3 }}>{description}</Text>
    <Button onClick={onClick} sx={{ width: '100%', mt: 3 }}>
      {buttonLabel}
    </Button>
  </Flex>
);
