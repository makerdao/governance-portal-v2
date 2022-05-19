import { Tag } from 'modules/app/types/tag.dt';

// TODO: This data should come from a prefetched static file.

export function getDelegateTags(): Tag[] {
  return [
    {
      id: 'sustainability',
      shortname: 'Sustainability',
      longname: 'Sustainability',
      description: 'Sustainability is something. Lorem ipsum lorem ipsum'
    },
    {
      id: 'multichain',
      shortname: 'multichain',
      longname: 'multichain',
      description: 'multichain is something. Lorem ipsum lorem ipsum'
    },
    {
      id: 'profitability',
      shortname: 'profitability',
      longname: 'profitability',
      description: 'profitability is something. Lorem ipsum lorem ipsum'
    }
  ];
}
