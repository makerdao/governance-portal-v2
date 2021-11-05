import { BlogPost } from '../types/blogPost';
import { GOV_BLOG_POSTS_ENDPOINT } from '../blog.constants';
import {
  BlogWordpressDetail,
  BlogWordpressMediaResponse,
  BlogWordpressResponse
} from '../types/blogWordpressApi';
import { config } from 'lib/config';
import { fsCacheGet, fsCacheSet } from 'lib/fscache';

export async function fetchBlogPosts(): Promise<BlogPost[]> {
  const cacheKey = 'blogPosts';
  // Check first from cache
  if (config.USE_FS_CACHE) {
    const cachedBlogPosts = fsCacheGet(cacheKey);

    if (cachedBlogPosts) {
      return JSON.parse(cachedBlogPosts);
    }
  }

  // List of last 3 posts
  const response: BlogWordpressResponse = await (await fetch(GOV_BLOG_POSTS_ENDPOINT)).json();

  const results = await Promise.all(
    response.map(async item => {
      // Get the blog post detail to fetch the image and the date
      const itemResponse: BlogWordpressDetail = await (await fetch(item._links.self[0].href)).json();

      // Fetch the media image URL
      const mediaResponse: BlogWordpressMediaResponse = await (
        await fetch(itemResponse._links['wp:featuredmedia'][0].href)
      ).json();

      const photoHref = mediaResponse ? mediaResponse.media_details.sizes.medium.source_url : '';

      return {
        title: item.title.rendered,
        link: item.link,
        date: new Date(itemResponse.date),
        photoHref
      } as BlogPost;
    })
  );

  if (config.USE_FS_CACHE) {
    fsCacheSet(cacheKey, JSON.stringify(results));
  }

  return results;

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
