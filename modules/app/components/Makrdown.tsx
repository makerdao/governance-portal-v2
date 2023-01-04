/*

SPDX-FileCopyrightText: © 2023 Dai Foundation <www.daifoundation.org>

SPDX-License-Identifier: AGPL-3.0-or-later

*/

import { markdownToHtml } from 'lib/markdown';
import React, { useEffect, useState } from 'react';

export default function Markdown({ text }: { text: string }): React.ReactElement {
  const [content, setContent] = useState('');

  useEffect(() => {
    const renderComment = async () => {
      const rendered = await markdownToHtml(text);
      setContent(rendered);
    };

    renderComment();
  }, [text]);
  return <div dangerouslySetInnerHTML={{ __html: content }}></div>;
}
