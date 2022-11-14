export function getTestBreakout(): boolean {
  return process.env.APP_ENV === 'test';
}
