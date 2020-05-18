import remark from 'remark';
import html from 'remark-html';

export function bigNumberKFormat(num) {
  // why isn't instance of on the Currency class working here?
  if (!num || !num.symbol || !num.toBigNumber) {
    throw new Error('bigNumberKFormat must recieve a maker currency object');
  }
  const units = ['k', 'm', 'G', 'T', 'P', 'E', 'Z', 'Y'];
  const typeIndex = Math.floor(num.toFixed(0).length / 3) - 1;
  const value = num.div(Math.pow(1000, typeIndex));
  return `${value.toBigNumber().toFixed(2)} ${units[typeIndex - 1]}`;
}

export async function markdownToHtml(markdown) {
  const result = await remark()
    .use(html)
    .process(markdown);
  return result.toString();
}

export function timeoutPromise(ms, promise) {
  return new Promise((resolve, reject) => {
    const timeoutId = setTimeout(() => {
      reject('promise timeout');
    }, ms);
    promise.then(
      res => {
        clearTimeout(timeoutId);
        resolve(res);
      },
      err => {
        clearTimeout(timeoutId);
        reject(err);
      }
    );
  });
}
