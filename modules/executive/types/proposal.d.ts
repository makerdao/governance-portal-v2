import { SpellData } from './spellData';

export type CMSProposal = {
  active: boolean;
  address: string;
  key: string;
  content?: string;
  about?: string;
  proposalBlurb: string;
  title: string;
  date: string;
  proposalLink: string;
  spellData?: any;
};

export type Proposal = CMSProposal & {
  // spellData: SpellData;
};
