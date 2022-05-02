import React from 'react';
import { Box, Text, Card } from 'theme-ui';
import { markdownToHtml } from 'lib/markdown';
import { GetStaticProps } from 'next';
import { HeadComponent } from 'modules/app/components/layout/Head';

const cookiesPolicyText = `
### Use of Cookies and Similar Technologies
The Site is using cookies. Cookies are small text files that are placed on your computer by websites that you visit. They are widely used in order to make websites work, or work more efficiently, as well as to provide information to the owners of the site. Cookies are typically stored on your computer's hard drive. Information collected from cookies is used by us to evaluate the effectiveness of our Site and analyze trends. The information collected from cookies allows us to determine such things as which parts of the Site are most visited and difficulties our visitors may experience in accessing the SIte. With this knowledge, we can improve the quality of your experience on the Site by recognizing and delivering more of the most desired features and information, as well as by resolving access difficulties.

We use third party service providers, to assist us in better understanding the use of our Site. Our service providers will place cookies on the hard drive of your computer (or use similar technologies) and will receive information that we select that will educate us on such things as how visitors navigate around our Site. This information is aggregated to provide statistical data about our users' browsing actions and patterns, and does not personally identify individuals. This information may include:

Computer or mobile device information,
Website usage information, such as:

- Page views,
- Button clicks,
- Input form changes (without the values being entered),
- Errors.

Our service providers analyses this information and provides us with aggregate reports. The information and analysis provided by our service providers will be used to assist us in better understanding our visitors' interests in our Site and how to better serve those interests. If you want to avoid using cookies altogether, you can disable cookies in your browser. However, disabling cookies might make it impossible for you to use certain features of the Site. Your use of the Site with a browser that is configure to accept cookies constitutes an acceptance of our and third-party cookies.
`;

export default function CookiesPolicy(props: { content: string }): React.ReactElement {
  return (
    <Box>
      <HeadComponent title="Cookies Policy" />
      <Text sx={{ textAlign: 'center' }}>
        <h2>Cookies Policy</h2>
      </Text>
      <Card sx={{ overflowY: 'auto' }}>
        <div dangerouslySetInnerHTML={{ __html: props.content || '' }} />
      </Card>
    </Box>
  );
}

export const getStaticProps: GetStaticProps = async () => {
  const content = await markdownToHtml(cookiesPolicyText);

  return {
    props: {
      content
    }
  };
};
