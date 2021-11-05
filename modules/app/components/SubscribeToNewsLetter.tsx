import { subscribeToNewsletter } from 'lib/services/emailSubscription';
import { isValidEmail } from 'lib/validators/email';
import { useState } from 'react';
import { Box, Flex, Input, Button, Text, jsx } from 'theme-ui';
import { Icon } from '@makerdao/dai-ui-icons';

export function SubscribeToNewsletter(): React.ReactElement {
  const [email, setEmail] = useState('');
  const [subscribeState, setSubscribeState] = useState('');
  const [message, setMessage] = useState('');

  const updateEmail = evt => {
    setEmail(evt.target.value);
    setMessage('');
    setSubscribeState('');
  };

  const subscribeEmail = async () => {
    if (!isValidEmail(email)) {
      setMessage('Please enter a valid email address.');
      setSubscribeState('failure');
      return;
    }

    setMessage('Loading...');

    try {
      await subscribeToNewsletter(email);

      setSubscribeState('success');
      setMessage("Thank you. You'll hear from us soon.");
    } catch (e) {
      setSubscribeState('failure');
      setMessage('An error occurred. Please try again later.');
    }
  };

  return (
    <Box>
      <Flex sx={{ width: '284px', flexDirection: 'row' }} mt="1.2rem">
        <Input
          py="xs"
          placeholder="Sign up for our newsletter"
          sx={{
            fontSize: 15,
            borderRadius: '5px 0px 0px 5px',
            '::placeholder': {
              color: 'formGrey',
              opacity: 1,
              fontWeight: '200'
            },
            ':focus': { borderColor: 'secondary' },
            maxWidth: '320px'
          }}
          name="email"
          type="email"
          value={email}
          onChange={evt => updateEmail(evt)}
        />

        <Button
          variant="outline"
          type="submit"
          onClick={subscribeEmail}
          sx={{
            padding: '0px',
            paddingTop: '4px',
            width: '44px',
            border: '1px solid',
            borderColor: 'secondary',
            borderLeft: 0,
            borderRadius: '0px 5px 5px 0px',
            ':hover': { borderColor: 'secondary' },
            ':hover svg': { transform: 'translate(0.25rem)' },
            svg: {
              margin: '0 auto',
              transition: 'transform 0.125s'
            }
          }}
        >
          <Icon name="subscribe_arrow" />
        </Button>
      </Flex>
      <Box>
        <Text as="p" sx={{ fontSize: '14px', color: 'secondary' }}>
          {message}
        </Text>
      </Box>
    </Box>
  );
}
