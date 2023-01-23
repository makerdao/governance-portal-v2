// example of valid slug 'QmRswbkm'
export const isValidSlugParam = (slug: string): Boolean => {
  return typeof slug === 'string' && slug.length === 8;
};
