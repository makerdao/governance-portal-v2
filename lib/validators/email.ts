// prettier-ignore
// eslint-disable-next-line
const rfc2822EmailRegex = /[a-z0-9!#$%&'*+\/=?^_{|}~-]+(?:\.[a-z0-9!#$%&'*+\/=?^_{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9][a-z0-9-]*[a-z0-9]/;

export function isValidEmail(email: string): boolean {
  return rfc2822EmailRegex.test(email);
}
