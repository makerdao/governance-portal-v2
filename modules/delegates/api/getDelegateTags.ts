/*

SPDX-FileCopyrightText: © 2023 Dai Foundation <www.daifoundation.org>

SPDX-License-Identifier: AGPL-3.0-or-later

*/

import { Tag } from 'modules/app/types/tag';

import delegateTags from 'modules/tags/constants/delegates-tags-definitions.json';

export function getDelegateTags(): Tag[] {
  return delegateTags;
}
