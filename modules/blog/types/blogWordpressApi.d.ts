export type BlogWordpressListItem = {
  title: {
    rendered: string;
  };
  link: string;
  _links: {
    self: [
      {
        href: string;
      }
    ];
  };
};

export type BlogWordpressResponse = BlogWordpressListItem[];

export type BlogWordpressDetail = {
  date: string;
  link: string;
  _links: {
    'wp:featuredmedia': [
      {
        href: string;
      }
    ];
  };
};

export type BlogWordpressMediaResponse = {
  media_details: {
    sizes: {
      medium: {
        source_url: string;
      };
    };
  };
};
