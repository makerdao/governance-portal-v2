import { Flex, Box, Heading } from 'theme-ui';
import { PollCategoryTag } from 'modules/polling/components/PollCategoryTag';
import { PollCategory } from 'modules/polling/types';
import { InternalLink } from 'modules/app/components/InternalLink';

type Props = {
  pollCategories: PollCategory[];
};

export const PollCategoriesLanding = ({ pollCategories }: Props): JSX.Element => (
  <Flex sx={{ flexDirection: 'column', alignItems: 'center', mt: 5 }}>
    <Heading sx={{ mb: 3 }}>Show me more polls related to</Heading>
    <Flex sx={{ flexWrap: 'wrap', justifyContent: 'center', maxWidth: '1000px', margin: 'auto' }}>
      {pollCategories.map(category => (
        <Box key={category.name} sx={{ my: 3, mx: 4 }}>
          <InternalLink
            href={'/polling'}
            queryParams={{ category: category.name }}
            title={`${category.name} polls`}
          >
            <PollCategoryTag category={category.name} />
          </InternalLink>
        </Box>
      ))}
    </Flex>
  </Flex>
);
