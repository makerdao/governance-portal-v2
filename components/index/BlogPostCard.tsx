import { Text, Box, Image, Link as ExternalLink } from 'theme-ui';
import { BlogPost } from 'types/blogPost';

type Props = {
  blogPost: BlogPost;
};

const BlogPostCard = ({ blogPost, ...otherProps }: Props): JSX.Element => (
  <ExternalLink
    target="_blank"
    variant="card"
    href={blogPost.link}
    sx={{ p: [0, 0], borderRadius: 'medium', ':hover': { borderColor: 'onSecondary', boxShadow: 'faint' } }}
    {...otherProps}
  >
    <Box>
      <Image
        src={blogPost.photoHref}
        sx={{
          objectFit: 'cover',
          height: 7,
          width: '100%',
          backgroundColor: 'silver',
          borderRadius: '5px 5px 0px 0px'
        }}
      />

      <Text
        px={3}
        pt={3}
        sx={
          {
            textOverflow: 'ellipsis',
            fontSize: 4,
            textAlign: 'left',
            display: '-webkit-box',
            overflow: 'hidden',
            WebkitBoxOrient: 'vertical',
            WebkitLineClamp: 2
          } as any
        }
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

export default BlogPostCard;
