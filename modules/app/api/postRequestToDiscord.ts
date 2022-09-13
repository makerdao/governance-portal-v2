export async function postRequestToDiscord({
  url,
  content,
  notify
}: {
  url: string;
  content: string;
  notify: boolean;
}) {
  const resp = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: `${'```'}${content}${'```'}${notify ? ' @DUX' : ''}`
  });

  return resp;
}
