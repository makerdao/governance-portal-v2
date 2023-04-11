/*

SPDX-FileCopyrightText: © 2023 Dai Foundation <www.daifoundation.org>

SPDX-License-Identifier: AGPL-3.0-or-later

*/

export async function postRequestToDiscord({
  url,
  content,
  notify
}: {
  url: string;
  content: string;
  notify: boolean;
}) {
  const contentString = `${'```'}${content}${'```'}${notify ? '<@&869997200208441344>' : ''}`;
  const resp = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ content: contentString })
  });
  return resp;
}
