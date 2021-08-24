import matter from 'gray-matter';
import { getNetwork } from 'lib/maker';
import { CMSProposal } from 'types/proposal';
import { ethers } from 'ethers';
import { slugify } from 'lib/utils';

export function parseExecutive(
    proposalDoc: string,
    proposalIndex: Record<string, string[]>,
    proposalLink: string
  ): CMSProposal | null {
    const network = getNetwork();
  
    const {
      content,
      data: { title, summary, address, date }
    } = matter(proposalDoc);
    // Remove empty docs
    if (!(content && title && summary && address && date)) {
      console.log('executive missing required field, skipping executive: ', title);
      return null;
    }
  
    //remove if address is not a valid address
    try {
      ethers.utils.getAddress(address);
    } catch (_) {
      console.log('invalid address: ', address, ' skipping executive: ', title);
      return null;
    }
  
    //remove if date is invalid
    if (!(date instanceof Date) || isNaN(date.getTime())) {
      console.log('invalid date: ', date, ' skipping executive: ', title);
      return null;
    }
  
    //remove `Template - [Executive Vote] ` from title
    const editedTitle = title.replace('Template - [Executive Vote] ', '');
  
    return {
      about: content,
      content: content,
      title: editedTitle,
      proposalBlurb: summary,
      key: slugify(title),
      address: address,
      date: String(date),
      active: proposalIndex[network].includes(proposalLink)
    };
  }
  