export type CMSProposal = {
  active: boolean;
  address: string;
  key: string;
  content?: string;
  about: string;
  proposalBlurb: string;
  title: string;
  date: string;
};

export type RawAddressProposal = {
  address: string;
  key: string;
};

export type Proposal = CMSProposal | RawAddressProposal;
