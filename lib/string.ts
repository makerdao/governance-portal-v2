export function limitString(str: string, length: number, overflow: string): string {
  return str.length <= length ? str : `${str.substr(0, length - 1)}${overflow}`;
}
