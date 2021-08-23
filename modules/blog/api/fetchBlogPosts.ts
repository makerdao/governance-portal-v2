import { BlogPost } from '../types/blogPost';
import axios from 'axios';
import { GOV_BLOG_POSTS_ENDPOINT } from '../blog.constants';
import { BlogWordpressDetail, BlogWordpressMediaResponse, BlogWordpressResponse } from '../types/blogWordpressApi';
import { config } from 'lib/config';
import { fsCacheGet, fsCacheSet } from 'lib/fscache';

export async function fetchBlogPosts(): Promise<BlogPost[]> {

  // Check first from cache
  if (config.USE_FS_CACHE) {
    const cachedBlogPosts = fsCacheGet('blogPosts');

    if (cachedBlogPosts) {
      return JSON.parse(cachedBlogPosts);
    }
  }

  // List of last 3 posts
  const response = await axios.get<BlogWordpressResponse>(GOV_BLOG_POSTS_ENDPOINT);

  const results = await Promise.all(response.data.map(async item => {
    // Get the blog post detail to fetch the image and the date
    const itemResponse = await axios.get<BlogWordpressDetail>(item._links.self[0].href);

    // Fetch the media image URL
    const mediaResponse = await axios.get<BlogWordpressMediaResponse>(itemResponse.data._links['wp:featuredmedia'][0].href);

    const photoHref = mediaResponse.data ?  mediaResponse.data.media_details.sizes.medium.source_url: '';

    return {
      title: item.title.rendered,
      link: item.url,
      date: new Date(itemResponse.data.date),
      photoHref
    } as BlogPost;
  }));

  if (config.USE_FS_CACHE) {
    fsCacheSet('blogPosts', JSON.stringify(results));
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

