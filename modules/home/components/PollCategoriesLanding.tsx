import { Flex, Box, Heading } from 'theme-ui';
import { PollCategoryTag } from 'modules/polling/components/PollCategoryTag';
import { InternalLink } from 'modules/app/components/InternalLink';
import { TagCount } from 'modules/app/types/tag.dt';

type Props = {
  pollCategories: TagCount[];
};

export const PollCategoriesLanding = ({ pollCategories }: Props): JSX.Element => (
  <Flex sx={{ flexDirection: 'column', alignItems: 'center', mt: 5 }}>
    <Heading sx={{ mb: 3 }}>Show me more polls related to</Heading>
    <Flex sx={{ flexWrap: 'wrap', justifyContent: 'center', maxWidth: '1000px', margin: 'auto' }}>
      {pollCategories
        .filter(category => category.id !== 'uncategorized')
        .sort((a, b) => (a.count > b.count ? -1 : 1))
        .slice(0, 11)
        .map(category => (
          <Box key={category.id} sx={{ my: 3, mx: 4 }}>
            <InternalLink
              href={'/polling'}
              queryParams={{ category: category.id }}
              title={`${category.shortname} polls`}
            >
              <PollCategoryTag tag={category} />
            </InternalLink>
          </Box>
        ))}
    </Flex>
  </Flex>
);
