export function subscribeToNewsletter(email: string): Promise<void> {
  const httpRequest = new XMLHttpRequest();

  return new Promise((resolve, reject) => {
    httpRequest.onreadystatechange = () => {
      if (httpRequest.readyState === XMLHttpRequest.DONE) {
        if (httpRequest.status === 200) {
          resolve();
        } else {
          reject();
        }
      }
    };

    httpRequest.onerror = () => {
      reject();
    };

    httpRequest.open(
      'POST',
      'https://578v7re7h2.execute-api.us-east-2.amazonaws.com/default/addContactToMailingList',
      true
    );

    httpRequest.setRequestHeader('Content-Type', 'application/json');

    httpRequest.send(
      JSON.stringify({
        email: email
      })
    );
  });
}
