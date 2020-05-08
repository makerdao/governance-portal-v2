export function bigNumberKFormat(num) {
  // why isn't instance of on the Currency class working here?
  if (!num || !num.symbol || !num.toBigNumber) {
    throw new Error('bigNumberKFormat must recieve a maker currency object');
  }
  const units = ['k', 'm', 'G', 'T', 'P', 'E', 'Z', 'Y'];
  const typeIndex = Math.floor(num.toFixed(0).length / 3);
  const value = num.div(Math.pow(1000, typeIndex));
  return `${value.toBigNumber().toFixed(2)} ${units[typeIndex - 1]}`;
}
