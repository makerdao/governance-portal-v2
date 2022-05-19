import TagComponent from 'modules/app/components/Tag';
import { Tag } from 'modules/app/types/tag.dt';
import { Box, Flex } from 'theme-ui';

export default function DelegateTags({ tags }: { tags: Tag[] }): React.ReactElement {
  const tagColors = {
    profitability: {
      color: 'tagColorOne',
      backgroundColor: 'tagColorOneBg'
    }
  };

  return (
    <Flex>
      {tags.map(tag => (
        <Box
          key={tag.id}
          sx={{
            m: 2
          }}
        >
          <TagComponent
            tag={tag}
            color={tagColors[tag.id]?.color}
            backgroundColor={tagColors[tag.id]?.backgroundColor}
          />
        </Box>
      ))}
    </Flex>
  );
}
