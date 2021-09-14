export function limitString(str: string, length: number, overflow: string): string {
  return str.length <= length ? str : `${str.substr(0, length - 1)}${overflow}`;
}

export function cutMiddle(text = '', left = 6, right = 4): string {
  if (text.length <= left + right) return text;
  return `${text.substring(0, left)}...${text.substring(text.length - right, text.length)}`;
}
