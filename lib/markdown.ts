/*

SPDX-FileCopyrightText: © 2023 Dai Foundation <www.daifoundation.org>

SPDX-License-Identifier: AGPL-3.0-or-later

*/

import remarkGfm from 'remark-gfm';

import rehypeStringify from 'rehype-stringify';
import remarkParse from 'remark-parse';
import { unified } from 'unified';
import remarkRehype from 'remark-rehype';
import rehypeSanitize from 'rehype-sanitize';

export async function markdownToHtml(markdown: string, limited?: boolean): Promise<string> {
  const optionsSanitize = limited ? { tagNames: ['a', 'ul', 'li', 'strong', 'em', 'b'] } : {};
  const result = await unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkRehype)
    .use(rehypeSanitize, optionsSanitize)
    .use(rehypeStringify)
    .process(markdown);
  return result.toString().replace(/<a href/g, '<a target="_blank" href');
}
