export async function postRequestToDiscord({
  url,
  content,
  notify
}: {
  url: string;
  content: string;
  notify: boolean;
}) {
  const contentString = `${'```'}${content}${'```'}${notify ? '@DUX' : ''}`;
  const resp = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ content: contentString })
  });
  return resp;
}
