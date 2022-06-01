export type Tag = {
  id: string;
  shortname: string;
  longname: string;
  description?: string;
  recommend_ui?: boolean;
  related_link?: string;
  precedence?: number;
};

export type TagCount = Tag & {
  count: number;
};
