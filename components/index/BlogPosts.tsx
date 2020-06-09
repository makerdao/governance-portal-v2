import { Heading, Container, Text, Box, Image, Flex, Card } from 'theme-ui';
import BlogPost from '../../types/blogPost';

type Props = {
  blogPosts: BlogPost[];
};

export default ({ blogPosts }: Props) => (
  <Container
    mt="4"
    p="5"
    as="section"
    sx={{
      textAlign: 'center',
      backgroundColor: 'rgba(209, 222, 230, 0.14)',
      maxWidth: 'container'
    }}
  >
    <Heading as="h2" mb="4" mt="3">
      Recent Governance Blog Posts
    </Heading>
    <Box>
      <Flex sx={{ justifyContent: 'center' }} mb="5" mt="5">
        {blogPosts.map(post => (
          <Card key={post.title} mx={'20px'} sx={{ width: ['100%', '20vw'], borderRadius: 'medium' }} p={'0'}>
            <Image
              src={post.photoHref}
              sx={{
                objectFit: 'cover',
                height: ['100px', '20vw'],
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
              {post.title}
            </Text>
            <Text px={3} pb={3} sx={{ textAlign: 'left' }}>
              {new Date(post.date).toLocaleString('default', {
                month: 'long',
                day: 'numeric',
                year: 'numeric'
              })}
            </Text>
          </Card>
        ))}
      </Flex>
    </Box>
  </Container>
);
