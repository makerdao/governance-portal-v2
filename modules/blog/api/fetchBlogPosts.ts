import { BlogPost } from '../types/blogPost';


export async function fetchBlogPosts(): Promise<BlogPost[]> {
  // these are not just mocks anymore, but the actual blog posts that should be shown in production
  return require('./mocks/blogPosts.json');

  // to add a new post to the json file:
  //
  // 1. use the search API endpoint to quickly find a post, e.g.:
  // https://blog.makerdao.com/wp-json/wp/v2/search?search=complete+decentralization
  //
  // 2. open ._links.self[0].href in the search result, e.g.:
  // https://blog.makerdao.com/wp-json/wp/v2/posts/6268
  //
  // 3. see the commented-out code below for how to create the BlogPost object

  // const posts = await fetch(GOV_BLOG_POSTS_ENDPOINT).then(res => res.json());
  // const photoLinks: string[] = await Promise.all(
  //   posts.map(post => fetch(post._links['wp:featuredmedia'][0].href).then(res => res.json()))
  // ).then(photosMeta => (photosMeta as any).map(photoMeta => photoMeta.media_details.sizes.medium_large.source_url));

  // return posts.map((post, index) => ({
  //   link: post.link,
  //   title: post.title.rendered,
  //   date: post.date,
  //   photoHref: photoLinks[index]
  // }));
}
