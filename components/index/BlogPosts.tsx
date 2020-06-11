import { Heading, Container, Text, Box, Image, Flex, Card, Link as ExternalLink } from 'theme-ui';
import BlogPost from '../../types/blogPost';

type Props = {
  blogPost: BlogPost;
};

export default ({ blogPost }: Props) => (
  <Box sx={{ width: 7 }}>
    <ExternalLink target="_blank" variant="card" href={blogPost.link}>
      <Card key={blogPost.title} sx={{ p: 0, borderRadius: 'medium' }}>
        <Image
          src={blogPost.photoHref}
          sx={{
            objectFit: 'cover',
            height: 7,
            width: '100%',
            backgroundColor: 'silver'
          }}
        />

        <Text
          p={3}
          sx={{
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            fontSize: 3,
            textAlign: 'left'
          }}
        >
          {blogPost.title}
        </Text>
        <Text px={3} pb={3} sx={{ textAlign: 'left' }}>
          {new Date(blogPost.date).toLocaleString('default', {
            month: 'long',
            day: 'numeric',
            year: 'numeric'
          })}
        </Text>
      </Card>
    </ExternalLink>
  </Box>
);
