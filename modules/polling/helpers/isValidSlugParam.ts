// example of valid slug 'QmRswbkm'
export const isValidSlugParam = (slug: string): boolean => {
  return typeof slug === 'string' && slug.length === 8;
};
