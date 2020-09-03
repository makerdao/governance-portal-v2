export type CMSProposal = {
  address: string;
  key: string;
  content: string;
  about: string;
  proposalBlurb: string;
  title: string;
  date: string;
};

export type RawAddressProposal = {
  address: string;
  key: string;
};

type Proposal = CMSProposal | RawAddressProposal;

export default Proposal;
