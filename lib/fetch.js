import fetch from 'isomorphic-unfetch';

const check = async (res) => {
  if (!res.ok) {
    throw new Error(`unable to fetch: ${res.status} - ${await res.text()}`);
  }
};

export default async function(...args) {
  const res = await fetch(...args);
  await check(res);
  return res.json();
}
