import matter from 'gray-matter';
import { CMSProposal } from 'modules/executives/types';
import { ethers } from 'ethers';
import { slugify } from 'lib/utils';
import { SupportedNetworks } from 'lib/constants';

export function parseExecutive(
    proposalDoc: string,
    proposalIndex: Record<string, string[]>,
    proposalLink: string,
    network: SupportedNetworks
  ): CMSProposal | null {
  
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
  