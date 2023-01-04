/*

SPDX-FileCopyrightText: © 2023 Dai Foundation <www.daifoundation.org>

SPDX-License-Identifier: AGPL-3.0-or-later

*/

export type Tag = {
  id: string;
  shortname: string;
  longname: string;
  description?: string;
  recommend_ui?: boolean;
  related_link?: string;
  precedence?: number;
};

export type TagCount = Tag & {
  count: number;
};
