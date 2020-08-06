import { Text, Box, Image, Link as ExternalLink } from 'theme-ui';
import BlogPost from '../../types/blogPost';

type Props = {
  blogPost: BlogPost;
};

export default ({ blogPost, ...otherProps }: Props) => (
  <ExternalLink
    target="_blank"
    variant="card"
    href={blogPost.link}
    sx={{ p: [0, 0], borderRadius: 'medium' }}
    {...otherProps}
  >
    <Box>
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
        px={3}
        pt={3}
        sx={{
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          fontSize: 4,
          textAlign: 'left'
        }}
      >
        {blogPost.title}
      </Text>
      <Text p={3} sx={{ textAlign: 'left', color: 'onSecondary' }}>
        {new Date(blogPost.date).toLocaleString('default', {
          month: 'long',
          day: 'numeric',
          year: 'numeric'
        })}
      </Text>
    </Box>
  </ExternalLink>
);
