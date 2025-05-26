/*

SPDX-FileCopyrightText: © 2023 Dai Foundation <www.daifoundation.org>

SPDX-License-Identifier: AGPL-3.0-or-later

*/

import { SpellData } from './spellData';

export type GithubProposal = {
  path: string;
  metadata: {
    title: string;
    summary: string;
    date: string;
    address: string;
  };
};

export type CMSProposal = {
  active: boolean;
  address: string;
  key: string;
  proposalBlurb: string;
  title: string;
  date: string;
  proposalLink: string;
  spellData?: {
    skySupport: string;
  };
};

export type Proposal = CMSProposal & {
  content?: string;
  spellData: SpellData;
};
